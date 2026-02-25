from __future__ import annotations

import re
import nbformat
from nbformat.v4 import new_notebook, new_markdown_cell, new_code_cell


def _split_notebook_markdown(notebook_md: str) -> list[dict]:
    """
    Parse notebook markdown into a list of cells.
    Code fences (```python ... ```) become code cells; everything else is markdown.
    """
    cells = []
    # Split on code fences
    parts = re.split(r"(```python[\s\S]*?```)", notebook_md)
    for part in parts:
        part = part.strip()
        if not part:
            continue
        if part.startswith("```python") and part.endswith("```"):
            # Extract code content
            code = re.sub(r"^```python\n?", "", part)
            code = re.sub(r"\n?```$", "", code)
            cells.append({"type": "code", "source": code.strip()})
        else:
            cells.append({"type": "markdown", "source": part})
    return cells


def build_notebook(theory_md: str, notebook_md: str) -> bytes:
    """
    Build a Jupyter notebook (.ipynb) from the theory and notebook markdown strings.
    Returns the raw bytes of the .ipynb JSON.
    """
    nb = new_notebook()
    nb_cells = []

    # First cell: title
    nb_cells.append(new_markdown_cell("# Lecture2Code — Generated Notebook\n\n---"))

    # Theory section as a collapsed markdown cell
    nb_cells.append(new_markdown_cell("## Theory Reference\n\n" + theory_md))

    # Separator
    nb_cells.append(new_markdown_cell("---\n\n## Interactive Notebook"))

    # Parse notebook markdown into mixed cells
    for cell_data in _split_notebook_markdown(notebook_md):
        if cell_data["type"] == "code":
            nb_cells.append(new_code_cell(cell_data["source"]))
        else:
            nb_cells.append(new_markdown_cell(cell_data["source"]))

    nb.cells = nb_cells
    nb.metadata["kernelspec"] = {
        "display_name": "Python 3",
        "language": "python",
        "name": "python3",
    }
    nb.metadata["language_info"] = {"name": "python", "version": "3.11.0"}

    return nbformat.writes(nb).encode("utf-8")
