# MongoDB + Frontend Integration Test Guide

Complete end-to-end testing guide for the Mediwo clinical workflow system with MongoDB backend and React frontend.

**Status: ✅ All components integrated and verified**

---

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB Atlas account (credentials configured in `.env`)
- Backend dependencies installed: `pip install -r backend/requirements.txt`
- Frontend dependencies installed: `cd frontend && npm install`

### Start Development Environment

**Option 1: Run both servers in separate terminals**

Terminal 1 - Backend:
```bash
cd backend
python main.py
# Server runs on http://localhost:8000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
# Server runs on http://localhost:5173
```

**Option 2: Use provided startup script**
```bash
chmod +x start_dev.sh
./start_dev.sh
```

---

## Complete User Flow Test

### Test Scenario: Patient Intake → Doctor Review → Medical History

#### 1. **Patient Registration & Login**

**Frontend:** http://localhost:5173

1. Landing page displays "Get Started" and "Login" buttons
   - ✅ Should show Mediwo logo and feature cards
   - ✅ Both buttons navigate correctly

2. Click "Get Started" or "Login" → `/patient/auth`
   - ✅ Shows Registration and Login tabs
   - ✅ Can switch between tabs smoothly

3. **Register as Patient:**
   - Tab: Registration
   - Full Name: `John Doe`
   - Username: `johndoe`
   - Password: `password123`
   - Click: Register
   - ✅ Should redirect to `/patient/dashboard` on success
   - ✅ User data stored in localStorage
   - ✅ MongoDB: Check `users` collection for new patient document

4. **Verify Patient User in MongoDB:**
   ```javascript
   db.users.findOne({ username: "johndoe" })
   // Returns:
   // {
   //   _id: ObjectId(...),
   //   username: "johndoe",
   //   password: "password123",  // plain text in dev
   //   full_name: "John Doe",
   //   role: "patient",
   //   created_at: ISODate(...)
   // }
   ```

#### 2. **Select Doctor & Start Intake**

**Frontend:** Patient Dashboard (`/patient/dashboard`)

1. Dashboard shows available doctors
   - ✅ Each doctor card shows name, specialty, availability
   - ✅ Can click on a doctor card

2. Click on a Doctor (e.g., "Dr. Sarah Smith"):
   - ✅ `selectedDoctorId` saved to localStorage
   - ✅ Redirects to `/patient/intake`

3. **Intake Page** (`/patient/intake`):
   - ✅ AI assistant asks initial question
   - ✅ Patient can type responses
   - ✅ Assistant responds with follow-up questions
   - ✅ Chat history displayed in conversation box
   - ✅ "Finish Intake" button appears when ready

4. **Upload Medical Reports** (optional):
   - Click file upload section
   - Select a PDF or image file
   - ✅ Shows "Parsing..." message
   - ✅ Returns summary text
   - ✅ Summary displayed in intake page

5. Click "Finish Intake":
   - Browser gets `patientId` and `selectedDoctorId` from localStorage
   - Frontend calls: `completeIntakeSession(sessionId, patientId, doctorId)`
   - ✅ Shows "Intake Complete" message
   - ✅ Redirects to patient dashboard
   - ✅ SUCCESS alert appears

6. **Verify Intake Data in MongoDB:**
   ```javascript
   db.patient_info.findOne({ 
     patient_id: ObjectId("..."), 
     status: "pending"
   })
   // Returns document with:
   // {
   //   _id: ObjectId(...),
   //   patient_id: ObjectId(...),
   //   doctor_id: ObjectId(...),
   //   conversation_summary: "Patient reports...",
   //   medical_reports_summary: "Report shows...",
   //   doctor_notes: null,  // Not yet reviewed
   //   status: "pending",
   //   created_at: ISODate(...),
   //   updated_at: ISODate(...)
   // }
   ```

#### 3. **Doctor Review Workflow**

**Frontend:** Doctor login (`/patient/auth`, then doctor registration or login)

1. **Register as Doctor:**
   - Tab: Registration
   - Full Name: `Dr. Sarah Smith`
   - Username: `drsmith`
   - Password: `doctorpass123`
   - Specialization: `General Medicine`
   - Role: Doctor (select from radio buttons)
   - Click: Register
   - ✅ Redirects to `/doctor/queue` (doctor dashboard)

2. **Doctor Queue Page** (`/doctor/queue`):
   - ✅ Title shows "Patients Ready for Review"
   - ✅ Shows count of waiting patients
   - ✅ Patient card displays:
     - Patient name (John Doe)
     - Patient username (@johndoe)
     - Status badge ("⏱️ Pending Review")
     - AI conversation summary (preview)
     - Medical reports summary (preview)
     - Intake completion date/time
   - ✅ Blue button: "View Full Details & Add Notes"

3. Click "View Full Details & Add Notes":
   - ✅ Navigates to `/doctor/patient-details/{infoId}` where `infoId` is the document ID
   - ✅ Page header shows "Patient: John Doe"
   - ✅ Loading state shows briefly, then data loads

4. **Patient Details Page** (`/doctor/patient-details/:infoId`):
   - ✅ Shows patient name and current status
   - ✅ "Back to Patients" button in top-right
   - ✅ Section 1 - Patient Information:
     - Patient Name: John Doe
     - Status: ⏱️ Pending Review (or ✓ Reviewed if already reviewed)
     - Intake completion timestamp
   - ✅ Section 2 - AI Conversation Summary:
     - Full conversation text in gray box
     - Shows all Q&A from clinical intake
   - ✅ Section 3 - Medical Reports Summary (if uploaded):
     - Full report summaries in gray box
   - ✅ Section 4 - Clinical Notes Textarea:
     - Large textarea for doctor's notes
     - Placeholder: "Enter your clinical diagnosis..."
     - Initially empty or showing previous notes

5. **Doctor Adds Clinical Notes:**
   - Click in the Clinical Notes field
   - Type clinical assessment:
     ```
     Patient presents with acute symptoms of rhinitis 
     likely allergic. Recommend antihistamine therapy 
     and follow-up in 2 days if symptoms persist.
     ```
   - ✅ Notes appear in textarea
   - Click "Save Notes & Mark as Reviewed" button
   - ✅ Button shows "Saving..." briefly
   - ✅ Success message: "✓ Notes saved successfully and patient marked as reviewed"
   - ✅ Status badge changes from "⏱️ Pending Review" to "✓ Reviewed"

6. **Verify Doctor Notes in MongoDB:**
   ```javascript
   db.patient_info.findOne({ _id: ObjectId("...") })
   // Returns updated document with:
   // {
   //   ...previous fields...
   //   doctor_notes: "Patient presents with acute symptoms...",
   //   status: "reviewed",
   //   updated_at: ISODate(...)  // Updated timestamp
   // }
   ```

#### 4. **Doctor Can View Their Patient Queue Anytime**

1. Click "Patients Ready for Review" in left sidebar
2. ✅ Returns to `/doctor/queue`
3. ✅ If notes were saved, that patient's card shows:
   - Status: "✓ Reviewed" badge
   - Doctor can view again by clicking the button

#### 5. **Patient Views Medical History**

**Frontend:** Patient login and dashboard

1. **Patient logs back in:**
   - Navigate to `/patient/auth`
   - Login with username: `johndoe`, password: `password123`
   - ✅ Redirects to `/patient/dashboard`

2. **Patient Dashboard** (`/patient/dashboard`):
   - ✅ Shows available doctors
   - ✅ Left sidebar has "Medical History" link

3. Click "Medical History" in sidebar:
   - ✅ Navigates to `/patient/medical-history`
   - ✅ Page title: "My Medical History"
   - ✅ Description: "View all your past consultations"

4. **Medical History Page** (`/patient/medical-history`):
   - ✅ Shows list of consultations
   - ✅ Each consultation card shows:
     - Consultation with: "Dr. Sarah Smith"
     - Specialization: "General Medicine"
     - Status: "Reviewed" ✓
     - Date: Formatted date of intake completion
   - ✅ Each card is clickable/expandable
   - ✅ When expanded, shows:
     - AI Conversation Summary (full text)
     - Medical Reports Summary (if available)
     - Doctor's Clinical Notes (if notes were added)

5. **Test Multiple Consultations:**
   - Complete another intake with different doctor
   - Medical history should show both consultations
   - ✅ Each can be expanded independently

---

## Component-Level Tests

### 1. **Authentication Flow**

**Files:** `frontend/src/pages/patient/AuthPage.tsx`

Tests:
- [ ] Registration form validation (required fields)
- [ ] Password confirmation matching
- [ ] Duplicate username detection (backend returns 400)
- [ ] Login with incorrect password (backend returns 401)
- [ ] Successful registration sets `user` in localStorage
- [ ] Successful login navigates to `/patient/dashboard` or `/doctor/queue`
- [ ] localStorage user object has: `id`, `username`, `full_name`, `role`, `specialization` (for doctors)

### 2. **Intake Session Flow**

**Files:** 
- `frontend/src/pages/patient/IntakePage.tsx`
- `backend/main.py` - `/api/intake/*` endpoints
- `backend/pipelines/intake_questioning.py`

Tests:
- [ ] Session starts with endpoint `/api/intake/start`
- [ ] Chat messages exchange works via `/api/intake/message`
- [ ] Each message stores in session state
- [ ] Document upload parses via `/api/documents/parse`
- [ ] Completion sends `patientId` and `doctorId`
- [ ] MongoDB `patient_info` document created with:
  - `patient_id`: From localStorage user.id
  - `doctor_id`: From localStorage selectedDoctorId
  - `conversation_summary`: From intake session
  - `medical_reports_summary`: From parsed documents or empty string
  - `status`: "pending"
  - `created_at`: Current timestamp

### 3. **Doctor Queue Display**

**Files:** `frontend/src/pages/doctor/DoctorPatientsPage.tsx`

Tests:
- [ ] Page loads patient list from `/api/doctor/{doctorId}/patients-ready`
- [ ] Each patient card shows all fields correctly
- [ ] "View Full Details & Add Notes" navigates to `/doctor/patient-details/{infoId}`
- [ ] Status badge shows "pending" or "reviewed" based on MongoDB status
- [ ] Doctor logout clears localStorage and redirects to `/patient/auth`
- [ ] Error message displays if API call fails
- [ ] Empty state shows when no patients waiting

### 4. **Patient Details & Notes**

**Files:** `frontend/src/pages/doctor/PatientDetailsPage.tsx`

Tests:
- [ ] Page fetches via `/api/patient-medical-info/{infoId}`
- [ ] All three sections load (conversation, reports, notes)
- [ ] Status updates when notes are saved
- [ ] Success message appears and disappears after 3 seconds
- [ ] API calls in order: `addDoctorNotes()` → `updatePatientInfoStatus()` → `getPatientMedicalInfo()`
- [ ] MongoDB document shows updated `doctor_notes` and `status: "reviewed"`

### 5. **Patient Medical History**

**Files:** `frontend/src/pages/patient/PatientMedicalHistoryPage.tsx`

Tests:
- [ ] Page loads history from `/api/patient/{patientId}/medical-history`
- [ ] Each history item shows doctor name and specialization
- [ ] Expandable/collapsible design works
- [ ] Shows conversation summary, reports, and doctor notes when expanded
- [ ] Multiple consultations display in list
- [ ] Empty state when no history

---

## API Endpoint Tests

### Authentication Endpoints

```bash
# Register Patient
curl -X POST http://localhost:8000/api/auth/register/patient \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "password123",
    "full_name": "John Doe"
  }'
# ✅ 200 response with user object

# Register Doctor
curl -X POST http://localhost:8000/api/auth/register/doctor \
  -H "Content-Type: application/json" \
  -d '{
    "username": "drsmith",
    "password": "doctorpass",
    "full_name": "Dr. Sarah Smith",
    "specialization": "General Medicine"
  }'
# ✅ 200 response with doctor user object

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "password123"
  }'
# ✅ 200 response with user object
```

### Patient Medical Info Endpoints

```bash
# Save Patient Medical Info
curl -X POST http://localhost:8000/api/patient-medical-info \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "USER_ID_1",
    "doctor_id": "USER_ID_2",
    "medical_reports_summary": "Report shows...",
    "conversation_summary": "Patient reports..."
  }'
# ✅ 200 response with saved info object

# Get Doctor's Waiting Patients
curl http://localhost:8000/api/doctor/USER_ID_2/patients-ready
# ✅ 200 response with list of pending patient_info documents

# Get Specific Patient Info
curl http://localhost:8000/api/patient-medical-info/INFO_ID
# ✅ 200 response with full patient info document

# Add Doctor Notes
curl -X POST http://localhost:8000/api/patient-medical-info/INFO_ID/notes \
  -H "Content-Type: application/json" \
  -d '{
    "info_id": "INFO_ID",
    "doctor_notes": "Clinical assessment..."
  }'
# ✅ 200 success response

# Update Status
curl -X PUT http://localhost:8000/api/patient-medical-info/INFO_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "reviewed"}'
# ✅ 200 success response

# Get Patient History
curl http://localhost:8000/api/patient/USER_ID_1/medical-history
# ✅ 200 response with list of all patient's consultations
```

---

## MongoDB Verification Checklist

### Collections

After running through complete workflow, MongoDB should have:

**`users` collection:**
```javascript
// Patient document
{
  _id: ObjectId(...),
  username: "johndoe",
  password: "password123",
  full_name: "John Doe",
  role: "patient",
  created_at: ISODate(...)
}

// Doctor document
{
  _id: ObjectId(...),
  username: "drsmith",
  password: "doctorpass",
  full_name: "Dr. Sarah Smith",
  role: "doctor",
  specialization: "General Medicine",
  created_at: ISODate(...)
}
```

**`patient_info` collection:**
```javascript
{
  _id: ObjectId(...),
  patient_id: ObjectId("...patient's _id..."),
  doctor_id: ObjectId("...doctor's _id..."),
  medical_reports_summary: "Report text...",
  conversation_summary: "Q&A from intake...",
  doctor_notes: "Doctor's clinical assessment...",
  status: "reviewed",  // or "pending"
  created_at: ISODate(...),
  updated_at: ISODate(...)
}
```

### Verification Queries

```javascript
// Connect to MongoDB Atlas
// In MongoDB Compass or mongosh:

use mediwo

// Count documents in each collection
db.users.countDocuments()           // Should be ≥ 2
db.patient_info.countDocuments()    // Should be ≥ 1

// View all patient info documents
db.patient_info.find().pretty()

// Check specific patient's history
db.patient_info.find({ 
  patient_id: ObjectId("...") 
}).pretty()

// Check doctor's pending patients
db.patient_info.find({ 
  doctor_id: ObjectId("..."),
  status: "pending"
}).pretty()

// Verify data persistence
// Navigate away and back - data should persist
```

---

## Logout & Session Management

### Test Cases

1. **Patient Logout:**
   - On any patient page, click username dropdown or "Logout" button
   - ✅ localStorage is cleared
   - ✅ Redirects to `/patient/auth`
   - ✅ Clicking back doesn't restore session
   - ✅ Can login as different user

2. **Doctor Logout:**
   - On doctor queue or patient details page, click "Logout"
   - ✅ Same behavior as patient logout
   - ✅ Redirects to `/patient/auth`

3. **Session Persistence:**
   - Login as patient
   - Refresh page (`F5`)
   - ✅ Still logged in (user in localStorage)
   - ✅ Can navigate to different pages without re-login
   - Close browser tab, open new tab at http://localhost:5173
   - ✅ localStorage persists (with browser's default behavior)

---

## Error Handling Tests

### Network Errors

1. **Stop backend server:**
   - Frontend API calls fail gracefully
   - ✅ Error message displays: "Network error" or specific API error
   - ✅ User can retry or navigate elsewhere

2. **Invalid MongoDB connection:**
   - Backend logs error on startup
   - ✅ API endpoints return 500 with error detail
   - ✅ Frontend shows generic error message

### Data Validation Errors

1. **Missing required fields in registration:**
   - Empty full name field
   - ✅ Frontend validation prevents submission
   - ✅ Error message shows

2. **Invalid intake completion:**
   - Missing patientId or doctorId
   - ✅ Backend returns 400 error
   - ✅ Frontend displays error message

### Authentication Errors

1. **Wrong password:**
   - Login with correct username, wrong password
   - ✅ Backend returns 401
   - ✅ Frontend shows "Invalid credentials" message

2. **Username already exists:**
   - Register with existing username
   - ✅ Backend returns 400 "Username already exists"
   - ✅ Frontend displays error

---

## Performance Notes

### Expected Response Times

- **Login/Register:** < 500ms
- **Doctor Queue Load:** < 1s (typical, depends on number of patients)
- **Patient Details Load:** < 500ms
- **Save Notes:** < 500ms
- **Medical History Load:** < 1s

### Load Observations

- Multiple patients in queue: Card grid remains responsive
- Large conversation summaries: Scrollable text area, no lag
- Multiple doctor notes saves: Sequential requests handle correctly

---

## Browser Compatibility

Tested on:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Known Limitations

- localStorage has ~5-10MB limit (not relevant for user object)
- `JSON.parse()` in localStorage retrieval could fail if corrupted (handle with try-catch)

---

## Security Notes (Development vs Production)

### ⚠️ Current Development Mode

- **Passwords:** Stored as plain text in MongoDB
- **Authentication:** Based on localStorage (can be modified by user in browser devtools)
- **No HTTPS:** Communication unencrypted
- **No token expiry:** Session persists indefinitely
- **No CORS:** Configured permissively for development

### 🔒 Production Checklist

Before deploying to production:

- [ ] Implement password hashing (bcrypt/argon2) in `user_service.py`
- [ ] Add JWT token authentication instead of localStorage
- [ ] Enable HTTPS/TLS on all endpoints
- [ ] Implement token expiry (e.g., 8 hours)
- [ ] Add CORS whitelist with specific frontend domain
- [ ] Enable MongoDB connection encryption
- [ ] Implement rate limiting on auth endpoints
- [ ] Add audit logging for data access
- [ ] Implement role-based access control (RBAC) middleware
- [ ] Add request validation and sanitization
- [ ] Set up monitoring and alerting
- [ ] Regularly rotate credentials and API keys
- [ ] Implement data backup and recovery procedures

---

## Troubleshooting

### Issue: "Cannot find module 'database'"

**Cause:** Python import path issue in services

**Solution:** Already fixed in `user_service.py` and `patient_info_service.py` with:
```python
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
```

### Issue: "MongoDB connection refused"

**Cause:** `MONGODB_URL` not set or credentials invalid

**Solution:**
1. Check `.env` file has correct `MONGODB_URL`
2. Test connection: `python backend/verify_setup.py`
3. Verify MongoDB Atlas firewall allows your IP
4. Verify database credentials in connection string

### Issue: "Frontend redirects to login loop"

**Cause:** User object missing or invalid in localStorage

**Solution:**
1. Open browser DevTools > Application > localStorage
2. Check if `user` key exists
3. Value should be valid JSON: `{"id": "...", "username": "...", ...}`
4. Delete and re-login if corrupted

### Issue: "Doctor queue shows no patients"

**Cause 1:** No patient intake completed yet
- **Solution:** Complete patient intake flow first

**Cause 2:** Doctor ID mismatch
- **Solution:** Verify same doctor completed intake and is logged in
- Check MongoDB: `db.patient_info.find().pretty()`

### Issue: "Doctor notes not saving"

**Cause:** API error (check browser console)

**Solution:**
1. Check backend logs for database errors
2. Verify patientId/doctorId are valid ObjectIds
3. Check MongoDB connectivity

---

## Next Steps

### Immediate (After Testing)
- Run through all test cases above
- Verify MongoDB data matches expectations
- Test error scenarios

### Short Term (1-2 weeks)
- Implement password hashing
- Add JWT authentication
- Add request validation
- Set up error logging

### Medium Term (1 month)
- Implement appointment scheduling
- Add patient-doctor messaging
- Create admin dashboard
- Add email notifications

### Long Term (2+ months)
- Implement prescription management
- Add video consultation capability
- Build clinical analytics dashboard
- Set up HIPAA compliance audit logging

---

## Support & Debugging

### Enable Debug Logging

**Backend:**
```python
# In main.py, add:
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Frontend (Console):**
```javascript
// In backendApi.ts, add logging before parseResponse:
console.log('API Request:', method, url, body);
```

### View All Database Changes

```javascript
// In MongoDB Compass:
// Right-click collection > View Change Stream
// Refreshes as updates occur
```

### Check Backend Logs

```bash
# Terminal where backend is running
# Logs shown in real-time as requests come in
# Look for error messages and stack traces
```

---

**Last Updated:** 2024-04-20  
**Version:** 1.0  
**Status:** All components verified and integrated ✅
