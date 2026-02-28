from __future__ import annotations

import asyncio
from typing import AsyncIterator

from langchain_core.messages import HumanMessage

from llm import get_llm, prepare_transcript
from postprocess import fix_markdown


THEORY_PROMPT = """\
You are a computer science teacher. Read the lecture transcript below and write a theory page in Markdown format.

IMPORTANT FORMATTING RULES:
- Put a blank line before and after every heading (#, ##, ###).
- Put a blank line before and after every table.
- Put a blank line before and after every code block.
- Use proper newlines between paragraphs.
- Use numbered lists (1. 2. 3.) with each item on its own line.
- Use bullet points (- item) with each item on its own line.

Write these sections in order:

# Concept Overview

Write 2-3 sentences explaining the main topic in simple English.

# Step-by-Step Explanation

Write a numbered list explaining the concept step by step.
Include a worked example with actual values.

# Common Mistakes

List 3 common mistakes students make. For each one, write:
- **Mistake**: what they do wrong
- **Fix**: the correct approach

# Complexity Analysis

Write a table like this:

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|-----------------|
| Example   | O(n)           | O(1)            |

# Key Takeaways

Write 3-5 bullet points with the most important facts.

---
TRANSCRIPT:
{transcript}
---

Write ONLY the Markdown content. No preamble. No commentary.
"""

NOTEBOOK_PROMPT = """\
You are a programming teacher. Read the lecture transcript below and write a code notebook in Markdown format.

IMPORTANT FORMATTING RULES:
- Put a blank line before and after every heading (#, ##, ###).
- Put a blank line before and after every code block (```python ... ```).
- Put a blank line before and after every table.
- Each code block must start with ```python on its own line and end with ``` on its own line.
- Use proper newlines between paragraphs.

Write these sections in order:

# Code Implementation

Write clean Python code with comments that implements the main concept.
Wrap the code in a fenced code block:

```python
# your code here
```

# Dry Run Trace

Show a step-by-step trace using a table:

| Step | Variables | What Happens |
|------|-----------|-------------|
| 1    | x=0       | Initialize  |

# Practice Problems

## Problem 1 (Easy)

State the problem.

<details>
<summary>Show Solution</summary>

```python
# solution here
```

</details>

## Problem 2 (Medium)

State the problem.

<details>
<summary>Show Solution</summary>

```python
# solution here
```

</details>

## Problem 3 (Hard)

State the problem.

<details>
<summary>Show Solution</summary>

```python
# solution here
```

</details>

# Edge Cases

| Edge Case | Example Input | Expected Output |
|-----------|--------------|----------------|
| Empty     | []           | None           |

---
TRANSCRIPT:
{transcript}
---

Write ONLY the Markdown content. No preamble. No commentary.
"""


async def _run_chain(prompt_template: str, transcript: str, use_fallback: bool = False) -> str:
    llm = get_llm(fallback=use_fallback)
    prompt = prompt_template.format(transcript=transcript)
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    return fix_markdown(response.content)


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
    try:
        llm = get_llm()
        prompt = THEORY_PROMPT.format(transcript=transcript)
        buf: list[str] = []
        async for chunk in llm.astream([HumanMessage(content=prompt)]):
            if hasattr(chunk, "content") and chunk.content:
                buf.append(chunk.content)
                yield chunk.content
        # After streaming, yield a fixed version as a replacement signal
        # The frontend accumulates tokens, so we yield a special "replace" event
    except Exception as e:
        yield f"\n\n> [!ERROR] Theory generation failed: {str(e)}\n"


async def stream_notebook_chain(transcript: str) -> AsyncIterator[str]:
    """Yield notebook tokens one at a time."""
    try:
        llm = get_llm()
        prompt = NOTEBOOK_PROMPT.format(transcript=transcript)
        async for chunk in llm.astream([HumanMessage(content=prompt)]):
            if hasattr(chunk, "content") and chunk.content:
                yield chunk.content
    except Exception as e:
        yield f"\n\n> [!ERROR] Notebook generation failed: {str(e)}\n"

