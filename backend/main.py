from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from config import settings
from routers.health import router as health_router
from routers.process import router as process_router
from routers.export_router import router as export_router
from routers.pdf_router import router as pdf_router


limiter = Limiter(key_func=get_remote_address, default_limits=[f"{settings.rate_limit_per_hour}/hour"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warmup: ping the LLM so it is loaded before the first request
    from routers.health import _warmup
    await _warmup()
    yield


app = FastAPI(
    title="Lecture2Code API",
    description="Transforms coding lecture transcripts into structured theory pages and interactive code notebooks.",
    version="1.0.0",
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

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Routers
app.include_router(health_router)
app.include_router(process_router)
app.include_router(export_router)
app.include_router(pdf_router)
