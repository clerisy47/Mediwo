from typing import Dict, List, Optional
from uuid import uuid4
from datetime import datetime
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_database


def _get_summaries_collection():
    """Get MongoDB collection for patient summaries."""
    db = get_database()
    return db["patient_summaries"]


def _serialize_summary(summary: Dict) -> Dict:
    """Convert MongoDB document into API-safe summary payload."""
    created_at = summary.get("created_at")
    updated_at = summary.get("updated_at")

    return {
        "id": summary.get("id"),
        "patient_id": summary.get("patient_id"),
        "doctor_id": summary.get("doctor_id"),
        "session_id": summary.get("session_id"),
        "conversation_summary": summary.get("conversation_summary"),
        "documents_summary": summary.get("documents_summary"),
        "created_at": created_at.isoformat() if hasattr(created_at, "isoformat") else created_at,
        "updated_at": updated_at.isoformat() if hasattr(updated_at, "isoformat") else updated_at,
        "status": summary.get("status"),
    }


def save_patient_summary(
    patient_id: str,
    doctor_id: str,
    session_id: str,
    conversation_summary: str,
    documents_summary: str = None
) -> Dict:
    """Save patient intake summary for doctor in MongoDB."""
    summaries_collection = _get_summaries_collection()

    summary_entry = {
        "id": uuid4().hex,
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "session_id": session_id,
        "conversation_summary": conversation_summary,
        "documents_summary": documents_summary,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "status": "pending_review"  # pending_review, reviewed, consultation_completed
    }

    summaries_collection.insert_one(summary_entry)
    
    return {
        "id": summary_entry["id"],
        "patient_id": summary_entry["patient_id"],
        "doctor_id": summary_entry["doctor_id"],
        "created_at": summary_entry["created_at"].isoformat(),
        "status": summary_entry["status"]
    }


def get_doctor_patient_summaries(doctor_id: str) -> List[Dict]:
    """Get all patient summaries for a specific doctor from MongoDB."""
    summaries_collection = _get_summaries_collection()
    doctor_summaries = list(
        summaries_collection.find({"doctor_id": doctor_id}).sort("created_at", -1)
    )
    return [_serialize_summary(summary) for summary in doctor_summaries]


def get_patient_summary(summary_id: str) -> Optional[Dict]:
    """Get a specific patient summary by ID from MongoDB."""
    summaries_collection = _get_summaries_collection()
    summary = summaries_collection.find_one({"id": summary_id})
    if not summary:
        return None
    return _serialize_summary(summary)


def update_summary_status(summary_id: str, status: str) -> bool:
    """Update the status of a patient summary in MongoDB."""
    summaries_collection = _get_summaries_collection()
    result = summaries_collection.update_one(
        {"id": summary_id},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}},
    )
    return result.modified_count > 0


def get_patient_summaries_by_patient(patient_id: str) -> List[Dict]:
    """Get all summaries for a specific patient from MongoDB."""
    summaries_collection = _get_summaries_collection()
    patient_summaries = list(
        summaries_collection.find({"patient_id": patient_id}).sort("created_at", -1)
    )
    return [_serialize_summary(summary) for summary in patient_summaries]
