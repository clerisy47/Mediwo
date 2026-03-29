from typing import Dict, List, Optional
from uuid import uuid4
from datetime import datetime

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_database


def register_patient(username: str, password: str, full_name: str = None) -> Dict:
    """Register a new patient in MongoDB"""
    db = get_database()
    users_collection = db["users"]
    
    # Check if username already exists
    existing_user = users_collection.find_one({"username": username})
    if existing_user:
        raise ValueError("Username already exists")
    
    # Create new patient
    new_patient = {
        "id": uuid4().hex,
        "username": username,
        "password": password,  # In production, this should be hashed
        "full_name": full_name or username,
        "role": "patient",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = users_collection.insert_one(new_patient)
    
    return {
        "id": new_patient["id"],
        "username": new_patient["username"],
        "full_name": new_patient["full_name"],
        "role": new_patient["role"]
    }


def register_doctor(username: str, password: str, full_name: str = None, specialization: str = None) -> Dict:
    """Register a new doctor in MongoDB"""
    db = get_database()
    users_collection = db["users"]
    
    # Check if username already exists
    existing_user = users_collection.find_one({"username": username})
    if existing_user:
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
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = users_collection.insert_one(new_doctor)
    
    return {
        "id": new_doctor["id"],
        "username": new_doctor["username"],
        "full_name": new_doctor["full_name"],
        "specialization": new_doctor["specialization"],
        "role": new_doctor["role"]
    }


def authenticate_user(username: str, password: str) -> Optional[Dict]:
    """Authenticate user by username and password from MongoDB"""
    db = get_database()
    users_collection = db["users"]
    
    user = users_collection.find_one({
        "username": username,
        "password": password
    })
    
    if user:
        return {
            "id": user["id"],
            "username": user["username"],
            "full_name": user["full_name"],
            "role": user["role"],
            "specialization": user.get("specialization")  # Only for doctors
        }
    
    return None


def get_user_by_id(user_id: str) -> Optional[Dict]:
    """Get user by ID from MongoDB"""
    db = get_database()
    users_collection = db["users"]
    
    user = users_collection.find_one({"id": user_id})
    
    if user:
        return {
            "id": user["id"],
            "username": user["username"],
            "full_name": user["full_name"],
            "role": user["role"],
            "specialization": user.get("specialization")
        }
    
    return None


def get_available_doctors() -> List[Dict]:
    """Get list of available doctors from MongoDB"""
    db = get_database()
    users_collection = db["users"]
    
    available_doctors = list(users_collection.find({
        "role": "doctor",
        "available": True
    }))
    
    return [
        {
            "id": doctor["id"],
            "username": doctor["username"],
            "full_name": doctor["full_name"],
            "specialization": doctor.get("specialization", "General Practitioner")
        }
        for doctor in available_doctors
    ]


def get_all_doctors() -> List[Dict]:
    """Get all doctors from MongoDB"""
    db = get_database()
    users_collection = db["users"]
    
    all_doctors = list(users_collection.find({"role": "doctor"}))
    
    return [
        {
            "id": doctor["id"],
            "username": doctor["username"],
            "full_name": doctor["full_name"],
            "specialization": doctor.get("specialization", "General Practitioner"),
            "available": doctor.get("available", True)
        }
        for doctor in all_doctors
    ]


def get_patient_by_id(patient_id: str) -> Optional[Dict]:
    """Get patient by ID from MongoDB"""
    db = get_database()
    users_collection = db["users"]
    
    patient = users_collection.find_one({
        "id": patient_id,
        "role": "patient"
    })
    
    if patient:
        return {
            "id": patient["id"],
            "username": patient["username"],
            "full_name": patient["full_name"],
            "role": patient["role"]
        }
    
    return None

