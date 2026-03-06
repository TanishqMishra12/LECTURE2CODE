"""GET /api/results/{job_id} — returns full result JSON when job is done."""
from __future__ import annotations

import json

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from core.database import get_db
from models.schemas import Job

router = APIRouter(prefix="/api", tags=["results"])


@router.get("/results/{job_id}")
async def get_results(job_id: str, db: Session = Depends(get_db)):
    """Return the full result JSON for a completed job."""
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "data": None,
                "error": f"Job {job_id} not found",
            },
        )

    if job.status != "done":
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "data": None,
                "error": f"Job {job_id} is not complete yet (status: {job.status})",
            },
        )

    result_data = json.loads(job.result_json) if job.result_json else {}

    return JSONResponse(
        content={
            "success": True,
            "data": result_data,
            "error": None,
        }
    )
