# AI Bug Report Generator

Converts an informal issue description into a structured, developer-ready bug report. A classification step runs first, so feature requests and questions aren't forced into fake bug reports with fabricated severity or reproduction steps. The core logic is exposed two ways: a REST API for the human-facing web form, and an MCP tool for agent callers.

## What you need before starting

- **Python 3.10+**
- **Node.js 18+** and npm
- **A Groq API key** — required. Get one free at https://console.groq.com/keys (sign up, go to "API Keys", create a new key, no credit card, ~2 minutes). Without this key the backend will not start.
- **Docker Desktop** (optional, only if running via Docker Compose) — https://www.docker.com/products/docker-desktop/

## Screenshots

**Describe the bug**
![Bug description form](/screenshots/bug_report_view.png)

**Structured, editable report**
![Generated bug report](/screenshots/input_view.png)


## Project structure

```
bug_report/
├── backend/
│   ├── main.py             FastAPI REST endpoint (/api/generate)
│   ├── mcp_server.py       MCP tool, same logic, for agent callers
│   ├── groq_client.py      Single Groq call shared by both interfaces
│   ├── schema.py           Pydantic schema — shared response shape
│   ├── Dockerfile          Container build for the backend
│   ├── .env                Your Groq API key goes here (you create this)
│   └── .env.example        Template for the above
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── ReportEditor.jsx
│   │   │   └── ExportPreview.jsx
│   │   └── lib/api.js
│   ├── Dockerfile          Container build for the frontend
│   └── package.json
├── docker-compose.yml
├── .dockerignore
├── requirements.txt
└── README.md
```

## Option A: Run locally (Python + Node)

### 1. Backend setup

Open a terminal in the project root.

```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r ..\requirements.txt
```

Create your `.env` file:

```cmd
copy .env.example .env
```

Open `backend\.env` in a text editor and paste in your key:

```
GROQ_API_KEY=your_actual_key_here
```

Start the backend:

```cmd
uvicorn main:app --reload --port 8000
```

Leave this terminal running. You should see `Application startup complete`. Confirm it's up by visiting http://localhost:8000/health in a browser — it should return `{"status":"ok"}`.

### 2. Frontend setup

Open a **second** terminal in the project root.

```cmd
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser. The backend must already be running (step 1) for report generation to work.

### 3. (Optional) MCP server, for agent access

The MCP server exposes the same bug-report logic as a tool other agents (Claude Desktop, MCP Inspector, etc.) can call directly, without going through the web form.

```cmd
cd backend
venv\Scripts\activate
python mcp_server.py
```

To test it with MCP Inspector:

```cmd
npx @modelcontextprotocol/inspector
```

In the Inspector UI: Transport Type `STDIO`, Command `python`, Arguments `mcp_server.py`, then click Connect.

## Option B: Run with Docker

Requires Docker Desktop installed and running.

**1. Add your API key.** Docker Compose reads it from `backend/.env`, this file is not included in the repo (it's gitignored for security). Create it before starting:

```cmd
cd backend
copy .env.example .env
```

Edit `backend\.env` and paste in your key:

```
GROQ_API_KEY=your_actual_key_here
```

**2. Build and start both services** from the project root:

```cmd
cd ..
docker compose up --build
```

First run takes a few minutes while images build. Watch the logs for `Uvicorn running on http://0.0.0.0:8000` from the backend service with no errors.

**3. Verify:**
- http://localhost:8000/health → should return `{"status":"ok"}`
- http://localhost:5173 → app UI, submit a test description end to end

**4. Stop:**

```cmd
Ctrl+C
docker compose down
```

## Environment variables reference

| Variable | Required | Where | Description |
|---|---|---|---|
| `GROQ_API_KEY` | Yes | `backend/.env` | Your Groq API key. The app calls `llama-3.3-70b-versatile` via Groq's chat completions API. Never committed to the repo, both local and Docker setups require you to supply your own. |

No other environment variables or API keys are needed.

## Guardrails implemented

- **Classification gate**: every input is classified as `bug`, `feature_request`, `question`, or `unclear` before any bug-specific fields are generated. Only `bug` gets severity, priority, and repro steps populated.
- **Structured output enforced**: Groq's `response_format: json_object` keeps the model's output inside the expected schema.
- **Instruction isolation**: the system prompt explicitly states user input cannot override its rules (basic prompt-injection guard).
- **Input floor**: descriptions under 10 characters are rejected before an API call is made.

## Troubleshooting

- **`KeyError: 'GROQ_API_KEY'` on startup**: your `.env` file is missing or not in `backend/`, or the key name is misspelled.
- **`TypeError: Client.__init__() got an unexpected keyword argument 'proxies'`**: version mismatch between `groq` and `httpx`. Run `pip install --upgrade groq` inside the activated venv.
- **Frontend shows a network error**: confirm the backend is running on port 8000 and `frontend/src/lib/api.js` points to `http://localhost:8000`.
- **CORS error in browser console**: confirm the frontend is running on port 5173 (`main.py`'s CORS config only allows that origin by default).
- **Docker build fails or hangs**: confirm Docker Desktop is fully started (steady whale icon, not animating) before running `docker compose up`.
- **Docker backend container exits immediately**: almost always a missing or empty `backend/.env`, see Option B step 1.

## Roadmap

- Screenshot analysis via a vision-capable Groq model
- Log file analysis and stack trace correlation
- Duplicate bug detection via embedding similarity
- Trace-to-code mapping (agentic repository search)
