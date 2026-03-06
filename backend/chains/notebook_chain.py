"""Notebook chain — generates interactive code notebook from a transcript."""
from __future__ import annotations

from langchain_core.messages import HumanMessage

from services.llm_service import get_llm, prepare_transcript
from chains.prompts import NOTEBOOK_PROMPT
from services.postprocess import fix_markdown


async def run_notebook_chain(transcript: str) -> str:
    """Run the notebook generation chain on a prepared transcript."""
    prepared = await prepare_transcript(transcript)
    try:
        llm = get_llm()
        prompt = NOTEBOOK_PROMPT.format(transcript=prepared)
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        return fix_markdown(response.content)
    except Exception:
        llm = get_llm(fallback=True)
        prompt = NOTEBOOK_PROMPT.format(transcript=prepared)
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        return fix_markdown(response.content)
