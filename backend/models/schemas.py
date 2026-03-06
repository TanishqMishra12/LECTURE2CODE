"""SQLAlchemy models and Pydantic schemas."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from pydantic import BaseModel, Field
from sqlalchemy import Column, String, Integer, Text, DateTime

from core.database import Base


# ── SQLAlchemy ORM Model ─────────────────────────────────────────────────────

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    status = Column(String, nullable=False, default="pending")
    progress = Column(Integer, nullable=False, default=0)
    source = Column(String, nullable=False)
    input_type = Column(String, nullable=False)
    result_json = Column(Text, nullable=True)
    error_msg = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))


# ── Pydantic Request / Response Schemas ──────────────────────────────────────

class IngestRequest(BaseModel):
    source: str = Field(..., description="URL, file path, or raw transcript text")
    input_type: str = Field(..., pattern="^(youtube|pdf|transcript)$",
                            description="One of: youtube, pdf, transcript")
    content: Optional[str] = Field(None, description="Raw transcript text (for input_type=transcript)")


class ApiEnvelope(BaseModel):
    success: bool
    data: Any = None
    error: Optional[str] = None


class IngestResponse(BaseModel):
    jobId: str


class StatusResponse(BaseModel):
    status: str
    progress: int
    error: Optional[str] = None


class ResultResponse(BaseModel):
    jobId: str
    source: str
    theory: dict
    notebook: dict
