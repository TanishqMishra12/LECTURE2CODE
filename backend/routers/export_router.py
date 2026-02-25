from __future__ import annotations

import io

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from export import build_notebook
from session import get_session_store

router = APIRouter()


@router.get("/export/{session_id}")
async def export_notebook(session_id: str) -> StreamingResponse:
    store = get_session_store()
    entry = store.get(session_id)
    if entry is None:
        raise HTTPException(
            status_code=404,
            detail={"code": "SESSION_NOT_FOUND", "message": "Session not found or has expired."},
        )

    ipynb_bytes = build_notebook(entry.theory, entry.notebook)
    filename = f"lecture2code-{session_id}.ipynb"

    return StreamingResponse(
        content=io.BytesIO(ipynb_bytes),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
