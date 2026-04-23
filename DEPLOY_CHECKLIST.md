# Deploy Checklist — nsfw-directory

## PRÉ-DEPLOY
- [ ] Criar projeto Supabase NOVO (separado do canais18)
- [ ] Rodar 001_initial_schema.sql no SQL Editor do Supabase
- [ ] Criar bucket R2 no Cloudflare (público)
- [ ] Preencher .env.local com todas as variáveis
- [ ] `npm run build` → zero erros

## VALIDAÇÃO SSR (obrigatório antes de lançar)
- [ ] `npm run dev` → abrir http://localhost:3000
- [ ] Inspecionar View Source de uma página de grupo
- [ ] Confirmar: <h1> está no HTML (não gerado por JS)
- [ ] Confirmar: <title> está no HTML
- [ ] Confirmar: application/ld+json está no HTML
- [ ] `curl http://localhost:3000/SLUG | findstr "<h1"` retorna resultado

## SANDBOX (primeiros 50 grupos)
- [ ] Inserir 50 grupos manualmente com indexing_status='queued'
- [ ] `python scripts/ingestion/ai_content_generator.py`
- [ ] `python scripts/health_check.py` → confirmar 0 grupos sem seo_description
- [ ] `python scripts/ingestion/daily_publish.py`
- [ ] `python scripts/health_check.py` → confirmar 50 como 'submitted'
- [ ] Aguardar 24-48h → verificar Search Console

## DEPLOY VERCEL
- [ ] `git init && git add . && git commit -m "initial"`
- [ ] Criar repo no GitHub (NOVO, separado do canais18)
- [ ] Conectar no Vercel
- [ ] Adicionar env vars no Vercel dashboard
- [ ] Configurar domínio
- [ ] Testar: `curl https://DOMINIO/SLUG | grep "<h1"`

## PRODUÇÃO (após sandbox validado)
- [ ] Configurar Windows Task Scheduler:
      daily_publish.py → 16:30 UTC diário
      ai_content_generator.py → 08:00 UTC diário
      health_check.py → 09:00 UTC diário (log de saúde)
- [ ] Submeter sitemap.xml no Google Search Console
- [ ] Monitorar Core Web Vitals no PageSpeed Insights

## KPIs
Mês 1: 50 páginas indexadas, CWV verde
Mês 2: 3.000 páginas, primeiros rankings EN
Mês 3: 50k visitas/mês
Mês 4: 150k visitas/mês
Mês 5: 300k visitas/mês
Mês 6: 500k visitas/mês
