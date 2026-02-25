from __future__ import annotations

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import HumanMessage

from config import settings


def get_llm(fallback: bool = False) -> BaseChatModel:
    """Return the configured LLM instance."""
    if settings.llm_backend == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=settings.openai_model,
            temperature=0.2,
            api_key=settings.openai_api_key,
        )
    else:
        from langchain_community.chat_models import ChatOllama
        model = settings.ollama_fallback_model if fallback else settings.ollama_model
        return ChatOllama(
            model=model,
            base_url=settings.ollama_base_url,
            temperature=0.2,
            num_predict=4096,
            num_ctx=8192,
            repeat_penalty=1.1,
            top_p=0.9,
        )


def _needs_chunking(text: str) -> bool:
    approx_tokens = len(text) // 4
    return approx_tokens > settings.max_transcript_tokens


async def chunk_and_summarise(transcript: str) -> str:
    """
    Split the transcript into overlapping chunks, summarise each with the LLM,
    then join the summaries. Used when transcript exceeds MAX_TRANSCRIPT_TOKENS.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=2000 * 4,   # characters ~ 2000 tokens
        chunk_overlap=200 * 4,
        length_function=len,
    )
    chunks = splitter.split_text(transcript)

    llm = get_llm()
    summaries: list[str] = []
    for chunk in chunks:
        prompt = (
            "Summarise the following section of a coding lecture transcript. "
            "Preserve all technical details, algorithms, code patterns, and examples:\n\n"
            f"{chunk}"
        )
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        summaries.append(response.content)

    return "\n\n".join(summaries)


async def prepare_transcript(raw_transcript: str) -> str:
    """Return the transcript ready for LLM chains, chunking if needed."""
    if _needs_chunking(raw_transcript):
        return await chunk_and_summarise(raw_transcript)
    return raw_transcript
