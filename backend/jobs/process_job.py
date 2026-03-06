"""Background job processor — runs in FastAPI BackgroundTasks."""
from __future__ import annotations

import asyncio
import base64
import json
import traceback
from datetime import datetime, timezone

from core.database import SessionLocal
from models.schemas import Job
from services.transcript_service import get_transcript
from services.pdf_service import extract_text_from_bytes
from services.llm_service import prepare_transcript
from chains.theory_chain import run_theory_chain
from chains.notebook_chain import run_notebook_chain


def _update_job(job_id: str, **kwargs):
    """Update a job record in the database."""
    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if job:
            for k, v in kwargs.items():
                setattr(job, k, v)
            job.updated_at = datetime.now(timezone.utc)
            db.commit()
    finally:
        db.close()


async def process_job(job_id: str):
    """Main background task — extracts text, runs LLM chains, stores results."""
    try:
        # 1. Get the job to read its input
        db = SessionLocal()
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return
        source = job.source
        input_type = job.input_type
        db.close()

        # 2. Extract text
        _update_job(job_id, status="extracting", progress=10)

        if input_type == "youtube":
            import anyio
            raw_text, video_id = await anyio.to_thread.run_sync(
                lambda: get_transcript(source, use_cache=True)
            )
        elif input_type == "transcript":
            raw_text = source
        elif input_type == "pdf":
            # Source contains base64-encoded PDF bytes
            pdf_bytes = base64.b64decode(source)
            raw_text, _ = extract_text_from_bytes(pdf_bytes)
        else:
            raise ValueError(f"Unknown input_type: {input_type}")

        # 3. Process with LLM
        _update_job(job_id, status="processing", progress=30)

        # Run theory and notebook chains concurrently
        theory_md, notebook_md = await asyncio.gather(
            run_theory_chain(raw_text),
            run_notebook_chain(raw_text),
        )

        _update_job(job_id, progress=80)

        # 4. Build result JSON
        result = {
            "jobId": job_id,
            "source": source[:200] if len(source) > 200 else source,
            "theory": {
                "content": theory_md,
            },
            "notebook": {
                "content": notebook_md,
            },
        }

        # 5. Store result and mark done
        _update_job(
            job_id,
            status="done",
            progress=100,
            result_json=json.dumps(result),
        )

    except Exception as e:
        _update_job(
            job_id,
            status="error",
            error_msg=f"{type(e).__name__}: {str(e)}\n{traceback.format_exc()}",
        )
