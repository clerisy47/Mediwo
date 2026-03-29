from typing import Dict, List, Optional
from uuid import uuid4
from datetime import datetime
from bson import ObjectId

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_database


def _find_patient_info_record(patient_info_collection, info_id: str):
    """Find patient info by app id first, then by Mongo ObjectId for backward compatibility."""
    info = patient_info_collection.find_one({"id": info_id})
    if info:
        return info

    if ObjectId.is_valid(info_id):
        info = patient_info_collection.find_one({"_id": ObjectId(info_id)})
        if info:
            return info

    return None


def save_patient_medical_info(
    patient_id: str,
    doctor_id: str,
    medical_reports_summary: str,
    conversation_summary: Optional[str],
    status: str = "pending"
) -> Dict:
    """
    Save patient's medical information including reports summary and conversation summary.
    This is called after the patient completes clinical intake.
    
    Args:
        patient_id: The patient's user ID
        doctor_id: The doctor who will review this information
        medical_reports_summary: Summary of medical reports/documents
        conversation_summary: Summary of conversation with AI assistant
        status: Initial status (pending, reviewed, etc.)
    
    Returns:
        Dictionary with saved info details
    """
    db = get_database()
    patient_info_collection = db["patient_info"]
    
    patient_info = {
        "id": uuid4().hex,
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "medical_reports_summary": medical_reports_summary,
        "conversation_summary": conversation_summary,
        "status": status,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_ready_for_doctor": True  # Flag that doctor can now see this info
    }
    
    result = patient_info_collection.insert_one(patient_info)
    
    return {
        "id": patient_info["id"],
        "patient_id": patient_info["patient_id"],
        "doctor_id": patient_info["doctor_id"],
        "medical_reports_summary": patient_info["medical_reports_summary"],
        "conversation_summary": patient_info["conversation_summary"],
        "status": patient_info["status"],
        "created_at": patient_info["created_at"]
    }


def get_or_create_patient_info_for_queue_accept(
    patient_id: str,
    doctor_id: str,
    queue_id: str,
    medical_reports_summary: Optional[str],
    conversation_summary: Optional[str],
) -> Dict:
    """Return existing patient_info for this queue accept flow or create one."""
    db = get_database()
    patient_info_collection = db["patient_info"]

    existing = patient_info_collection.find_one({"source_queue_id": queue_id})
    if existing:
        return {
            "id": existing["id"],
            "patient_id": existing["patient_id"],
            "doctor_id": existing["doctor_id"],
            "medical_reports_summary": existing.get("medical_reports_summary"),
            "conversation_summary": existing.get("conversation_summary"),
            "status": existing.get("status", "pending"),
            "created_at": existing.get("created_at"),
        }

    # If there is already a pending record for this patient+doctor, reuse it.
    pending = patient_info_collection.find_one(
        {
            "patient_id": patient_id,
            "doctor_id": doctor_id,
            "status": {"$in": ["pending", "in_consultation"]},
        },
        sort=[("created_at", -1)],
    )
    if pending:
        patient_info_collection.update_one(
            {"id": pending["id"]},
            {
                "$set": {
                    "source_queue_id": queue_id,
                    "medical_reports_summary": medical_reports_summary,
                    "conversation_summary": conversation_summary,
                    "updated_at": datetime.utcnow(),
                    "is_ready_for_doctor": True,
                }
            },
        )
        pending["source_queue_id"] = queue_id
        pending["medical_reports_summary"] = medical_reports_summary
        pending["conversation_summary"] = conversation_summary
        return {
            "id": pending["id"],
            "patient_id": pending["patient_id"],
            "doctor_id": pending["doctor_id"],
            "medical_reports_summary": pending.get("medical_reports_summary"),
            "conversation_summary": pending.get("conversation_summary"),
            "status": pending.get("status", "pending"),
            "created_at": pending.get("created_at"),
        }

    patient_info = {
        "id": uuid4().hex,
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "medical_reports_summary": medical_reports_summary,
        "conversation_summary": conversation_summary,
        "status": "pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_ready_for_doctor": True,
        "source_queue_id": queue_id,
    }
    patient_info_collection.insert_one(patient_info)

    return {
        "id": patient_info["id"],
        "patient_id": patient_info["patient_id"],
        "doctor_id": patient_info["doctor_id"],
        "medical_reports_summary": patient_info.get("medical_reports_summary"),
        "conversation_summary": patient_info.get("conversation_summary"),
        "status": patient_info.get("status", "pending"),
        "created_at": patient_info.get("created_at"),
    }


def get_patient_info_for_doctor(doctor_id: str) -> List[Dict]:
    """
    Get all patient information that's ready for a specific doctor.
    This includes completed clinical intakes with summaries.
    
    Args:
        doctor_id: The doctor's user ID
        
    Returns:
        List of patient information records
    """
    db = get_database()
    patient_info_collection = db["patient_info"]
    
    # Get all patient info for this doctor
    patient_infos = list(patient_info_collection.find({
        "doctor_id": doctor_id,
        "is_ready_for_doctor": True
    }).sort("created_at", -1))
    
    # Fetch patient details for each record
    users_collection = db["users"]
    
    result = []
    for info in patient_infos:
        patient = users_collection.find_one({"id": info["patient_id"]})
        if patient:
            result.append({
                "id": info["id"],
                "patient_id": info["patient_id"],
                "patient_name": patient.get("full_name", "Unknown"),
                "patient_username": patient.get("username", "Unknown"),
                "doctor_id": info["doctor_id"],
                "medical_reports_summary": info["medical_reports_summary"],
                "conversation_summary": info["conversation_summary"],
                "status": info["status"],
                "created_at": info["created_at"],
                "updated_at": info.get("updated_at")
            })
    
    return result


def get_patient_info_by_id(info_id: str) -> Optional[Dict]:
    """
    Get specific patient information record by ID.
    
    Args:
        info_id: The patient info record ID
        
    Returns:
        Patient information details or None
    """
    db = get_database()
    patient_info_collection = db["patient_info"]
    users_collection = db["users"]
    
    info = _find_patient_info_record(patient_info_collection, info_id)
    
    if info:
        patient = users_collection.find_one({"id": info["patient_id"]})
        return {
            "id": info["id"],
            "patient_id": info["patient_id"],
            "patient_name": patient.get("full_name", "Unknown") if patient else "Unknown",
            "patient_username": patient.get("username", "Unknown") if patient else "Unknown",
            "doctor_id": info["doctor_id"],
            "medical_reports_summary": info["medical_reports_summary"],
            "conversation_summary": info["conversation_summary"],
            "status": info["status"],
            "created_at": info["created_at"],
            "updated_at": info.get("updated_at")
        }
    
    return None


def update_patient_info_status(info_id: str, status: str) -> bool:
    """
    Update the status of a patient information record.
    
    Args:
        info_id: The patient info record ID
        status: New status (reviewed, completed, etc.)
        
    Returns:
        True if updated, False otherwise
    """
    db = get_database()
    patient_info_collection = db["patient_info"]
    
    info = _find_patient_info_record(patient_info_collection, info_id)
    if not info:
        return False

    result = patient_info_collection.update_one(
        {"_id": info["_id"]},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    
    return result.modified_count > 0


def get_patient_info_history(patient_id: str) -> List[Dict]:
    """
    Get all information history for a specific patient.
    Useful for patient to see their medical history.
    
    Args:
        patient_id: The patient's user ID
        
    Returns:
        List of patient information records
    """
    db = get_database()
    patient_info_collection = db["patient_info"]
    users_collection = db["users"]
    summaries_collection = db["medical_reports_summaries"]
    
    patient_infos = list(patient_info_collection.find({
        "patient_id": patient_id
    }).sort("created_at", -1))
    
    result = []
    for info in patient_infos:
        doctor = users_collection.find_one({"id": info["doctor_id"]})
        result.append({
            "id": info["id"],
            "doctor_name": doctor.get("full_name", "Unknown") if doctor else "Unknown",
            "doctor_specialization": doctor.get("specialization", "General Practitioner") if doctor else "Unknown",
            "medical_reports_summary": info["medical_reports_summary"],
            "conversation_summary": info["conversation_summary"],
            "doctor_notes": info.get("doctor_notes", ""),
            "status": info["status"],
            "created_at": info["created_at"]
        })

    # Also include standalone uploaded medical report summaries so history tab is never empty.
    uploaded_summaries = list(
        summaries_collection.find({"patient_id": patient_id}).sort("created_at", -1)
    )
    for summary in uploaded_summaries:
        result.append({
            "id": str(summary.get("_id")),
            "doctor_name": "Not reviewed yet",
            "doctor_specialization": "Uploaded Medical Record",
            "medical_reports_summary": summary.get("summary"),
            "conversation_summary": None,
            "doctor_notes": "",
            "status": "uploaded",
            "created_at": summary.get("created_at", datetime.utcnow()),
        })

    result.sort(key=lambda x: x.get("created_at", datetime.utcnow()), reverse=True)
    
    return result


def add_doctor_notes(info_id: str, doctor_notes: str) -> bool:
    """
    Add doctor's notes/review to a patient information record.
    
    Args:
        info_id: The patient info record ID
        doctor_notes: The doctor's notes
        
    Returns:
        True if updated, False otherwise
    """
    db = get_database()
    patient_info_collection = db["patient_info"]
    
    info = _find_patient_info_record(patient_info_collection, info_id)
    if not info:
        return False

    result = patient_info_collection.update_one(
        {"_id": info["_id"]},
        {"$set": {
            "doctor_notes": doctor_notes,
            "status": "reviewed",
            "updated_at": datetime.utcnow()
        }}
    )
    
    return result.modified_count > 0


def get_patient_info_with_notes(info_id: str) -> Optional[Dict]:
    """
    Get patient information including doctor notes.
    
    Args:
        info_id: The patient info record ID
        
    Returns:
        Complete patient information with notes or None
    """
    db = get_database()
    patient_info_collection = db["patient_info"]
    users_collection = db["users"]
    
    info = _find_patient_info_record(patient_info_collection, info_id)
    
    if info:
        patient = users_collection.find_one({"id": info["patient_id"]})
        doctor = users_collection.find_one({"id": info["doctor_id"]})
        return {
            "id": info["id"],
            "patient_id": info["patient_id"],
            "patient_name": patient.get("full_name", "Unknown") if patient else "Unknown",
            "doctor_name": doctor.get("full_name", "Unknown") if doctor else "Unknown",
            "doctor_specialization": doctor.get("specialization", "General Practitioner") if doctor else "Unknown",
            "medical_reports_summary": info["medical_reports_summary"],
            "conversation_summary": info["conversation_summary"],
            "doctor_notes": info.get("doctor_notes", ""),
            "status": info["status"],
            "created_at": info["created_at"],
            "updated_at": info.get("updated_at")
        }
    
    return None
