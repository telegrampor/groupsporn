"""
logger.py — Sistema de logs com evidências verificáveis.

Filosofia: um log só é válido se provar o que afirma.
- SUCCESS: sempre inclui prova (status code, registro confirmado no banco, etc.)
- FAILURE: sempre inclui contexto (qual URL, qual chave, qual segundo, qual erro exato)
- Nunca silencia exceções. Nunca usa bare except.
"""

import os
import sys
import json
import datetime
import traceback
from pathlib import Path
from typing import Any, Optional
from enum import Enum


class Level(str, Enum):
    INFO    = "INFO"
    SUCCESS = "SUCCESS"
    WARNING = "WARNING"
    ERROR   = "ERROR"
    FATAL   = "FATAL"


# Cores ANSI para terminal
COLORS = {
    Level.INFO:    "\033[36m",   # cyan
    Level.SUCCESS: "\033[32m",   # green
    Level.WARNING: "\033[33m",   # yellow
    Level.ERROR:   "\033[31m",   # red
    Level.FATAL:   "\033[35m",   # magenta
}
RESET = "\033[0m"


class Logger:
    def __init__(self, script_name: str, log_dir: str = "logs"):
        self.script_name = script_name
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        self.log_file = self.log_dir / f"{script_name}_{timestamp}.jsonl"

        self.counts = {l: 0 for l in Level}
        self.start_time = datetime.datetime.utcnow()
        self.entries: list[dict] = []

        self._write_entry(Level.INFO, f"=== Session started: {script_name} ===", {
            "pid": os.getpid(),
            "python": sys.version.split()[0],
            "log_file": str(self.log_file),
        })

    def _write_entry(self, level: Level, message: str, evidence: Optional[dict] = None):
        """Escreve uma entrada de log no arquivo JSONL e no terminal."""
        now = datetime.datetime.utcnow()
        elapsed = (now - self.start_time).total_seconds()

        entry = {
            "ts":       now.isoformat() + "Z",
            "elapsed":  round(elapsed, 2),
            "level":    level.value,
            "script":   self.script_name,
            "message":  message,
            "evidence": evidence or {},
        }

        # Arquivo: JSONL (uma linha por entrada, fácil de parsear)
        with open(self.log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

        # Terminal: colorido e legível
        color = COLORS.get(level, "")
        ts_str = now.strftime("%H:%M:%S")
        prefix = f"{color}[{level.value:7s}]{RESET}"
        print(f"{prefix} {ts_str} +{elapsed:6.1f}s  {message}")

        if evidence:
            for k, v in evidence.items():
                v_str = str(v)
                if len(v_str) > 200:
                    v_str = v_str[:200] + "…"
                print(f"           {'':8s}  ↳ {k}: {v_str}")

        self.counts[level] += 1
        self.entries.append(entry)

    # ── API pública ────────────────────────────────────────────

    def info(self, msg: str, **evidence):
        self._write_entry(Level.INFO, msg, evidence or None)

    def success(self, msg: str, **evidence):
        """
        Só use quando houver prova concreta.
        evidence deve conter: http_status, db_confirmed, url, etc.
        """
        self._write_entry(Level.SUCCESS, msg, evidence or None)

    def warning(self, msg: str, **evidence):
        self._write_entry(Level.WARNING, msg, evidence or None)

    def error(self, msg: str, exc: Optional[Exception] = None, **evidence):
        """
        Captura o traceback completo se exc for fornecido.
        NUNCA silencia — sempre mostra onde e quando falhou.
        """
        if exc is not None:
            evidence["exception_type"] = type(exc).__name__
            evidence["exception_msg"]  = str(exc)
            evidence["traceback"]      = traceback.format_exc().strip()
        self._write_entry(Level.ERROR, msg, evidence or None)

    def fatal(self, msg: str, exc: Optional[Exception] = None, **evidence):
        """Erro irrecuperável. Loga e encerra o processo."""
        if exc is not None:
            evidence["exception_type"] = type(exc).__name__
            evidence["exception_msg"]  = str(exc)
            evidence["traceback"]      = traceback.format_exc().strip()
        self._write_entry(Level.FATAL, msg, evidence or None)
        self.finalize()
        sys.exit(1)

    def separator(self, title: str = ""):
        line = f"{'─' * 20} {title} {'─' * 20}" if title else "─" * 50
        print(f"\033[90m{line}{RESET}")

    def finalize(self) -> dict:
        """Imprime resumo da sessão e retorna as contagens."""
        elapsed = (datetime.datetime.utcnow() - self.start_time).total_seconds()
        summary = {
            "duration_sec": round(elapsed, 1),
            "SUCCESS": self.counts[Level.SUCCESS],
            "WARNING": self.counts[Level.WARNING],
            "ERROR":   self.counts[Level.ERROR],
            "FATAL":   self.counts[Level.FATAL],
            "log_file": str(self.log_file),
        }
        self._write_entry(Level.INFO, "=== Session ended ===", summary)
        self.separator("RESUMO")
        print(f"  ✅ Sucesso:  {summary['SUCCESS']}")
        print(f"  ⚠️  Warning:  {summary['WARNING']}")
        print(f"  ❌ Erro:     {summary['ERROR']}")
        print(f"  ⏱️  Duração:  {elapsed:.1f}s")
        print(f"  📄 Log:      {self.log_file}")
        self.separator()
        return summary
