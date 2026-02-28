"""Router for PDF upload, processing, and Q&A."""

import time

from fastapi import APIRouter, File, Request, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

from config import settings
from pdf_extract import extract_text_from_bytes, PDFExtractionError
from pdf_chains import run_pdf_chains, run_pdf_qa
from session import get_session_store
from llm import _needs_chunking

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/pdf", tags=["pdf"])


# ---------------------------------------------------------------------------
# POST /pdf/process  —  upload PDF, get summary + important points
# ---------------------------------------------------------------------------

@router.post("/process")
@limiter.limit(f"{settings.rate_limit_per_hour}/hour")
async def pdf_process(
    request: Request,
    file: UploadFile = File(...),
) -> JSONResponse:
    # Validate content type
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        return JSONResponse(
            status_code=400,
            content={"detail": "Only PDF files are accepted."},
        )

    # Read file bytes
    pdf_bytes = await file.read()
    max_bytes = settings.max_pdf_size_mb * 1024 * 1024
    if len(pdf_bytes) > max_bytes:
        return JSONResponse(
            status_code=400,
            content={
                "detail": f"PDF exceeds the {settings.max_pdf_size_mb} MB size limit."
            },
        )

    # Extract text
    try:
        full_text, page_texts = extract_text_from_bytes(pdf_bytes)
    except PDFExtractionError as exc:
        return JSONResponse(status_code=422, content={"detail": str(exc)})

    t_start = time.time()

    # Run LLM chains
    summary, points = await run_pdf_chains(full_text)

    approx_tokens = len(full_text) // 4
    model = (
        settings.ollama_model
        if settings.llm_backend == "ollama"
        else settings.openai_model
    )
    metadata = {
        "filename": file.filename,
        "page_count": len(page_texts),
        "text_token_count": approx_tokens,
        "chunked": _needs_chunking(full_text),
        "llm_backend": settings.llm_backend,
        "model": model,
        "processing_time_ms": int((time.time() - t_start) * 1000),
    }

    # Save to session (store pdf_text for future Q&A)
    store = get_session_store()
    session_id = store.save(
        theory="",
        notebook="",
        metadata=metadata,
        pdf_summary=summary,
        pdf_points=points,
        pdf_text=full_text,
    )

    return JSONResponse(
        content={
            "session_id": session_id,
            "summary": summary,
            "points": points,
            "metadata": metadata,
        }
    )


# ---------------------------------------------------------------------------
# POST /pdf/ask  —  Q&A against an already-processed PDF
# ---------------------------------------------------------------------------

class AskRequest(BaseModel):
    session_id: str
    question: str


@router.post("/ask")
@limiter.limit(f"{settings.rate_limit_per_hour * 3}/hour")
async def pdf_ask(request: Request, body: AskRequest) -> JSONResponse:
    store = get_session_store()
    entry = store.get(body.session_id)

    if entry is None:
        return JSONResponse(
            status_code=404,
            content={"detail": "Session not found or expired. Please re-upload the PDF."},
        )

    if not entry.pdf_text:
        return JSONResponse(
            status_code=400,
            content={"detail": "This session does not contain PDF data."},
        )

    t_start = time.time()
    answer = await run_pdf_qa(entry.pdf_text, body.question)

    return JSONResponse(
        content={
            "answer": answer,
            "processing_time_ms": int((time.time() - t_start) * 1000),
        }
    )
