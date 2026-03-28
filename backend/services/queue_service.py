import json
import os
from typing import Dict, List, Optional
from uuid import uuid4
from datetime import datetime, timedelta

QUEUES_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "queues.json")


def _load_queues() -> Dict:
    """Load queues from JSON file"""
    try:
        with open(QUEUES_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"queues": {}}


def _save_queues(queues: Dict) -> None:
    """Save queues to JSON file"""
    os.makedirs(os.path.dirname(QUEUES_FILE), exist_ok=True)
    with open(QUEUES_FILE, 'w') as f:
        json.dump(queues, f, indent=2)


def join_queue(doctor_id: str, patient_id: str, patient_name: str) -> Dict:
    """Add a patient to a doctor's queue"""
    queues = _load_queues()
    
    # Initialize doctor queue if it doesn't exist
    if doctor_id not in queues["queues"]:
        queues["queues"][doctor_id] = []
    
    # Check if patient is already in any queue
    for doc_id, queue in queues["queues"].items():
        for patient in queue:
            if patient["patient_id"] == patient_id and patient["status"] != "completed":
                raise ValueError("Patient is already in a queue")
    
    # Add patient to the doctor's queue
    queue_entry = {
        "queue_id": uuid4().hex,
        "patient_id": patient_id,
        "patient_name": patient_name,
        "doctor_id": doctor_id,
        "joined_at": datetime.now().isoformat(),
        "status": "waiting",  # waiting, in_consultation, completed
        "estimated_wait_time": _calculate_wait_time(queues["queues"][doctor_id])
    }
    
    queues["queues"][doctor_id].append(queue_entry)
    
    # Update wait times for all patients in this queue
    _update_wait_times(queues["queues"][doctor_id])
    
    _save_queues(queues)
    
    return {
        "queue_id": queue_entry["queue_id"],
        "position": len(queues["queues"][doctor_id]),
        "estimated_wait_time": queue_entry["estimated_wait_time"],
        "doctor_id": doctor_id
    }


def get_doctor_queue(doctor_id: str) -> List[Dict]:
    """Get all patients in a doctor's queue"""
    queues = _load_queues()
    
    if doctor_id not in queues["queues"]:
        return []
    
    # Sort by joined_at and filter out completed patients
    queue = sorted(
        [p for p in queues["queues"][doctor_id] if p["status"] != "completed"],
        key=lambda x: x["joined_at"]
    )
    
    # Update positions and wait times
    for i, patient in enumerate(queue):
        patient["position"] = i + 1
        patient["estimated_wait_time"] = _calculate_wait_time(queue[:i])
    
    return queue


def get_patient_queue_status(patient_id: str) -> Optional[Dict]:
    """Get a patient's current queue status"""
    queues = _load_queues()
    
    for doctor_id, queue in queues["queues"].items():
        for patient in queue:
            if patient["patient_id"] == patient_id and patient["status"] in ["waiting", "in_consultation"]:
                # Calculate current position
                waiting_patients = [p for p in queue if p["status"] == "waiting"]
                position = next((i + 1 for i, p in enumerate(waiting_patients) if p["patient_id"] == patient_id), 0)
                
                return {
                    "queue_id": patient["queue_id"],
                    "doctor_id": doctor_id,
                    "position": position,
                    "estimated_wait_time": patient["estimated_wait_time"],
                    "joined_at": patient["joined_at"]
                }
    
    return None


def remove_from_queue(queue_id: str) -> bool:
    """Remove a patient from queue (when consultation starts or completes)"""
    queues = _load_queues()
    
    for doctor_id, queue in queues["queues"].items():
        for i, patient in enumerate(queue):
            if patient["queue_id"] == queue_id:
                # Update status instead of removing
                queues["queues"][doctor_id][i]["status"] = "completed"
                _save_queues(queues)
                return True
    
    return False


def update_queue_status(queue_id: str, status: str) -> bool:
    """Update patient status in queue"""
    queues = _load_queues()
    
    for doctor_id, queue in queues["queues"].items():
        for i, patient in enumerate(queue):
            if patient["queue_id"] == queue_id:
                queues["queues"][doctor_id][i]["status"] = status
                _save_queues(queues)
                return True
    
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


def _update_wait_times(queue: List[Dict]) -> None:
    """Update wait times for all patients in queue"""
    waiting_patients = [p for p in queue if p["status"] == "waiting"]
    waiting_patients.sort(key=lambda x: x["joined_at"])
    
    for i, patient in enumerate(waiting_patients):
        patient["estimated_wait_time"] = _calculate_wait_time(waiting_patients[:i])
