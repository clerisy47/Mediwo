import json
import os
from typing import Dict, List, Optional
from uuid import uuid4

USERS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "users.json")


def _load_users() -> Dict:
    """Load users from JSON file"""
    try:
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"patients": [], "doctors": []}


def _save_users(users: Dict) -> None:
    """Save users to JSON file"""
    os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)


def register_patient(username: str, password: str, full_name: str = None) -> Dict:
    """Register a new patient"""
    users = _load_users()
    
    # Check if username already exists
    for patient in users["patients"]:
        if patient["username"] == username:
            raise ValueError("Username already exists")
    
    # Create new patient
    new_patient = {
        "id": uuid4().hex,
        "username": username,
        "password": password,  # In production, this should be hashed
        "full_name": full_name or username,
        "role": "patient",
        "created_at": "2025-01-01T00:00:00Z"  # Simplified timestamp
    }
    
    users["patients"].append(new_patient)
    _save_users(users)
    
    return {
        "id": new_patient["id"],
        "username": new_patient["username"],
        "full_name": new_patient["full_name"],
        "role": new_patient["role"]
    }


def register_doctor(username: str, password: str, full_name: str = None, specialization: str = None) -> Dict:
    """Register a new doctor"""
    users = _load_users()
    
    # Check if username already exists
    for doctor in users["doctors"]:
        if doctor["username"] == username:
            raise ValueError("Username already exists")
    
    # Create new doctor
    new_doctor = {
        "id": uuid4().hex,
        "username": username,
        "password": password,  # In production, this should be hashed
        "full_name": full_name or username,
        "specialization": specialization or "General Practitioner",
        "role": "doctor",
        "available": True,
        "created_at": "2025-01-01T00:00:00Z"  # Simplified timestamp
    }
    
    users["doctors"].append(new_doctor)
    _save_users(users)
    
    return {
        "id": new_doctor["id"],
        "username": new_doctor["username"],
        "full_name": new_doctor["full_name"],
        "specialization": new_doctor["specialization"],
        "role": new_doctor["role"]
    }


def authenticate_user(username: str, password: str) -> Optional[Dict]:
    """Authenticate user by username and password"""
    users = _load_users()
    
    # Check patients
    for patient in users["patients"]:
        if patient["username"] == username and patient["password"] == password:
            return {
                "id": patient["id"],
                "username": patient["username"],
                "full_name": patient["full_name"],
                "role": patient["role"]
            }
    
    # Check doctors
    for doctor in users["doctors"]:
        if doctor["username"] == username and doctor["password"] == password:
            return {
                "id": doctor["id"],
                "username": doctor["username"],
                "full_name": doctor["full_name"],
                "specialization": doctor["specialization"],
                "role": doctor["role"]
            }
    
    return None


def get_available_doctors() -> List[Dict]:
    """Get list of available doctors"""
    users = _load_users()
    
    available_doctors = []
    for doctor in users["doctors"]:
        if doctor.get("available", True):
            available_doctors.append({
                "id": doctor["id"],
                "username": doctor["username"],
                "full_name": doctor["full_name"],
                "specialization": doctor.get("specialization", "General Practitioner")
            })
    
    return available_doctors
