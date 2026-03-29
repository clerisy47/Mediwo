import os
import tempfile
from datetime import datetime
from typing import Dict, List, Optional
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
from services.user_service import (
    authenticate_user,
    register_patient,
    register_doctor,
    get_available_doctors,
    get_user_by_id,
)
from services.queue_service import (
    join_queue,
    get_doctor_queue,
    get_patient_queue_status,
    remove_from_queue,
    update_queue_status,
    update_queue_entry_intake_summary,
    get_queue_entry_by_id,
    attach_patient_info_to_queue,
)
from services.patient_summary_service import (
    save_patient_summary,
    get_doctor_patient_summaries,
    get_patient_summary,
    update_summary_status,
    get_patient_summaries_by_patient,
)
from services.patient_info_service import (
    save_patient_medical_info,
    get_patient_info_for_doctor,
    get_patient_info_by_id,
    update_patient_info_status,
    get_patient_info_history,
    add_doctor_notes,
    get_patient_info_with_notes,
    get_or_create_patient_info_for_queue_accept,
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
    doctorId: Optional[str] = None
    patientId: Optional[str] = None
    medical_reports_summary: Optional[str] = ""


class PatientRegisterRequest(BaseModel):
    username: str
    password: str
    full_name: str = None


class DoctorRegisterRequest(BaseModel):
    username: str
    password: str
    full_name: str = None
    specialization: str = None


class LoginRequest(BaseModel):
    username: str
    password: str


class JoinQueueRequest(BaseModel):
    doctor_id: str
    patient_id: str
    patient_name: str


class QueueStatusUpdateRequest(BaseModel):
    queue_id: str
    status: str


class QueueAcceptRequest(BaseModel):
    doctor_id: str


class PatientSummaryRequest(BaseModel):
    patient_id: str
    doctor_id: str
    session_id: str
    conversation_summary: str
    documents_summary: str = None


class SummaryStatusUpdateRequest(BaseModel):
    summary_id: str
    status: str


class PatientMedicalInfoRequest(BaseModel):
    patient_id: str
    doctor_id: str
    medical_reports_summary: str
    conversation_summary: Optional[str] = None


class PatientMedicalInfoStatusRequest(BaseModel):
    status: str


class DoctorNotesRequest(BaseModel):
    info_id: str
    doctor_notes: str


class MedicalReportsSummaryRequest(BaseModel):
    summary: str


@app.get("/")
def home():
    return {"message": "Mediwo FastAPI backend is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/auth/register/patient")
def register_patient_endpoint(payload: PatientRegisterRequest):
    try:
        patient = register_patient(payload.username, payload.password, payload.full_name)
        return {"success": True, "user": patient}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@app.post("/api/auth/register/doctor")
def register_doctor_endpoint(payload: DoctorRegisterRequest):
    try:
        doctor = register_doctor(payload.username, payload.password, payload.full_name, payload.specialization)
        return {"success": True, "user": doctor}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@app.post("/api/auth/login")
def login_endpoint(payload: LoginRequest):
    try:
        user = authenticate_user(payload.username, payload.password)
        if user:
            return {"success": True, "user": user}
        else:
            raise HTTPException(status_code=401, detail="Invalid username or password")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@app.get("/api/doctors/available")
def get_available_doctors_endpoint():
    try:
        doctors = get_available_doctors()
        return {"success": True, "doctors": doctors}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch doctors: {str(e)}")


@app.post("/api/queue/join")
def join_queue_endpoint(payload: JoinQueueRequest):
    try:
        queue_info = join_queue(payload.doctor_id, payload.patient_id, payload.patient_name)
        return {"success": True, "queue_info": queue_info}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to join queue: {str(e)}")


@app.get("/api/queue/doctor/{doctor_id}")
def get_doctor_queue_endpoint(doctor_id: str):
    try:
        queue = get_doctor_queue(doctor_id)
        return {"success": True, "queue": queue}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get doctor queue: {str(e)}")


@app.get("/api/queue/doctor/{doctor_id}/detailed")
def get_doctor_queue_detailed_endpoint(doctor_id: str):
    """Get doctor's queue with full patient information including medical reports and intake summaries"""
    try:
        queue = get_doctor_queue(doctor_id)
        
        # The queue already includes medical_reports_summary, intake_summary, and patient_info_id
        # from the MongoDB document. Just ensure the response is properly formatted.
        detailed_queue = []
        for entry in queue:
            detailed_queue.append({
                "queue_id": entry.get("queue_id"),
                "patient_id": entry.get("patient_id"),
                "patient_name": entry.get("patient_name"),
                "doctor_id": entry.get("doctor_id"),
                "position": entry.get("position"),
                "estimated_wait_time": entry.get("estimated_wait_time"),
                "status": entry.get("status"),
                "joined_at": entry.get("joined_at").isoformat() if hasattr(entry.get("joined_at"), 'isoformat') else str(entry.get("joined_at")),
                "medical_reports_summary": entry.get("medical_reports_summary"),
                "intake_summary": entry.get("intake_summary"),
                "patient_info_id": entry.get("patient_info_id")
            })
        
        return {"success": True, "queue": detailed_queue}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get doctor queue: {str(e)}")


@app.get("/api/queue/patient/{patient_id}")
def get_patient_queue_status_endpoint(patient_id: str):
    try:
        status = get_patient_queue_status(patient_id)
        if status:
            return {"success": True, "queue_status": status}
        else:
            return {"success": True, "queue_status": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get patient queue status: {str(e)}")


@app.put("/api/queue/status")
def update_queue_status_endpoint(payload: QueueStatusUpdateRequest):
    try:
        success = update_queue_status(payload.queue_id, payload.status)
        if success:
            return {"success": True}
        else:
            raise HTTPException(status_code=404, detail="Queue entry not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update queue status: {str(e)}")


@app.post("/api/queue/{queue_id}/accept")
def accept_queue_patient_endpoint(queue_id: str, payload: QueueAcceptRequest):
    """Doctor accepts a queued patient and ensures patient review info exists."""
    try:
        queue_entry = get_queue_entry_by_id(queue_id)
        if not queue_entry:
            raise HTTPException(status_code=404, detail="Queue entry not found")

        if queue_entry.get("doctor_id") != payload.doctor_id:
            raise HTTPException(status_code=403, detail="This queue entry does not belong to the current doctor")

        patient_info = get_or_create_patient_info_for_queue_accept(
            patient_id=queue_entry.get("patient_id"),
            doctor_id=payload.doctor_id,
            queue_id=queue_id,
            medical_reports_summary=queue_entry.get("medical_reports_summary"),
            conversation_summary=queue_entry.get("intake_summary"),
        )

        status_updated = update_queue_status(queue_id, "in_consultation")
        if not status_updated:
            raise HTTPException(status_code=500, detail="Failed to update queue status for accepted patient")

        attach_patient_info_to_queue(
            queue_id=queue_id,
            patient_info_id=patient_info.get("id"),
            intake_summary=patient_info.get("conversation_summary"),
        )

        return {
            "success": True,
            "message": "Patient accepted successfully",
            "patient_info": patient_info,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to accept queue patient: {str(e)}")


@app.post("/api/patient-summaries")
def save_patient_summary_endpoint(payload: PatientSummaryRequest):
    try:
        summary = save_patient_summary(
            payload.patient_id,
            payload.doctor_id,
            payload.session_id,
            payload.conversation_summary,
            payload.documents_summary
        )
        return {"success": True, "summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save patient summary: {str(e)}")


@app.get("/api/patient-summaries/doctor/{doctor_id}")
def get_doctor_summaries_endpoint(doctor_id: str):
    try:
        summaries = get_doctor_patient_summaries(doctor_id)
        return {"success": True, "summaries": summaries}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get doctor summaries: {str(e)}")


@app.get("/api/patient-summaries/{summary_id}")
def get_patient_summary_endpoint(summary_id: str):
    try:
        summary = get_patient_summary(summary_id)
        if summary:
            return {"success": True, "summary": summary}
        else:
            raise HTTPException(status_code=404, detail="Summary not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get patient summary: {str(e)}")


@app.put("/api/patient-summaries/status")
def update_summary_status_endpoint(payload: SummaryStatusUpdateRequest):
    try:
        success = update_summary_status(payload.summary_id, payload.status)
        if success:
            return {"success": True}
        else:
            raise HTTPException(status_code=404, detail="Summary not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update summary status: {str(e)}")


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
        # Generate summary from conversation
        try:
            summary = generate_intake_summary(conversation)
        except Exception as summary_error:
            raise RuntimeError(f"Failed to generate intake summary: {str(summary_error)}") from summary_error
        
        resolved_doctor_id = payload.doctorId
        if not resolved_doctor_id and payload.patientId:
            try:
                from database import get_database

                db = get_database()
                queues_collection = db["queues"]
                active_queue_entry = queues_collection.find_one(
                    {
                        "patient_id": payload.patientId,
                        "status": {"$in": ["waiting", "in_consultation"]},
                    },
                    sort=[("joined_at", -1)],
                )
                if active_queue_entry:
                    resolved_doctor_id = active_queue_entry.get("doctor_id")
            except Exception as queue_lookup_error:
                print(f"Warning: Failed to infer doctor from queue: {str(queue_lookup_error)}")

        # If doctor ID is available, save the summary and medical info to that doctor
        if resolved_doctor_id and payload.patientId:
            try:
                # Save to patient_info collection for doctor to review
                # Include both conversation summary and medical reports summary
                save_patient_medical_info(
                    patient_id=payload.patientId,
                    doctor_id=resolved_doctor_id,
                    medical_reports_summary=payload.medical_reports_summary or "",
                    conversation_summary=summary,
                    status="pending"
                )
                
                # Also update the queue entry with the intake summary
                update_queue_entry_intake_summary(
                    patient_id=payload.patientId,
                    doctor_id=resolved_doctor_id,
                    intake_summary=summary
                )
                
                # Also save to the older patient_summary for compatibility
                save_patient_summary(
                    patient_id=payload.patientId,
                    doctor_id=resolved_doctor_id,
                    session_id=payload.sessionId,
                    conversation_summary=summary,
                    documents_summary=payload.medical_reports_summary or None
                )
            except Exception as db_error:
                # Log but don't fail - summary was generated successfully
                print(f"Warning: Failed to save to database: {str(db_error)}")
        
        # Clean up old session
        del intake_sessions[payload.sessionId]
        
        return {"success": True, "summary": summary}
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Intake completion failed: {str(exc)}") from exc



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


# ==================== Patient Medical Information Endpoints ====================

@app.post("/api/patient-medical-info")
def save_patient_medical_info_endpoint(payload: PatientMedicalInfoRequest):
    """Save patient's medical information after intake completion"""
    try:
        info = save_patient_medical_info(
            patient_id=payload.patient_id,
            doctor_id=payload.doctor_id,
            medical_reports_summary=payload.medical_reports_summary,
            conversation_summary=payload.conversation_summary,
            status="pending"
        )
        return {"success": True, "info": info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save patient medical info: {str(e)}")


@app.get("/api/doctor/{doctor_id}/patients-ready")
def get_patients_ready_for_doctor(doctor_id: str):
    """Get all patients whose intakes are ready for doctor review"""
    try:
        patient_infos = get_patient_info_for_doctor(doctor_id)
        return {
            "success": True,
            "count": len(patient_infos),
            "patients": patient_infos
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch patient information: {str(e)}")


@app.get("/api/patient-medical-info/{info_id}")
def get_patient_medical_info_endpoint(info_id: str):
    """Get detailed patient medical information"""
    try:
        info = get_patient_info_with_notes(info_id)
        if info:
            return {"success": True, "info": info}
        else:
            raise HTTPException(status_code=404, detail="Patient information not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch patient medical info: {str(e)}")


@app.put("/api/patient-medical-info/{info_id}/status")
def update_patient_medical_info_status_endpoint(info_id: str, payload: PatientMedicalInfoStatusRequest):
    """Update status of patient medical information"""
    try:
        success = update_patient_info_status(info_id, payload.status)
        if success:
            return {"success": True}
        else:
            raise HTTPException(status_code=404, detail="Patient information not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update patient medical info status: {str(e)}")


@app.post("/api/patient-medical-info/{info_id}/notes")
def add_doctor_notes_endpoint(info_id: str, payload: DoctorNotesRequest):
    """Add doctor's notes/review to patient medical information"""
    try:
        success = add_doctor_notes(info_id, payload.doctor_notes)
        if success:
            # Keep queue as source of truth for visit progress.
            from database import get_database

            db = get_database()
            patient_info_collection = db["patient_info"]
            queues_collection = db["queues"]

            info = patient_info_collection.find_one({"id": info_id})
            if info:
                source_queue_id = info.get("source_queue_id")
                if source_queue_id:
                    update_queue_status(source_queue_id, "completed")
                else:
                    queues_collection.update_one(
                        {
                            "patient_id": info.get("patient_id"),
                            "doctor_id": info.get("doctor_id"),
                            "status": {"$in": ["waiting", "in_consultation"]},
                        },
                        {"$set": {"status": "completed", "updated_at": datetime.utcnow()}},
                    )

            return {"success": True, "message": "Doctor notes added successfully"}
        else:
            raise HTTPException(status_code=404, detail="Patient information not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add doctor notes: {str(e)}")


@app.get("/api/patient/{patient_id}/medical-history")
def get_patient_medical_history(patient_id: str):
    """Get patient's medical history"""
    try:
        history = get_patient_info_history(patient_id)
        return {
            "success": True,
            "count": len(history),
            "history": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch patient history: {str(e)}")


@app.post("/api/patient/{patient_id}/medical-reports-summary")
def save_medical_reports_summary(patient_id: str, payload: MedicalReportsSummaryRequest):
    """Save a medical reports summary for a patient"""
    try:
        from database import get_database
        db = get_database()
        summaries_collection = db["medical_reports_summaries"]
        
        summary_doc = {
            "patient_id": patient_id,
            "summary": payload.summary,
            "created_at": datetime.utcnow()
        }
        
        result = summaries_collection.insert_one(summary_doc)
        
        return {
            "success": True,
            "id": str(result.inserted_id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save medical reports summary: {str(e)}")


@app.get("/api/patient/{patient_id}/medical-reports-summary")
def get_medical_reports_summaries(patient_id: str):
    """Get all saved medical reports summaries for a patient"""
    try:
        from database import get_database
        db = get_database()
        summaries_collection = db["medical_reports_summaries"]
        
        summaries = list(summaries_collection.find(
            {"patient_id": patient_id}
        ).sort("created_at", -1))
        
        return {
            "success": True,
            "summaries": [
                {
                    "id": str(s["_id"]),
                    "summary": s["summary"],
                    "created_at": s["created_at"].isoformat() if hasattr(s["created_at"], 'isoformat') else str(s["created_at"])
                }
                for s in summaries
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch medical reports summaries: {str(e)}")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
