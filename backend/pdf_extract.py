"""PDF text extraction using PyMuPDF (fitz).

Extracts text from uploaded PDF files page by page, enforcing
a configurable page limit.
"""
from __future__ import annotations

import fitz  # PyMuPDF
from config import settings


class PDFExtractionError(Exception):
    """Raised when PDF text extraction fails."""


def extract_text_from_bytes(pdf_bytes: bytes) -> tuple[str, list[str]]:
    """Extract text from raw PDF bytes.

    Returns:
        (full_text, list_of_page_texts)

    Raises:
        PDFExtractionError: if the file cannot be read or exceeds page limit.
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as exc:
        raise PDFExtractionError(f"Could not open PDF: {exc}") from exc

    if doc.page_count > settings.max_pdf_pages:
        doc.close()
        raise PDFExtractionError(
            f"PDF has {doc.page_count} pages, which exceeds the "
            f"limit of {settings.max_pdf_pages}."
        )

    if doc.page_count == 0:
        doc.close()
        raise PDFExtractionError("PDF has no pages.")

    page_texts: list[str] = []
    for page in doc:
        text = page.get_text("text").strip()
        page_texts.append(text)

    doc.close()

    full_text = "\n\n".join(page_texts)
    if not full_text.strip():
        raise PDFExtractionError(
            "PDF appears to be image-only or contains no extractable text."
        )

    return full_text, page_texts
