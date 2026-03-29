"""All LLM prompt templates for theory and notebook chains."""

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

FLOWCHART_PROMPT = """\
You are a computer science teacher. Read the lecture transcript below and produce a Mermaid flowchart diagram that visualises the key concept, algorithm, or process described.

RULES:
- Output ONLY the Mermaid diagram source code. Do NOT include markdown fences (no ```mermaid or ```).
- Start with: flowchart TD
- Use short, clear node labels (max 6 words per label).
- Use double-quoted labels for any label that contains parentheses, colons, or commas.
- Use at most 15 nodes total.
- Use subgraphs only if the concept has clearly distinct phases.
- Every edge must use --> or -- label --> syntax.
- Do NOT include any explanation, preamble, or text outside the diagram.

EXAMPLE OUTPUT:
flowchart TD
    A[Start] --> B[Read input]
    B --> C{{Is input valid?}}
    C -- Yes --> D[Process data]
    C -- No --> E[Show error]
    D --> F[Return result]
    E --> B

---
TRANSCRIPT:
{transcript}
---

Output ONLY the Mermaid diagram. Nothing else.
"""
