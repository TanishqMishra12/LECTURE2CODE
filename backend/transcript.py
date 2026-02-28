from __future__ import annotations

import re
from threading import Lock
from typing import Optional

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
from fastapi import HTTPException


# In-memory transcript cache: video_id -> transcript text
_cache: dict[str, str] = {}
_cache_lock = Lock()

# Reusable API client instance
_yt_api = YouTubeTranscriptApi()


def extract_video_id(url: str) -> Optional[str]:
    """Extract the YouTube video ID from various URL formats."""
    patterns = [
        r"(?:v=|/)([0-9A-Za-z_-]{11})(?:[&?/]|$)",
        r"youtu\.be/([0-9A-Za-z_-]{11})",
        r"embed/([0-9A-Za-z_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def get_transcript(url: str, use_cache: bool = True) -> tuple[str, str | None]:
    """
    Fetch and return (transcript_text, video_id).
    Raises HTTPException on failure.
    """
    video_id = extract_video_id(url)
    if not video_id:
        raise HTTPException(
            status_code=400,
            detail={"code": "INVALID_URL", "message": "The provided URL is not a valid YouTube video URL."},
        )

    if use_cache:
        with _cache_lock:
            if video_id in _cache:
                return _cache[video_id], video_id

    try:
        transcript = _yt_api.fetch(video_id, languages=["en"])
        transcript_text = " ".join(snippet.text for snippet in transcript)
    except TranscriptsDisabled:
        raise HTTPException(
            status_code=400,
            detail={"code": "TRANSCRIPT_UNAVAILABLE", "message": "Transcripts are disabled for this video."},
        )
    except NoTranscriptFound:
        raise HTTPException(
            status_code=400,
            detail={"code": "TRANSCRIPT_UNAVAILABLE", "message": "No English transcript found for this video."},
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail={"code": "TRANSCRIPT_UNAVAILABLE", "message": str(exc)},
        )

    if use_cache:
        with _cache_lock:
            _cache[video_id] = transcript_text

    return transcript_text, video_id


def approximate_token_count(text: str) -> int:
    """Approximate token count: ~4 characters per token."""
    return max(1, len(text) // 4)
