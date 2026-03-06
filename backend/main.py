"""Lecture2Code API — main application entry point."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.database import init_db
from api.routes.ingest import router as ingest_router
from api.routes.status import router as status_router
from api.routes.results import router as results_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    init_db()
    yield


app = FastAPI(
    title="Lecture2Code API",
    description="Transforms coding lecture transcripts into structured theory pages and interactive code notebooks.",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Routers
app.include_router(ingest_router)
app.include_router(status_router)
app.include_router(results_router)


@app.get("/health")
async def health():
    return {
        "success": True,
        "data": {"status": "ok", "version": "2.0.0"},
        "error": None,
    }
