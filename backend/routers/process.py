from __future__ import annotations

import time
from typing import Optional, AsyncIterator

from fastapi import APIRouter, Request, Body
from fastapi.responses import JSONResponse
from pydantic import BaseModel, model_validator
from sse_starlette.sse import EventSourceResponse

from chains import run_chains, stream_theory_chain, stream_notebook_chain, prepare_transcript
from session import get_session_store
from transcript import get_transcript, approximate_token_count
from config import settings
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

router = APIRouter()


class ProcessRequest(BaseModel):
    url: Optional[str] = None
    transcript: Optional[str] = None

    @model_validator(mode="after")
    def validate_exactly_one(self):
        has_url = bool(self.url and self.url.strip())
        has_transcript = bool(self.transcript and self.transcript.strip())
        if has_url and has_transcript:
            raise ValueError("Provide either 'url' or 'transcript', not both.")
        if not has_url and not has_transcript:
            raise ValueError("At least one of 'url' or 'transcript' must be provided.")
        return self


async def _resolve_transcript(req: ProcessRequest) -> tuple[str, str | None, bool]:
    """Return (raw_transcript, video_id, from_cache=False)."""
    if req.url:
        import anyio
        raw, video_id = await anyio.to_thread.run_sync(
            get_transcript, req.url, settings.cache_transcripts
        )
        return raw, video_id, False
    return req.transcript, None, False  # type: ignore[return-value]


@router.post("/process")
@limiter.limit(f"{settings.rate_limit_per_hour}/hour")
async def process(request: Request, body: ProcessRequest = Body(...)) -> JSONResponse:
    t_start = time.time()

    raw_transcript, video_id, _ = await _resolve_transcript(body)
    token_count = approximate_token_count(raw_transcript)
    chunked = (token_count > settings.max_transcript_tokens)

    theory, notebook = await run_chains(raw_transcript)

    model = (
        settings.ollama_model if settings.llm_backend == "ollama" else settings.openai_model
    )
    metadata = {
        "video_id": video_id,
        "transcript_token_count": token_count,
        "chunked": chunked,
        "llm_backend": settings.llm_backend,
        "model": model,
        "processing_time_ms": int((time.time() - t_start) * 1000),
    }

    store = get_session_store()
    session_id = store.save(theory=theory, notebook=notebook, metadata=metadata)

    return JSONResponse(
        content={
            "session_id": session_id,
            "theory": theory,
            "notebook": notebook,
            "metadata": metadata,
        }
    )


@router.post("/process/stream")
@limiter.limit(f"{settings.rate_limit_per_hour}/hour")
async def process_stream(request: Request, body: ProcessRequest = Body(...)) -> EventSourceResponse:
    t_start = time.time()
    raw_transcript, video_id, _ = await _resolve_transcript(body)
    token_count = approximate_token_count(raw_transcript)
    chunked = token_count > settings.max_transcript_tokens
    prepared = await prepare_transcript(raw_transcript)

    async def _event_generator() -> AsyncIterator[dict]:
        theory_buf: list[str] = []
        notebook_buf: list[str] = []

        async for token in stream_theory_chain(prepared):
            theory_buf.append(token)
            yield {"event": "theory_token", "data": token}

        async for token in stream_notebook_chain(prepared):
            notebook_buf.append(token)
            yield {"event": "notebook_token", "data": token}

        theory = "".join(theory_buf)
        notebook = "".join(notebook_buf)
        model = (
            settings.ollama_model if settings.llm_backend == "ollama" else settings.openai_model
        )
        metadata = {
            "video_id": video_id,
            "transcript_token_count": token_count,
            "chunked": chunked,
            "llm_backend": settings.llm_backend,
            "model": model,
            "processing_time_ms": int((time.time() - t_start) * 1000),
        }

        store = get_session_store()
        session_id = store.save(theory=theory, notebook=notebook, metadata=metadata)

        import json
        yield {"event": "metadata", "data": json.dumps(metadata)}
        yield {"event": "done", "data": json.dumps({"session_id": session_id})}

    return EventSourceResponse(_event_generator())
