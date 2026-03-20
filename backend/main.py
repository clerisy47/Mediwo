import os
import tempfile
from typing import Dict, List
from uuid import uuid4

import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from pipelines.document_parser import summarize_with_ocr
from pipelines.intake_questioning import (
    generate_assistant_reply,
    generate_intake_summary,
    get_initial_message,
)

app = FastAPI(title="Mediwo Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

intake_sessions: Dict[str, List[Dict[str, str]]] = {}


class IntakeMessageRequest(BaseModel):
    sessionId: str
    message: str


class IntakeCompleteRequest(BaseModel):
    sessionId: str


@app.get("/")
def home():
    return {"message": "Mediwo FastAPI backend is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/intake/start")
def start_intake_session():
    session_id = uuid4().hex
    assistant_message = get_initial_message()

    intake_sessions[session_id] = [{"role": "ai", "message": assistant_message}]

    return {"sessionId": session_id, "assistantMessage": assistant_message}


@app.post("/api/intake/message")
def send_intake_message(payload: IntakeMessageRequest):
    if payload.sessionId not in intake_sessions:
        raise HTTPException(status_code=404, detail="Intake session not found")

    message = payload.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    conversation = intake_sessions[payload.sessionId]
    conversation.append({"role": "patient", "message": message})

    try:
        assistant_reply = generate_assistant_reply(conversation)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    conversation.append({"role": "ai", "message": assistant_reply})

    return {"assistantMessage": assistant_reply}


@app.post("/api/intake/complete")
def complete_intake_session(payload: IntakeCompleteRequest):
    if payload.sessionId not in intake_sessions:
        raise HTTPException(status_code=404, detail="Intake session not found")

    conversation = intake_sessions[payload.sessionId]

    try:
        summary = generate_intake_summary(conversation)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {"summary": summary}


@app.post("/api/documents/parse")
async def parse_document(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="File name is required")

    suffix = os.path.splitext(file.filename)[1] or ".pdf"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_path = temp_file.name
        temp_file.write(await file.read())

    try:
        summary = summarize_with_ocr(temp_path)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to parse document: {exc}") from exc
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    return {"fileName": file.filename, "summary": summary}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
