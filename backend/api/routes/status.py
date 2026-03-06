"""GET /api/status/{job_id} — returns current job status and progress."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from core.database import get_db
from models.schemas import Job

router = APIRouter(prefix="/api", tags=["status"])


@router.get("/status/{job_id}")
async def get_status(job_id: str, db: Session = Depends(get_db)):
    """Return the current status of a processing job."""
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

    return JSONResponse(
        content={
            "success": True,
            "data": {
                "status": job.status,
                "progress": job.progress,
                "error": job.error_msg,
            },
            "error": None,
        }
    )
