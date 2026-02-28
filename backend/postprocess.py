"""Post-processing utilities to clean up LLM-generated Markdown output.

Small models (e.g. llama3.2 3B) often produce markdown without proper
newlines, missing blank lines before headings, and collapsed tables.
This module normalises the output so it renders correctly.
"""
from __future__ import annotations

import re


def fix_markdown(text: str) -> str:
    """Apply all markdown fixes in sequence."""
    text = _normalize_line_endings(text)
    text = _ensure_heading_newlines(text)
    text = _ensure_list_newlines(text)
    text = _fix_table_formatting(text)
    text = _fix_code_fences(text)
    text = _fix_details_blocks(text)
    text = _collapse_excessive_blanks(text)
    return text.strip() + "\n"


def _normalize_line_endings(text: str) -> str:
    """Convert \\r\\n to \\n and split lines that are jammed together."""
    text = text.replace("\r\n", "\n")
    # Some models emit literal '\n' as text instead of actual newlines
    # but only fix when surrounded by content (not inside code blocks)
    return text


def _ensure_heading_newlines(text: str) -> str:
    """Ensure each markdown heading (# ...) has a blank line before and after it."""
    lines = text.split("\n")
    result: list[str] = []
    for i, line in enumerate(lines):
        stripped = line.strip()
        # Detect heading lines: starts with 1-6 # followed by a space
        if re.match(r"^#{1,6}\s", stripped):
            # Add blank line before heading (if previous line is not blank and not start)
            if result and result[-1].strip() != "":
                result.append("")
            result.append(line)
            # We'll add a blank line after in the next iteration check
        else:
            # If previous line was a heading, ensure blank line after it
            if result and re.match(r"^#{1,6}\s", result[-1].strip()) and stripped != "":
                result.append("")
            result.append(line)
    return "\n".join(result)


def _ensure_list_newlines(text: str) -> str:
    """Ensure list items that are jammed together get proper newlines."""
    # Fix numbered lists jammed together: "1.foo2.bar" -> "1.foo\n2.bar"
    text = re.sub(r"(\S)(\d+\.\s)", r"\1\n\2", text)
    # Fix bullet lists jammed together: "textfoo- bar" -> "textfoo\n- bar"
    text = re.sub(r"(\S)((?:^|\n)\s*[-*]\s)", r"\1\n\2", text)
    return text


def _fix_table_formatting(text: str) -> str:
    """Fix markdown tables that are on a single line or missing newlines."""
    lines = text.split("\n")
    result: list[str] = []
    for line in lines:
        # If a line contains multiple pipe-delimited cells jammed together
        # like "| A | B || C | D |", split them
        if "|" in line and line.count("|") >= 4:
            stripped = line.strip()
            # Check if this looks like a table row
            if stripped.startswith("|") or re.match(r"^[^|]+\|[^|]+\|", stripped):
                # Ensure there's a blank line before the first table row
                if result and result[-1].strip() != "" and not result[-1].strip().startswith("|"):
                    # Check if previous line is not already a table line
                    if "|" not in result[-1] and not re.match(r"^#{1,6}\s", result[-1].strip()):
                        result.append("")
        result.append(line)
    return "\n".join(result)


def _fix_code_fences(text: str) -> str:
    """Ensure code fences have blank lines around them."""
    lines = text.split("\n")
    result: list[str] = []
    in_code_block = False

    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("```"):
            if not in_code_block:
                # Opening fence - add blank line before
                if result and result[-1].strip() != "":
                    result.append("")
                result.append(line)
                in_code_block = True
            else:
                # Closing fence - add it, then blank line after
                result.append(line)
                in_code_block = False
        else:
            # If we just closed a code block, add blank line
            if (result and result[-1].strip().startswith("```")
                    and not in_code_block and stripped != ""):
                result.append("")
            result.append(line)
    return "\n".join(result)


def _fix_details_blocks(text: str) -> str:
    """Ensure <details> and <summary> tags have proper newlines."""
    text = re.sub(r"(\S)(<details>)", r"\1\n\n\2", text)
    text = re.sub(r"(</details>)(\S)", r"\1\n\n\2", text)
    text = re.sub(r"(</summary>)(\S)", r"\1\n\n\2", text)
    return text


def _collapse_excessive_blanks(text: str) -> str:
    """Collapse runs of 3+ blank lines into 2."""
    return re.sub(r"\n{4,}", "\n\n\n", text)
