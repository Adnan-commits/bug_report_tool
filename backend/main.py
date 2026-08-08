from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schema import BugReportRequest, BugReport
from groq_client import generate_bug_report

app = FastAPI(title="AI Bug Report Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/generate", response_model=BugReport)
def generate(payload: BugReportRequest):
    try:
        return generate_bug_report(payload.description)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")


@app.get("/health")
def health():
    return {"status": "ok"}