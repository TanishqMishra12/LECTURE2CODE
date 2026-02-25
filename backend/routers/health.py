from __future__ import annotations

import time

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from config import settings
from llm import get_llm
from langchain_core.messages import HumanMessage

router = APIRouter()
_start_time = time.time()
_model_loaded: bool = False


async def _warmup() -> bool:
    """Ping the LLM with a minimal message to verify it is reachable."""
    global _model_loaded
    try:
        llm = get_llm()
        await llm.ainvoke([HumanMessage(content="ping")])
        _model_loaded = True
    except Exception:
        _model_loaded = False
    return _model_loaded


@router.get("/health")
async def health_check() -> JSONResponse:
    model = (
        settings.ollama_model
        if settings.llm_backend == "ollama"
        else settings.openai_model
    )
    return JSONResponse(
        content={
            "status": "ok",
            "llm_backend": settings.llm_backend,
            "model": model,
            "model_loaded": _model_loaded,
            "uptime_seconds": int(time.time() - _start_time),
        }
    )
