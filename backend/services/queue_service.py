import json
import os
from typing import Dict, List, Optional
from uuid import uuid4
from datetime import datetime, timedelta

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_database

QUEUES_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "queues.json")


def _load_queues() -> Dict:
    """Load queues from JSON file (fallback)"""
    try:
        with open(QUEUES_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"queues": {}}


def _save_queues(queues: Dict) -> None:
    """Save queues to JSON file (fallback)"""
    os.makedirs(os.path.dirname(QUEUES_FILE), exist_ok=True)
    with open(QUEUES_FILE, 'w') as f:
        json.dump(queues, f, indent=2)


def _get_patient_medical_info(patient_id: str) -> Dict:
    """Fetch patient's medical information from database"""
    try:
        db = get_database()
        # Try to get medical reports summaries
        summaries_collection = db["medical_reports_summaries"]
        medical_reports = list(summaries_collection.find(
            {"patient_id": patient_id}
        ).sort("created_at", -1).limit(1))
        
        # Try to get patient info (intake summary)
        patient_info_collection = db["patient_info"]
        patient_info = list(patient_info_collection.find(
            {"patient_id": patient_id}
        ).sort("created_at", -1).limit(1))
        
        return {
            "medical_reports_summary": medical_reports[0]["summary"] if medical_reports else None,
            "intake_summary": patient_info[0]["conversation_summary"] if patient_info else None,
            "patient_info_id": str(patient_info[0]["_id"]) if patient_info else None
        }
    except Exception as e:
        print(f"Error fetching patient medical info: {str(e)}")
        return {
            "medical_reports_summary": None,
            "intake_summary": None,
            "patient_info_id": None
        }


def join_queue(doctor_id: str, patient_id: str, patient_name: str) -> Dict:
    """Add a patient to a doctor's queue and store in MongoDB"""
    try:
        db = get_database()
        queues_collection = db["queues"]
        
        # Check if patient is already in a queue for this doctor
        existing = queues_collection.find_one({
            "patient_id": patient_id,
            "doctor_id": doctor_id,
            "status": {"$in": ["waiting", "in_consultation"]}
        })
        
        if existing:
            raise ValueError("Patient is already in this doctor's queue")
        
        # Check if patient is in any other doctor's active queue
        other_queue = queues_collection.find_one({
            "patient_id": patient_id,
            "status": {"$in": ["waiting", "in_consultation"]}
        })
        
        if other_queue:
            raise ValueError("Patient is already in another queue")
        
        # Fetch patient's medical information
        patient_medical_info = _get_patient_medical_info(patient_id)
        
        # Create queue entry
        queue_entry = {
            "queue_id": uuid4().hex,
            "patient_id": patient_id,
            "patient_name": patient_name,
            "doctor_id": doctor_id,
            "joined_at": datetime.utcnow(),
            "status": "waiting",  # waiting, in_consultation, completed
            "medical_reports_summary": patient_medical_info["medical_reports_summary"],
            "intake_summary": patient_medical_info["intake_summary"],
            "patient_info_id": patient_medical_info["patient_info_id"],
            "estimated_wait_time": _calculate_wait_time_for_doctor(doctor_id, queues_collection),
            "position": _calculate_queue_position(doctor_id, queues_collection)
        }
        
        result = queues_collection.insert_one(queue_entry)
        
        return {
            "queue_id": queue_entry["queue_id"],
            "position": queue_entry["position"],
            "estimated_wait_time": queue_entry["estimated_wait_time"],
            "doctor_id": doctor_id
        }
    except ValueError as e:
        raise e
    except Exception as e:
        raise Exception(f"Error joining queue: {str(e)}")


def get_doctor_queue(doctor_id: str) -> List[Dict]:
    """Get all patients in a doctor's queue with their medical information"""
    try:
        db = get_database()
        queues_collection = db["queues"]
        
        # Fetch all active queue entries for this doctor
        queue_entries = list(queues_collection.find({
            "doctor_id": doctor_id,
            "status": {"$in": ["waiting", "in_consultation"]}
        }).sort("joined_at", 1))
        
        # Recalculate positions and wait times
        for i, entry in enumerate(queue_entries):
            entry["position"] = i + 1
            entry["estimated_wait_time"] = _calculate_wait_time_for_doctor(doctor_id, queues_collection)
            entry["_id"] = str(entry["_id"])  # Convert ObjectId to string
        
        return queue_entries
    except Exception as e:
        print(f"Error getting doctor queue: {str(e)}")
        return []


def get_patient_queue_status(patient_id: str) -> Optional[Dict]:
    """Get a patient's current queue status"""
    try:
        db = get_database()
        queues_collection = db["queues"]
        
        # Find patient's active queue entry
        queue_entry = queues_collection.find_one({
            "patient_id": patient_id,
            "status": {"$in": ["waiting", "in_consultation"]}
        })
        
        if not queue_entry:
            return None
        
        # Calculate current position
        doctor_id = queue_entry["doctor_id"]
        waiting_entries = list(queues_collection.find({
            "doctor_id": doctor_id,
            "status": "waiting",
            "joined_at": {"$lte": queue_entry["joined_at"]}
        }).sort("joined_at", 1))
        
        position = len(waiting_entries)
        
        return {
            "queue_id": queue_entry["queue_id"],
            "doctor_id": doctor_id,
            "position": position,
            "estimated_wait_time": queue_entry["estimated_wait_time"],
            "joined_at": queue_entry["joined_at"].isoformat() if hasattr(queue_entry["joined_at"], 'isoformat') else str(queue_entry["joined_at"])
        }
    except Exception as e:
        print(f"Error getting patient queue status: {str(e)}")
        return None


def remove_from_queue(queue_id: str) -> bool:
    """Remove a patient from queue (when consultation starts or completes)"""
    try:
        db = get_database()
        queues_collection = db["queues"]
        
        result = queues_collection.update_one(
            {"queue_id": queue_id},
            {"$set": {"status": "completed"}}
        )
        
        return result.modified_count > 0
    except Exception as e:
        print(f"Error removing from queue: {str(e)}")
        return False


def update_queue_entry_intake_summary(patient_id: str, doctor_id: str, intake_summary: str) -> bool:
    """Update a patient's queue entry with their intake summary after completion"""
    try:
        db = get_database()
        queues_collection = db["queues"]
        
        result = queues_collection.update_one(
            {
                "patient_id": patient_id,
                "doctor_id": doctor_id,
                "status": {"$in": ["waiting", "in_consultation"]}
            },
            {"$set": {"intake_summary": intake_summary, "updated_at": datetime.utcnow()}}
        )
        
        return result.modified_count > 0
    except Exception as e:
        print(f"Error updating queue entry intake summary: {str(e)}")
        return False


def _calculate_wait_time(patients_ahead: List[Dict]) -> str:
    """Calculate estimated wait time based on patients ahead"""
    # Assume 15 minutes per patient (simplified)
    minutes_per_patient = 15
    total_minutes = len(patients_ahead) * minutes_per_patient
    
    if total_minutes == 0:
        return "0 min"
    elif total_minutes < 60:
        return f"{total_minutes} min"
    else:
        hours = total_minutes // 60
        minutes = total_minutes % 60
        return f"{hours}h {minutes}min"


def _calculate_wait_time_for_doctor(doctor_id: str, queues_collection) -> str:
    """Calculate estimated wait time for a doctor's queue"""
    try:
        waiting_count = queues_collection.count_documents({
            "doctor_id": doctor_id,
            "status": "waiting"
        })
        
        minutes_per_patient = 15
        total_minutes = waiting_count * minutes_per_patient
        
        if total_minutes == 0:
            return "0 min"
        elif total_minutes < 60:
            return f"{total_minutes} min"
        else:
            hours = total_minutes // 60
            minutes = total_minutes % 60
            return f"{hours}h {minutes}min"
    except Exception:
        return "0 min"


def _calculate_queue_position(doctor_id: str, queues_collection) -> int:
    """Calculate the position of the next patient in queue"""
    try:
        position = queues_collection.count_documents({
            "doctor_id": doctor_id,
            "status": {"$in": ["waiting", "in_consultation"]}
        }) + 1
        return position
    except Exception:
        return 1


def update_queue_status(queue_id: str, status: str) -> bool:
    """Update patient status in queue"""
    try:
        db = get_database()
        queues_collection = db["queues"]
        
        result = queues_collection.update_one(
            {"queue_id": queue_id},
            {"$set": {"status": status, "updated_at": datetime.utcnow()}}
        )
        
        return result.modified_count > 0
    except Exception as e:
        print(f"Error updating queue status: {str(e)}")
        return False


def get_queue_entry_by_id(queue_id: str) -> Optional[Dict]:
    """Fetch queue entry by queue_id."""
    try:
        db = get_database()
        queues_collection = db["queues"]
        queue_entry = queues_collection.find_one({"queue_id": queue_id})
        if not queue_entry:
            return None

        queue_entry["_id"] = str(queue_entry["_id"])
        return queue_entry
    except Exception as e:
        print(f"Error fetching queue entry: {str(e)}")
        return None


def attach_patient_info_to_queue(queue_id: str, patient_info_id: Optional[str], intake_summary: Optional[str]) -> bool:
    """Attach patient_info linkage and latest intake summary to a queue entry."""
    try:
        db = get_database()
        queues_collection = db["queues"]

        result = queues_collection.update_one(
            {"queue_id": queue_id},
            {
                "$set": {
                    "patient_info_id": patient_info_id,
                    "intake_summary": intake_summary,
                    "updated_at": datetime.utcnow(),
                }
            },
        )

        return result.modified_count > 0
    except Exception as e:
        print(f"Error attaching patient info to queue: {str(e)}")
        return False
