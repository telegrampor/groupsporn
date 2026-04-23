"""
db_validator.py — Validação cruzada de todos os dados no banco.

Filosofia: "Foi salvo" só é verdade após um SELECT confirmar.
Nunca assume que um INSERT/UPDATE funcionou — sempre verifica.

Usado por: daily_publish.py, ai_content_generator.py, scraper.py
"""

import os
from typing import Optional
from supabase import create_client, Client
from utils.logger import Logger


class DBValidator:
    def __init__(self, supabase: Client, log: Logger):
        self.db  = supabase
        self.log = log

    # ─── Validação de grupo individual ───────────────────────

    def verify_group_saved(self, group_id: int, expected_slug: str) -> bool:
        """
        Verifica que um grupo existe no banco com o slug correto.
        Retorna True apenas se: existe + slug bate + não está corrompido.
        """
        try:
            res = self.db.table("groups")\
                .select("id, slug, name, indexing_status, quality_score, seo_description")\
                .eq("id", group_id)\
                .single()\
                .execute()

            row = res.data
            if not row:
                self.log.error(
                    f"Cross-check FALHOU: group_id={group_id} não encontrado no banco",
                    group_id=group_id, expected_slug=expected_slug
                )
                return False

            if row["slug"] != expected_slug:
                self.log.error(
                    f"Cross-check FALHOU: slug corrompido",
                    group_id=group_id,
                    expected=expected_slug,
                    found_in_db=row["slug"]
                )
                return False

            self.log.success(
                f"Cross-check OK: group_id={group_id}",
                db_id=row["id"],
                db_slug=row["slug"],
                db_status=row["indexing_status"],
                db_quality=row["quality_score"],
                seo_description_len=len(row.get("seo_description") or ""),
            )
            return True

        except Exception as exc:
            self.log.error(
                f"Cross-check EXCEÇÃO: group_id={group_id}",
                exc=exc,
                group_id=group_id
            )
            return False

    def verify_seo_description(self, group_id: int, min_length: int = 80) -> bool:
        """
        Garante que seo_description foi salva, não está vazia e tem tamanho mínimo.
        Impede que o sistema envie páginas 'vazias' ao Google.
        """
        try:
            res = self.db.table("groups")\
                .select("id, slug, seo_description")\
                .eq("id", group_id)\
                .single()\
                .execute()

            row = res.data
            desc = (row.get("seo_description") or "").strip()

            if not desc:
                self.log.warning(
                    f"seo_description VAZIA: group_id={group_id} — não está pronto para indexação",
                    group_id=group_id,
                    slug=row.get("slug"),
                    action="manter em draft até IA gerar descrição"
                )
                return False

            if len(desc) < min_length:
                self.log.warning(
                    f"seo_description muito curta: {len(desc)} chars (mínimo {min_length})",
                    group_id=group_id,
                    slug=row.get("slug"),
                    current_length=len(desc),
                    minimum=min_length,
                    preview=desc[:100]
                )
                return False

            self.log.success(
                f"seo_description OK: group_id={group_id}",
                length=len(desc),
                preview=desc[:80] + "…"
            )
            return True

        except Exception as exc:
            self.log.error(
                f"Erro ao verificar seo_description: group_id={group_id}",
                exc=exc
            )
            return False

    def verify_indexing_status_updated(
        self, group_id: int, expected_status: str
    ) -> bool:
        """
        Verifica que o indexing_status foi atualizado para o valor esperado.
        Ex: após publish_daily_batch(), verifica que virou 'published'.
        """
        try:
            res = self.db.table("groups")\
                .select("id, slug, indexing_status, published_at, submitted_at")\
                .eq("id", group_id)\
                .single()\
                .execute()

            row = res.data
            actual = row.get("indexing_status")

            if actual != expected_status:
                self.log.error(
                    f"Status NÃO atualizado: group_id={group_id}",
                    expected=expected_status,
                    found_in_db=actual,
                    group_id=group_id
                )
                return False

            self.log.success(
                f"Status confirmado no banco: {expected_status}",
                group_id=group_id,
                slug=row.get("slug"),
                published_at=str(row.get("published_at")),
                submitted_at=str(row.get("submitted_at")),
            )
            return True

        except Exception as exc:
            self.log.error(
                f"Erro ao verificar status: group_id={group_id}",
                exc=exc
            )
            return False

    # ─── Validação em lote ───────────────────────────────────

    def verify_batch_published(
        self, batch_number: int, expected_count: int
    ) -> dict:
        """
        Após publish_daily_batch(), verifica quantos realmente foram publicados.
        Compara expected_count com o que o SELECT retorna.
        """
        try:
            res = self.db.table("groups")\
                .select("id, slug, indexing_status, quality_score", count="exact")\
                .eq("batch_number", batch_number)\
                .eq("indexing_status", "published")\
                .execute()

            actual_count = res.count or 0
            rows = res.data or []

            # Detecta registros com quality_score < 40 que não deveriam ter passado
            low_quality = [r for r in rows if r["quality_score"] < 40]

            result = {
                "batch":          batch_number,
                "expected":       expected_count,
                "actual":         actual_count,
                "match":          actual_count == expected_count,
                "low_quality":    len(low_quality),
                "low_quality_ids": [r["id"] for r in low_quality],
            }

            if not result["match"]:
                self.log.error(
                    f"Lote {batch_number}: contagem diverge",
                    **result
                )
            else:
                self.log.success(
                    f"Lote {batch_number}: {actual_count} grupos confirmados no banco",
                    **result
                )

            if low_quality:
                self.log.warning(
                    f"{len(low_quality)} grupos com quality_score < 40 publicados",
                    ids=str([r['id'] for r in low_quality])
                )

            return result

        except Exception as exc:
            self.log.error(f"Erro ao verificar lote {batch_number}", exc=exc)
            return {"batch": batch_number, "match": False, "error": str(exc)}

    def verify_no_empty_descriptions_in_batch(
        self, batch_number: int
    ) -> dict:
        """
        Scan de segurança: garante que nenhum grupo publicado neste lote
        tem seo_description vazia. Se houver, reverte para 'queued'.
        """
        try:
            res = self.db.table("groups")\
                .select("id, slug, seo_description")\
                .eq("batch_number", batch_number)\
                .eq("indexing_status", "published")\
                .execute()

            rows = res.data or []
            empty = [
                r for r in rows
                if not (r.get("seo_description") or "").strip()
            ]

            if empty:
                # REVERTE para queued — não deixa ir ao Google sem descrição
                ids_to_revert = [r["id"] for r in empty]
                self.db.table("groups")\
                    .update({"indexing_status": "queued", "published_at": None})\
                    .in_("id", ids_to_revert)\
                    .execute()

                self.log.warning(
                    f"REVERTIDOS {len(empty)} grupos sem seo_description",
                    batch=batch_number,
                    reverted_ids=str(ids_to_revert),
                    action="status voltou para 'queued'"
                )
                return {"empty": len(empty), "reverted": True, "ids": ids_to_revert}

            self.log.success(
                f"Todos os {len(rows)} grupos do lote {batch_number} têm seo_description",
                batch=batch_number,
                total_checked=len(rows)
            )
            return {"empty": 0, "reverted": False}

        except Exception as exc:
            self.log.error(
                f"Erro no scan de descrições do lote {batch_number}",
                exc=exc
            )
            return {"error": str(exc)}
