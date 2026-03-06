# Lecture2Code

> Turn any coding lecture into structured theory notes and interactive code notebooks using AI.

## Prerequisites

- **Python 3.11+** with `pip`
- **Node.js 18+** with `npm`
- **OpenAI API key** (or Ollama running locally)

## Quick Start

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env — add your OPENAI_API_KEY
uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ingest` | Submit a lecture for processing |
| `GET` | `/api/status/{jobId}` | Check processing status |
| `GET` | `/api/results/{jobId}` | Get results (when done) |
| `GET` | `/health` | Health check |

### Ingest Request Body

```json
{
  "source": "https://youtube.com/watch?v=...",
  "input_type": "youtube"
}
```

`input_type` can be: `youtube`, `pdf`, or `transcript`.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | — | Your OpenAI API key |
| `LLM_BACKEND` | `ollama` | `openai` or `ollama` |
| `DATABASE_URL` | `sqlite:///./lecture2code.db` | SQLite database path |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed CORS origins |

## Project Structure

```
lecture2code/
├── backend/
│   ├── api/routes/       # FastAPI route handlers
│   ├── chains/           # LLM prompt chains
│   ├── core/             # Config & database
│   ├── jobs/             # Background job processor
│   ├── models/           # SQLAlchemy & Pydantic schemas
│   ├── services/         # Business logic services
│   └── main.py           # App entry point
├── frontend/
│   ├── src/
│   │   ├── pages/        # Landing, Input, Results
│   │   ├── hooks/        # useJobPolling
│   │   └── store/        # Result cache
│   └── package.json
└── README.md
```

## License

MIT
