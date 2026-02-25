from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # LLM backend
    llm_backend: Literal["ollama", "openai"] = "ollama"

    # Ollama
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "codellama:13b"
    ollama_fallback_model: str = "codellama:7b"

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"

    # Transcript
    max_transcript_tokens: int = 6000
    cache_transcripts: bool = True

    # Rate limiting
    rate_limit_per_hour: int = 10

    # Session
    session_ttl_seconds: int = 3600

    # CORS
    cors_origins: str = "http://localhost:5173"

    # Logging
    log_level: str = "info"

    # Streaming
    enable_streaming: bool = True

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
