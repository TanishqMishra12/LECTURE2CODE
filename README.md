# Lecture2Code

Lecture2Code is a full-stack application that transforms coding lecture transcripts — sourced from a YouTube URL or pasted directly — into two outputs:

- A **Theory Page**: structured markdown with concept overview, step-by-step explanation, common mistakes, complexity analysis, and key takeaways.
- A **Notebook Page**: interactive code notebook with implementation code, dry-run trace, practice problems with collapsible solutions, and edge case tables. Downloadable as a Jupyter `.ipynb` file.

Processing is powered by an LLM backend (Ollama local models or OpenAI) via LangChain chains that run concurrently.

---

## Project Structure

```
lecture2code/
├── backend/               FastAPI API server
│   ├── main.py            App entry point, CORS, rate limiting
│   ├── config.py          Environment variable settings
│   ├── chains.py          Theory + Notebook LLM chains (parallel)
│   ├── llm.py             LLM factory, chunking/summarisation
│   ├── transcript.py      YouTube transcript extraction + cache
│   ├── session.py         In-memory session store (UUID + TTL)
│   ├── export.py          Jupyter .ipynb builder (nbformat)
│   ├── routers/
│   │   ├── health.py      GET /health
│   │   ├── process.py     POST /process, POST /process/stream
│   │   └── export_router.py  GET /export/{session_id}
│   ├── requirements.txt
│   └── .env.example
└── frontend/              React + Vite UI
    ├── src/
    │   ├── api.js         Fetch wrappers for backend endpoints
    │   ├── context/       AppContext (shared state)
    │   ├── components/    Navbar, Skeleton, Toast, CopyButton, TOC
    │   └── pages/         InputPage, TheoryPage, NotebookPage
    ├── tailwind.config.js
    └── .env.example
```

---

## Requirements

- Python 3.11 or later
- Node.js 18 or later
- One of:
  - [Ollama](https://ollama.com) running locally with `codellama:13b` pulled (default)
  - An OpenAI API key with access to `gpt-4o`

---

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env — set LLM_BACKEND, model, and API keys as needed
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `LLM_BACKEND` | `ollama` | `ollama` or `openai` |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `codellama:13b` | Primary Ollama model |
| `OPENAI_API_KEY` | — | Required when `LLM_BACKEND=openai` |
| `OPENAI_MODEL` | `gpt-4o` | OpenAI model identifier |
| `MAX_TRANSCRIPT_TOKENS` | `6000` | Chunking threshold (approximate tokens) |
| `CACHE_TRANSCRIPTS` | `true` | Cache YouTube transcripts in memory |
| `RATE_LIMIT_PER_HOUR` | `10` | Max requests per IP per hour |
| `SESSION_TTL_SECONDS` | `3600` | How long session data is retained |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed CORS origins |
| `LOG_LEVEL` | `info` | Uvicorn log level |
| `ENABLE_STREAMING` | `true` | Enable SSE streaming endpoint |

---

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The UI will be available at `http://localhost:5173`.

### Frontend Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Backend base URL |
| `VITE_ENABLE_EXPORT` | `true` | Show Jupyter export button |
| `VITE_APP_TITLE` | `Lecture2Code` | Browser tab title |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/process` | Full JSON processing (theory + notebook) |
| `POST` | `/process/stream` | SSE streaming — emits tokens as they are generated |
| `GET` | `/health` | Health check — LLM status and uptime |
| `GET` | `/export/{session_id}` | Download session output as `.ipynb` |

### POST /process

Request body (exactly one of `url` or `transcript` required):

```json
{
  "url": "https://www.youtube.com/watch?v=<video_id>"
}
```

Response:

```json
{
  "session_id": "uuid",
  "theory": "<markdown string>",
  "notebook": "<markdown string>",
  "metadata": {
    "video_id": "...",
    "transcript_token_count": 4200,
    "chunked": false,
    "llm_backend": "ollama",
    "model": "codellama:13b",
    "processing_time_ms": 38000
  }
}
```

---

## LLM Backends

### Ollama (default — local, free)

1. Install Ollama: https://ollama.com
2. Pull the model: `ollama pull codellama:13b`
3. Set `LLM_BACKEND=ollama` in `backend/.env`

A lighter fallback model (`codellama:7b`) is used automatically if the primary model fails.

### OpenAI

1. Obtain an API key from https://platform.openai.com
2. Set `LLM_BACKEND=openai` and `OPENAI_API_KEY=sk-...` in `backend/.env`

---

## Features

- Parallel LLM chains — theory and notebook generated concurrently, halving latency.
- SSE streaming — first tokens appear within ~2 seconds of submission.
- YouTube transcript extraction — no video download required.
- In-memory transcript cache — repeated submissions skip re-extraction.
- Rate limiting — 10 requests per IP per hour via slowapi.
- Jupyter export — notebook output downloadable as a validated `.ipynb` file.
- Collapsible practice problem solutions — hidden by default.
- Sticky table of contents — auto-generated from markdown headings.

---

## Jupyter Export

After processing, the Notebook page shows an "Export .ipynb" button. This calls `GET /export/{session_id}` which builds a Jupyter notebook using `nbformat`:

- Markdown cells for explanations, dry-run traces, and practice problems.
- Python code cells for all implementation code blocks.
- Opens directly in Jupyter Lab or Jupyter Notebook.

---

## Development Notes

- The backend session store is in-memory. Sessions expire after `SESSION_TTL_SECONDS` (default: 1 hour). For a production deployment, replace with Redis or a database.
- Transcript caching is also in-memory. For production, use Redis or a file-system cache.
- The PDF export feature is planned for v1.1 (WeasyPrint).

---

## Roadmap

| Version | Feature |
|---|---|
| v1.1 | PDF export of theory page |
| v1.1 | Multi-language lecture support |
| v1.2 | LMS integration (Moodle / Canvas) |
| v1.3 | In-browser code execution (Pyodide) |
| v2.0 | Personalised practice difficulty via RL feedback |

---

## License

MIT
