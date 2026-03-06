"""Theory chain — generates structured theory notes from a transcript."""
from __future__ import annotations

from langchain_core.messages import HumanMessage

from services.llm_service import get_llm, prepare_transcript
from chains.prompts import THEORY_PROMPT
from services.postprocess import fix_markdown


async def run_theory_chain(transcript: str) -> str:
    """Run the theory generation chain on a prepared transcript."""
    prepared = await prepare_transcript(transcript)
    try:
        llm = get_llm()
        prompt = THEORY_PROMPT.format(transcript=prepared)
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        return fix_markdown(response.content)
    except Exception:
        llm = get_llm(fallback=True)
        prompt = THEORY_PROMPT.format(transcript=prepared)
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        return fix_markdown(response.content)
