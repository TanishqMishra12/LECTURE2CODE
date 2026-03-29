"""POST /api/ingest — accepts input, creates job, starts background processing."""
from __future__ import annotations

import asyncio
import uuid
import base64
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, File, UploadFile, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from core.database import get_db
from models.schemas import Job, IngestRequest
from jobs.process_job import process_job

router = APIRouter(prefix="/api", tags=["ingest"])


@router.post("/ingest")
async def ingest(
    body: IngestRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Create a new processing job and start it in the background (JSON body)."""
    job_id = str(uuid.uuid4())

    # Determine source text
    if body.input_type == "transcript":
        source = body.content or body.source
    else:
        source = body.source

    job = Job(
        id=job_id,
        status="pending",
        progress=0,
        source=source,
        input_type=body.input_type,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(job)
    db.commit()

    def _run_async_job():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(process_job(job_id))
        finally:
            loop.close()

    background_tasks.add_task(_run_async_job)

    return JSONResponse(
        content={
            "success": True,
            "data": {"jobId": job_id},
            "error": None,
        }
    )


@router.post("/ingest/pdf")
async def ingest_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Create a new processing job from a PDF file upload."""
    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "data": None,
                "error": "Only PDF files are accepted.",
            },
        )

    # Read file bytes
    pdf_bytes = await file.read()

    # Check file size (max 20MB)
    if len(pdf_bytes) > 20 * 1024 * 1024:
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "data": None,
                "error": "PDF file exceeds 20MB limit.",
            },
        )

    job_id = str(uuid.uuid4())

    # Store PDF bytes as base64 in the source field
    pdf_b64 = base64.b64encode(pdf_bytes).decode("utf-8")

    job = Job(
        id=job_id,
        status="pending",
        progress=0,
        source=pdf_b64,
        input_type="pdf",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(job)
    db.commit()

    def _run_async_job():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(process_job(job_id))
        finally:
            loop.close()

    background_tasks.add_task(_run_async_job)

    return JSONResponse(
        content={
            "success": True,
            "data": {"jobId": job_id},
            "error": None,
        }
    )
