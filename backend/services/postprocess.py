"""Post-processing utilities to clean up LLM-generated Markdown output."""
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
    text = text.replace("\r\n", "\n")
    return text


def _ensure_heading_newlines(text: str) -> str:
    lines = text.split("\n")
    result: list[str] = []
    for i, line in enumerate(lines):
        stripped = line.strip()
        if re.match(r"^#{1,6}\s", stripped):
            if result and result[-1].strip() != "":
                result.append("")
            result.append(line)
        else:
            if result and re.match(r"^#{1,6}\s", result[-1].strip()) and stripped != "":
                result.append("")
            result.append(line)
    return "\n".join(result)


def _ensure_list_newlines(text: str) -> str:
    text = re.sub(r"(\S)(\d+\.\s)", r"\1\n\2", text)
    text = re.sub(r"(\S)((?:^|\n)\s*[-*]\s)", r"\1\n\2", text)
    return text


def _fix_table_formatting(text: str) -> str:
    lines = text.split("\n")
    result: list[str] = []
    for line in lines:
        if "|" in line and line.count("|") >= 4:
            stripped = line.strip()
            if stripped.startswith("|") or re.match(r"^[^|]+\|[^|]+\|", stripped):
                if result and result[-1].strip() != "" and not result[-1].strip().startswith("|"):
                    if "|" not in result[-1] and not re.match(r"^#{1,6}\s", result[-1].strip()):
                        result.append("")
        result.append(line)
    return "\n".join(result)


def _fix_code_fences(text: str) -> str:
    lines = text.split("\n")
    result: list[str] = []
    in_code_block = False
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("```"):
            if not in_code_block:
                if result and result[-1].strip() != "":
                    result.append("")
                result.append(line)
                in_code_block = True
            else:
                result.append(line)
                in_code_block = False
        else:
            if (result and result[-1].strip().startswith("```")
                    and not in_code_block and stripped != ""):
                result.append("")
            result.append(line)
    return "\n".join(result)


def _fix_details_blocks(text: str) -> str:
    text = re.sub(r"(\S)(<details>)", r"\1\n\n\2", text)
    text = re.sub(r"(</details>)(\S)", r"\1\n\n\2", text)
    text = re.sub(r"(</summary>)(\S)", r"\1\n\n\2", text)
    return text


def _collapse_excessive_blanks(text: str) -> str:
    return re.sub(r"\n{4,}", "\n\n\n", text)
