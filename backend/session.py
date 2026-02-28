from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from threading import Lock
from typing import Any, Optional


@dataclass
class SessionEntry:
    theory: str
    notebook: str
    metadata: dict[str, Any]
    pdf_summary: str = ""
    pdf_points: str = ""
    pdf_text: str = ""
    created_at: float = field(default_factory=time.time)


class SessionStore:
    """Thread-safe in-memory session store with TTL expiry."""

    def __init__(self, ttl_seconds: int = 3600) -> None:
        self._store: dict[str, SessionEntry] = {}
        self._lock = Lock()
        self._ttl = ttl_seconds

    def save(
        self,
        theory: str,
        notebook: str,
        metadata: dict[str, Any],
        pdf_summary: str = "",
        pdf_points: str = "",
        pdf_text: str = "",
    ) -> str:
        session_id = str(uuid.uuid4())
        entry = SessionEntry(
            theory=theory,
            notebook=notebook,
            metadata=metadata,
            pdf_summary=pdf_summary,
            pdf_points=pdf_points,
            pdf_text=pdf_text,
        )
        with self._lock:
            self._purge_expired()
            self._store[session_id] = entry
        return session_id

    def get(self, session_id: str) -> SessionEntry | None:
        with self._lock:
            self._purge_expired()
            return self._store.get(session_id)

    def _purge_expired(self) -> None:
        now = time.time()
        expired = [k for k, v in self._store.items() if now - v.created_at > self._ttl]
        for k in expired:
            del self._store[k]


# Module-level singleton — shared across request handlers
_session_store: SessionStore | None = None


def get_session_store() -> SessionStore:
    global _session_store
    if _session_store is None:
        from config import settings
        _session_store = SessionStore(ttl_seconds=settings.session_ttl_seconds)
    return _session_store
