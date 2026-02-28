"""LLM chains for PDF summarisation, important-points extraction, and Q&A."""
from __future__ import annotations

import asyncio

from langchain_core.messages import HumanMessage

from llm import get_llm, prepare_transcript
from postprocess import fix_markdown


# ---------------------------------------------------------------------------
# Prompt templates
# ---------------------------------------------------------------------------

PDF_SUMMARY_PROMPT = """\
You are a helpful academic assistant. Read the following document text extracted from a PDF and write a comprehensive summary in Markdown format.

IMPORTANT FORMATTING RULES:
- Put a blank line before and after every heading (#, ##, ###).
- Put a blank line before and after every table.
- Put a blank line before and after every code block.
- Use proper newlines between paragraphs.

Write these sections in order:

# Document Overview

Write 2-3 sentences describing what this document is about, the subject area, and the intended audience.

# Section-by-Section Summary

For each major section or topic in the document, write a short subsection:

## [Section/Topic Name]

Summarise the key content of that section in 3-5 sentences.

(Repeat for every major topic found in the document.)

# Conclusion

Write 2-3 sentences summarising the overall takeaway from the document.

---
DOCUMENT TEXT:
{text}
---

Write ONLY the Markdown content. No preamble. No commentary.
"""

PDF_IMPORTANT_POINTS_PROMPT = """\
You are a helpful academic assistant preparing revision notes for a student. Read the following document text extracted from a PDF and extract the most important points.

IMPORTANT FORMATTING RULES:
- Put a blank line before and after every heading (#, ##, ###).
- Put a blank line before and after every table.
- Put a blank line before and after every code block.
- Use proper newlines between paragraphs.
- Use bullet points (- item) with each item on its own line.

Write these sections in order:

# Key Definitions

List every important term or concept defined in the document with a one-line definition.

- **Term**: Definition

# Core Concepts

List the most important ideas, theories, or principles. Explain each in 1-2 sentences.

# Important Formulas / Code Snippets

If the document contains formulas, equations, or code, list them here with brief explanations. Use code blocks for code and LaTeX-style notation for formulas.

# Must-Remember Facts

List 5-15 bullet points of facts that are most likely to appear in an exam or interview.

# Quick Revision Table

| # | Topic | Key Point |
|---|-------|-----------|
| 1 | ...   | ...       |

---
DOCUMENT TEXT:
{text}
---

Write ONLY the Markdown content. No preamble. No commentary.
"""

PDF_QA_PROMPT = """\
You are a helpful academic assistant. A student has uploaded a document and is asking a question about it. Answer the question ONLY using information from the document text below. If the answer is not in the document, say so clearly.

Write your answer in clear, well-formatted Markdown. Use bullet points, code blocks, or tables where appropriate.

DOCUMENT TEXT:
{text}

STUDENT QUESTION:
{question}

Answer the question based ONLY on the document above.
"""


# ---------------------------------------------------------------------------
# Chain runners
# ---------------------------------------------------------------------------

async def _run_pdf_chain(prompt_template: str, text: str, **kwargs) -> str:
    """Run a single LLM chain with the given prompt and text."""
    llm = get_llm()
    prompt = prompt_template.format(text=text, **kwargs)
    try:
        response = await llm.ainvoke([HumanMessage(content=prompt)])
    except Exception:
        # Fallback to lighter model
        llm = get_llm(fallback=True)
        response = await llm.ainvoke([HumanMessage(content=prompt)])
    return fix_markdown(response.content)


async def run_pdf_summary_chain(text: str) -> str:
    """Generate a structured summary of the PDF content."""
    return await _run_pdf_chain(PDF_SUMMARY_PROMPT, text)


async def run_pdf_points_chain(text: str) -> str:
    """Extract important points from the PDF content."""
    return await _run_pdf_chain(PDF_IMPORTANT_POINTS_PROMPT, text)


async def run_pdf_chains(text: str) -> tuple[str, str]:
    """Run summary and important-points chains concurrently.

    Returns (summary_md, points_md).
    """
    prepared = await prepare_transcript(text)  # reuse chunking logic
    summary, points = await asyncio.gather(
        run_pdf_summary_chain(prepared),
        run_pdf_points_chain(prepared),
    )
    return summary, points


async def run_pdf_qa(text: str, question: str) -> str:
    """Answer a student question using the PDF content."""
    prepared = await prepare_transcript(text)
    return await _run_pdf_chain(PDF_QA_PROMPT, prepared, question=question)
