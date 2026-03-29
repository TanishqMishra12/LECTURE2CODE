# 📚 Lecture2Code

> Turn any coding lecture — YouTube video, PDF, or raw transcript — into structured **theory notes**, an **interactive code notebook**, and a **visual flowchart**, all powered by AI.

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.12+ |
| [uv](https://docs.astral.sh/uv/) | Latest |
| Node.js | 18+ |
| npm | 9+ |
| OpenAI API key **or** Ollama running locally | — |

---

### 1. Clone & Configure Backend

```bash
cd backend
cp .env.example .env
# Edit .env — add your OPENAI_API_KEY (or configure Ollama)
```

### 2. Start Backend

```bash
cd backend
uv run uvicorn main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**  
Interactive API docs: **http://localhost:8000/docs**

### 3. Start Frontend

```bash
cd frontend
npm install      # first time only
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🛠️ Tech Stack

### Backend

| Layer | Technology |
|-------|-----------|
| Web framework | [FastAPI](https://fastapi.tiangolo.com/) |
| Package manager | [uv](https://docs.astral.sh/uv/) |
| Database | SQLite via [SQLAlchemy](https://www.sqlalchemy.org/) |
| LLM integration | OpenAI API / [Ollama](https://ollama.ai/) (local) |
| LLM orchestration | LangChain |
| PDF extraction | PyMuPDF |
| YouTube transcripts | `youtube-transcript-api` |
| Background tasks | FastAPI `BackgroundTasks` |
| Validation | Pydantic v2 |
| Runtime | Python 3.12 |

### Frontend

| Layer | Technology |
|-------|-----------|
| Framework | React 19 (Vite) |
| Routing | React Router v7 |
| Markdown rendering | `react-markdown` + `rehype-highlight` |
| Styling | Tailwind CSS v3 |
| HTTP client | Fetch API (custom `api.js` wrapper) |
| Code highlighting | highlight.js |

---

## 🔄 Data Flow

```
User Input (YouTube URL / PDF / Transcript)
        │
        ▼
  POST /api/ingest  ──────────────────────────────────┐
        │                                              │
        ▼                                              │
  Job created in SQLite DB (status: pending)           │
        │                                              │
        ▼                                              │
  BackgroundTask spawned                               │
        │                                              │
        ├── [youtube]  → youtube-transcript-api        │
        ├── [pdf]      → PyMuPDF text extraction       │
        └── [transcript] → raw text used directly      │
                │                                      │
                ▼                               Frontend polls
        Text extracted & cleaned              GET /api/status/{jobId}
                │                              every 2 seconds
                ▼                                      │
        ┌───────────────────────┐                      │
        │   LLM Chains (async,  │                      │
        │   run concurrently)   │                      │
        │  ┌─────────────────┐  │                      │
        │  │  Theory Chain   │  │                      │
        │  │ (structured MD) │  │                      │
        │  ├─────────────────┤  │                      │
        │  │ Notebook Chain  │  │                      │
        │  │ (runnable code) │  │                      │
        │  ├─────────────────┤  │                      │
        │  │ Flowchart Chain │  │                      │
        │  │   (Mermaid MD)  │  │                      │
        │  └─────────────────┘  │                      │
        └───────────────────────┘                      │
                │                                      │
                ▼                                      │
        Result stored as JSON in DB                    │
        (status: done, progress: 100)                  │
                │                                      │
                └──────────────────────────────────────┘
                        │
                        ▼
              GET /api/results/{jobId}
                        │
                        ▼
            Results Page (Theory / Notebook / Flowchart tabs)
```

### Job Status Lifecycle

```
pending → extracting (10%) → processing (30%) → [80%] → done (100%)
                                                        └── error (on failure)
```

---

## 📡 API Reference

### Base URL
```
http://localhost:8000/api
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ingest` | Submit a YouTube URL or transcript (JSON body) |
| `POST` | `/api/ingest/pdf` | Submit a PDF file (multipart/form-data) |
| `GET` | `/api/status/{jobId}` | Poll job processing status & progress |
| `GET` | `/api/results/{jobId}` | Fetch completed results (theory, notebook, flowchart) |
| `GET` | `/health` | Health check |

### POST `/api/ingest` — JSON Body

```json
{
  "source": "https://youtube.com/watch?v=...",
  "input_type": "youtube"
}
```

**`input_type` values:**

| Value | Description |
|-------|-------------|
| `youtube` | YouTube video URL — transcript auto-fetched |
| `pdf` | Use `/api/ingest/pdf` instead |
| `transcript` | Raw text pasted directly into `source` field |

### POST `/api/ingest/pdf` — Form Data

```bash
curl -X POST http://localhost:8000/api/ingest/pdf \
  -F "file=@lecture.pdf"
```

- Max file size: **20 MB**
- Max pages: **50**

### GET `/api/status/{jobId}`

```json
{
  "success": true,
  "data": {
    "jobId": "abc-123",
    "status": "processing",
    "progress": 30
  },
  "error": null
}
```

### GET `/api/results/{jobId}`

```json
{
  "success": true,
  "data": {
    "jobId": "abc-123",
    "theory": { "content": "# Topic\n..." },
    "notebook": { "content": "```python\n...\n```" },
    "flowchart": { "content": "```mermaid\ngraph TD\n...\n```" }
  },
  "error": null
}
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` in the `backend/` folder and configure:

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_BACKEND` | `ollama` | `openai` or `ollama` |
| `OPENAI_API_KEY` | — | Your OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o` | OpenAI model name |
| `OPENAI_BASE_URL` | — | Custom base URL (e.g. Groq, Azure) |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `codellama:13b` | Ollama model to use |
| `DATABASE_URL` | `sqlite:///./lecture2code.db` | SQLite DB path |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed frontend origins |
| `MAX_TRANSCRIPT_TOKENS` | `6000` | Token limit for transcripts |
| `MAX_PDF_PAGES` | `50` | Max pages to extract from a PDF |
| `MAX_PDF_SIZE_MB` | `20` | Max PDF upload size |
| `RATE_LIMIT_PER_HOUR` | `10` | Jobs allowed per IP per hour |
| `LOG_LEVEL` | `info` | Logging verbosity |

### Using OpenAI

```env
LLM_BACKEND=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
```

### Using Ollama (local)

```env
LLM_BACKEND=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=codellama:13b
```

### Using Groq (OpenAI-compatible)

```env
LLM_BACKEND=openai
OPENAI_API_KEY=gsk_...
OPENAI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_MODEL=llama-3.3-70b-versatile
```

---

## 🗂️ Project Structure

```
lecture2code/
├── backend/
│   ├── api/
│   │   └── routes/
│   │       ├── ingest.py        # POST /api/ingest, POST /api/ingest/pdf
│   │       ├── status.py        # GET /api/status/{jobId}
│   │       └── results.py       # GET /api/results/{jobId}
│   ├── chains/
│   │   ├── theory_chain.py      # LLM chain → structured theory markdown
│   │   ├── notebook_chain.py    # LLM chain → runnable code notebook
│   │   ├── flowchart_chain.py   # LLM chain → Mermaid.js flowchart
│   │   └── prompts.py           # All LLM prompt templates
│   ├── core/
│   │   ├── config.py            # Settings (pydantic-settings, .env)
│   │   └── database.py          # SQLAlchemy engine & session
│   ├── jobs/
│   │   └── process_job.py       # Background job orchestrator
│   ├── models/
│   │   └── schemas.py           # SQLAlchemy models & Pydantic schemas
│   ├── services/
│   │   ├── transcript_service.py # YouTube transcript fetching & caching
│   │   ├── pdf_service.py        # PyMuPDF PDF text extraction
│   │   └── llm_service.py        # LLM client (OpenAI / Ollama)
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Environment variable template
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── LandingPage.jsx  # Home / marketing landing page
    │   │   ├── InputPage.jsx    # URL / transcript / PDF input form
    │   │   ├── Results.jsx      # Results viewer (Theory / Notebook / Flowchart tabs)
    │   │   ├── TheoryPage.jsx   # Standalone theory view
    │   │   ├── NotebookPage.jsx # Standalone notebook view
    │   │   └── PdfResultPage.jsx # PDF job results page
    │   ├── components/
    │   │   ├── Navbar.jsx       # Top navigation bar
    │   │   ├── Footer.jsx       # Page footer
    │   │   ├── CopyButton.jsx   # Copy-to-clipboard button
    │   │   ├── TableOfContents.jsx # Auto-generated ToC from markdown
    │   │   ├── Toast.jsx        # Toast notification system
    │   │   └── Skeleton.jsx     # Loading skeleton UI
    │   ├── hooks/               # Custom React hooks (job polling, etc.)
    │   ├── store/               # Result cache / state management
    │   ├── context/             # React context providers
    │   ├── api.js               # Centralized API client
    │   └── App.jsx              # Root app with routing
    └── package.json
```

---

## 🧑‍💻 Development Tips

- The backend runs with **hot-reload** (`--reload`) so code changes take effect immediately.
- The Vite frontend also supports **HMR** — no refresh needed.
- View the auto-generated interactive API docs at **http://localhost:8000/docs** (Swagger UI).
- SQLite DB file is at `backend/lecture2code.db` — delete it to reset all jobs.
- To add a new LLM chain, create a file in `backend/chains/` and call it from `process_job.py`.

---

## 📄 License

MIT
