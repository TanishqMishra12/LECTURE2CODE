from __future__ import annotations

import asyncio
from typing import AsyncIterator

from langchain_core.messages import HumanMessage

from llm import get_llm, prepare_transcript


THEORY_PROMPT = """\
You are an expert computer science educator. Given the following lecture transcript, produce a comprehensive theory page in Markdown.

Structure your response EXACTLY as follows (use these heading levels):

# Concept Overview
Write a 2-3 sentence plain-English summary of the main topic.

# Step-by-Step Explanation
Provide a numbered breakdown of the concept. Include a concrete worked example with actual values.

# Common Mistakes
List the top 3-5 common pitfalls students make with this topic. For each, explain the mistake and the correction.

# Complexity Analysis
Provide a Markdown table with columns: Operation | Time Complexity | Space Complexity | Justification.
Cover all key operations discussed.

# Key Takeaways
Provide 3-5 bullet points summarising the most important facts for exam revision.

---
TRANSCRIPT:
{transcript}
---

Respond only with the Markdown content. Do not include any preamble or meta-commentary.
"""

NOTEBOOK_PROMPT = """\
You are an expert programming instructor. Given the following lecture transcript, produce an interactive code notebook in Markdown.

Structure your response EXACTLY as follows (use these heading levels):

# Code Implementation
Provide clean, fully-commented Python code that implements the concept from the lecture.
Wrap code in triple-backtick fenced blocks with the language tag (```python).

# Dry Run Trace
Show a step-by-step trace of the algorithm on a concrete small example.
Use a Markdown table with columns: Step | Variable States | Explanation.

# Practice Problems

## Problem 1 (Easy)
State the problem clearly.

<details>
<summary>Show Solution</summary>

```python
# solution code here
```

</details>

## Problem 2 (Medium)
State the problem clearly.

<details>
<summary>Show Solution</summary>

```python
# solution code here
```

</details>

## Problem 3 (Hard)
State the problem clearly.

<details>
<summary>Show Solution</summary>

```python
# solution code here
```

</details>

# Edge Cases
Provide a Markdown table with columns: Edge Case | Example Input | Expected Behaviour.

---
TRANSCRIPT:
{transcript}
---

Respond only with the Markdown content. Do not include any preamble or meta-commentary.
"""


async def _run_chain(prompt_template: str, transcript: str, use_fallback: bool = False) -> str:
    llm = get_llm(fallback=use_fallback)
    prompt = prompt_template.format(transcript=transcript)
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    return response.content


async def run_theory_chain(transcript: str) -> str:
    try:
        return await _run_chain(THEORY_PROMPT, transcript)
    except Exception:
        return await _run_chain(THEORY_PROMPT, transcript, use_fallback=True)


async def run_notebook_chain(transcript: str) -> str:
    try:
        return await _run_chain(NOTEBOOK_PROMPT, transcript)
    except Exception:
        return await _run_chain(NOTEBOOK_PROMPT, transcript, use_fallback=True)


async def run_chains(transcript: str) -> tuple[str, str]:
    """Run theory and notebook chains concurrently. Returns (theory_md, notebook_md)."""
    prepared = await prepare_transcript(transcript)
    theory, notebook = await asyncio.gather(
        run_theory_chain(prepared),
        run_notebook_chain(prepared),
    )
    return theory, notebook


async def stream_theory_chain(transcript: str) -> AsyncIterator[str]:
    """Yield theory tokens one at a time."""
    llm = get_llm()
    prompt = THEORY_PROMPT.format(transcript=transcript)
    async for chunk in llm.astream([HumanMessage(content=prompt)]):
        if hasattr(chunk, "content") and chunk.content:
            yield chunk.content


async def stream_notebook_chain(transcript: str) -> AsyncIterator[str]:
    """Yield notebook tokens one at a time."""
    llm = get_llm()
    prompt = NOTEBOOK_PROMPT.format(transcript=transcript)
    async for chunk in llm.astream([HumanMessage(content=prompt)]):
        if hasattr(chunk, "content") and chunk.content:
            yield chunk.content
