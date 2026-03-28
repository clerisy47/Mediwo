import json
import os
from typing import Dict, List, Optional
from uuid import uuid4
from datetime import datetime

SUMMARIES_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "patient_summaries.json")


def _load_summaries() -> Dict:
    """Load patient summaries from JSON file"""
    try:
        with open(SUMMARIES_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"summaries": []}


def _save_summaries(summaries: Dict) -> None:
    """Save summaries to JSON file"""
    os.makedirs(os.path.dirname(SUMMARIES_FILE), exist_ok=True)
    with open(SUMMARIES_FILE, 'w') as f:
        json.dump(summaries, f, indent=2)


def save_patient_summary(
    patient_id: str,
    doctor_id: str,
    session_id: str,
    conversation_summary: str,
    documents_summary: str = None
) -> Dict:
    """Save patient intake summary for doctor"""
    summaries = _load_summaries()
    
    # Create new summary entry
    summary_entry = {
        "id": uuid4().hex,
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "session_id": session_id,
        "conversation_summary": conversation_summary,
        "documents_summary": documents_summary,
        "created_at": datetime.now().isoformat(),
        "status": "pending_review"  # pending_review, reviewed, consultation_completed
    }
    
    summaries["summaries"].append(summary_entry)
    _save_summaries(summaries)
    
    return {
        "id": summary_entry["id"],
        "patient_id": summary_entry["patient_id"],
        "doctor_id": summary_entry["doctor_id"],
        "created_at": summary_entry["created_at"],
        "status": summary_entry["status"]
    }


def get_doctor_patient_summaries(doctor_id: str) -> List[Dict]:
    """Get all patient summaries for a specific doctor"""
    summaries = _load_summaries()
    
    # Filter summaries for this doctor and sort by creation date (newest first)
    doctor_summaries = [
        s for s in summaries["summaries"] 
        if s["doctor_id"] == doctor_id
    ]
    
    # Sort by created_at descending
    doctor_summaries.sort(key=lambda x: x["created_at"], reverse=True)
    
    return doctor_summaries


def get_patient_summary(summary_id: str) -> Optional[Dict]:
    """Get a specific patient summary by ID"""
    summaries = _load_summaries()
    
    for summary in summaries["summaries"]:
        if summary["id"] == summary_id:
            return summary
    
    return None


def update_summary_status(summary_id: str, status: str) -> bool:
    """Update the status of a patient summary"""
    summaries = _load_summaries()
    
    for i, summary in enumerate(summaries["summaries"]):
        if summary["id"] == summary_id:
            summaries["summaries"][i]["status"] = status
            _save_summaries(summaries)
            return True
    
    return False


def get_patient_summaries_by_patient(patient_id: str) -> List[Dict]:
    """Get all summaries for a specific patient"""
    summaries = _load_summaries()
    
    patient_summaries = [
        s for s in summaries["summaries"] 
        if s["patient_id"] == patient_id
    ]
    
    # Sort by created_at descending
    patient_summaries.sort(key=lambda x: x["created_at"], reverse=True)
    
    return patient_summaries
