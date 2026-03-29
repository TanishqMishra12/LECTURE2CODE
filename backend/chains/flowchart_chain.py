"""Flowchart chain — generates a Mermaid diagram from a transcript."""
from __future__ import annotations

import re

from langchain_core.messages import HumanMessage

from services.llm_service import get_llm, prepare_transcript
from chains.prompts import FLOWCHART_PROMPT


def _clean_mermaid(raw: str) -> str:
    """Strip accidental markdown fences the LLM may still add."""
    raw = raw.strip()
    # Remove opening ```mermaid or ``` fence
    raw = re.sub(r"^```(?:mermaid)?\s*\n?", "", raw, flags=re.IGNORECASE)
    # Remove closing ``` fence
    raw = re.sub(r"\n?```\s*$", "", raw)
    return raw.strip()


async def run_flowchart_chain(transcript: str) -> str:
    """Run the flowchart generation chain on a prepared transcript."""
    prepared = await prepare_transcript(transcript)
    try:
        llm = get_llm()
        prompt = FLOWCHART_PROMPT.format(transcript=prepared)
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        return _clean_mermaid(response.content)
    except Exception:
        llm = get_llm(fallback=True)
        prompt = FLOWCHART_PROMPT.format(transcript=prepared)
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        return _clean_mermaid(response.content)
