#!/bin/bash

# Mediwo MongoDB API Testing Script
# This script demonstrates how to test the new authentication and patient info system

BASE_URL="http://localhost:8000"

echo "========================================="
echo "Mediwo API Testing - MongoDB Integration"
echo "========================================="
echo ""

# ============ PATIENT REGISTRATION ============
echo "1. Registering a patient..."
PATIENT_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/register/patient" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "patient123",
    "full_name": "John Doe"
  }')
echo "Response: $PATIENT_RESPONSE"
PATIENT_ID=$(echo $PATIENT_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Patient ID: $PATIENT_ID"
echo ""

# ============ DOCTOR REGISTRATION ============
echo "2. Registering a doctor..."
DOCTOR_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/register/doctor" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "dr_smith",
    "password": "doctor123",
    "full_name": "Dr. David Smith",
    "specialization": "Cardiology"
  }')
echo "Response: $DOCTOR_RESPONSE"
DOCTOR_ID=$(echo $DOCTOR_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Doctor ID: $DOCTOR_ID"
echo ""

# ============ LOGIN TEST ============
echo "3. Testing patient login..."
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "patient123"
  }')
echo "Response: $LOGIN_RESPONSE"
echo ""

# ============ START INTAKE SESSION ============
echo "4. Starting clinical intake session..."
INTAKE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/intake/start")
echo "Response: $INTAKE_RESPONSE"
SESSION_ID=$(echo $INTAKE_RESPONSE | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)
echo "Session ID: $SESSION_ID"
echo ""

# ============ SEND INTAKE MESSAGES ============
echo "5. Sending patient message during intake..."
curl -s -X POST "${BASE_URL}/api/intake/message" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"message\": \"I have been experiencing chest pain for the past 2 weeks\"
  }" | jq . || echo "Message sent"
echo ""

echo "6. Sending another patient message..."
curl -s -X POST "${BASE_URL}/api/intake/message" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"message\": \"The pain is worse when I exercise and better when I rest\"
  }" | jq . || echo "Message sent"
echo ""

# ============ COMPLETE INTAKE ============
echo "7. Completing intake session and saving to MongoDB..."
COMPLETE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/intake/complete" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"patientId\": \"$PATIENT_ID\",
    \"doctorId\": \"$DOCTOR_ID\"
  }")
echo "Response: $COMPLETE_RESPONSE"
echo ""

# ============ SAVE ADDITIONAL MEDICAL INFO ============
echo "8. Saving medical reports summary..."
MEDICAL_INFO=$(curl -s -X POST "${BASE_URL}/api/patient-medical-info" \
  -H "Content-Type: application/json" \
  -d "{
    \"patient_id\": \"$PATIENT_ID\",
    \"doctor_id\": \"$DOCTOR_ID\",
    \"medical_reports_summary\": \"EKG shows normal sinus rhythm. Troponin levels normal. Chest X-ray clear.\",
    \"conversation_summary\": \"Patient reports 2 weeks of chest pain, worse with exercise, better with rest.\"
  }")
echo "Response: $MEDICAL_INFO"
INFO_ID=$(echo $MEDICAL_INFO | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Info ID: $INFO_ID"
echo ""

# ============ DOCTOR VIEWS READY PATIENTS ============
echo "9. Doctor viewing all patients ready for review..."
curl -s -X GET "${BASE_URL}/api/doctor/${DOCTOR_ID}/patients-ready" \
  -H "Content-Type: application/json" | jq .
echo ""

# ============ DOCTOR VIEWS SPECIFIC PATIENT ============
echo "10. Doctor viewing specific patient's information..."
curl -s -X GET "${BASE_URL}/api/patient-medical-info/${INFO_ID}" \
  -H "Content-Type: application/json" | jq .
echo ""

# ============ DOCTOR ADDS NOTES ============
echo "11. Doctor adding clinical notes..."
curl -s -X POST "${BASE_URL}/api/patient-medical-info/${INFO_ID}/notes" \
  -H "Content-Type: application/json" \
  -d "{
    \"info_id\": \"$INFO_ID\",
    \"doctor_notes\": \"Patient presents with stable angina. Recommend stress test and cardiology follow-up. Prescribed aspirin 100mg daily. Schedule follow-up in 2 weeks.\"
  }" | jq .
echo ""

# ============ UPDATE STATUS ============
echo "12. Updating patient info status to reviewed..."
curl -s -X PUT "${BASE_URL}/api/patient-medical-info/${INFO_ID}/status" \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"reviewed\"
  }" | jq .
echo ""

# ============ PATIENT VIEWS HISTORY ============
echo "13. Patient viewing their medical history..."
curl -s -X GET "${BASE_URL}/api/patient/${PATIENT_ID}/medical-history" \
  -H "Content-Type: application/json" | jq .
echo ""

echo "========================================="
echo "Testing complete!"
echo "========================================="
echo ""
echo "Summary of created resources:"
echo "- Patient ID: $PATIENT_ID"
echo "- Doctor ID: $DOCTOR_ID"
echo "- Session ID: $SESSION_ID"
echo "- Info ID: $INFO_ID"
echo ""
echo "You can now test individual endpoints by using the above IDs"
echo "Example: curl http://localhost:8000/api/patient/${PATIENT_ID}/medical-history"
