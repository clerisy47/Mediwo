#!/usr/bin/env python
"""Setup verification script"""
import sys
import os

print('========== SETUP VERIFICATION ==========')
print()

# Test imports
print('1. Testing imports...')
try:
    from database import get_database
    print('   ✓ database.py')
    db = get_database()
    print('   ✓ MongoDB connection working')
except Exception as e:
    print(f'   ✗ Error: {e}')
    sys.exit(1)

try:
    from services.user_service import register_patient, register_doctor, authenticate_user, get_user_by_id
    print('   ✓ user_service.py')
except Exception as e:
    print(f'   ✗ Error: {e}')
    sys.exit(1)

try:
    from services.patient_info_service import save_patient_medical_info, get_patient_info_for_doctor
    print('   ✓ patient_info_service.py')
except Exception as e:
    print(f'   ✗ Error: {e}')
    sys.exit(1)

print()
print('2. Checking MongoDB collections...')
collections = db.list_collection_names()
print(f'   Collections in mediwo DB: {collections if collections else "None (will be created on first use)"}')

print()
print('3. Verifying key files...')
files_to_check = [
    'database.py',
    'services/user_service.py',
    'services/patient_info_service.py',
    'main.py',
    '.env',
    'requirements.txt',
    '../MONGODB_INTEGRATION.md',
    '../IMPLEMENTATION_SUMMARY.md',
    '../test_api.sh'
]

all_exist = True
for file in files_to_check:
    if os.path.exists(file):
        print(f'   ✓ {file}')
    else:
        print(f'   ✗ {file} - MISSING')
        all_exist = False

print()
if all_exist:
    print('========== SETUP VERIFIED ✓ ==========')
    print()
    print('Ready to start the backend:')
    print('  python main.py')
else:
    print('========== SETUP INCOMPLETE ==========')
    sys.exit(1)
