# Frontend-MongoDB Integration Guide

## Overview
The frontend has been fully integrated with the MongoDB backend. Here's what's new and how it all works together.

## New Pages & Components

### For Patients

#### 1. **Authentication Page** (`/patient/auth`)
- Register as a patient or doctor
- Login with username and password
- Redirects to appropriate dashboard based on role

**Features:**
- Patient signup with full name
- Doctor signup with full name and specialization
- Login for both roles
- Error handling and validation

#### 2. **Patient Intake Page** (`/patient/intake`)
- Conduct AI-assisted clinical intake
- Ask/answer adaptive questions
- Get conversation summary
- **NEW**: Automatically saves to MongoDB when completed

**Flow:**
1. Patient goes to intake page
2. AI asks initial question
3. Patient responds with messages
4. When patient clicks "Finish":
   - Conversation summary is generated
   - Data is saved to MongoDB with `status: "pending"`
   - Doctor can now see this patient

#### 3. **Patient Medical History Page** (`/patient/medical-history`) ⭐ NEW
- View all past consultations
- Expandable consultation details
- See doctor information and specialty
- View AI conversation summaries
- View medical reports if available

**Access:** Navigation menu → Medical History

#### 4. **Patient Dashboard** (`/patient/dashboard`)
- Patient greeting and welcome
- Quick action buttons
- Queue status if joined
- Link to medical history

### For Doctors

#### 1. **Doctor Queue Page - Now "Patients Ready"** (`/doctor/queue`) ⭐ UPDATED
- Lists all patients whose intakes are complete
- Shows patient name and intake date
- Displays conversation summary preview
- Shows medical reports summary if available
- Status indicator (Pending/Reviewed)

**Key Features:**
- Grid layout showing patient cards
- Each card shows:
  - Patient name
  - Patient username
  - Conversation summary (truncated)
  - Medical reports summary (if available)
  - Status badge
  - "View Full Details & Add Notes" button

#### 2. **Patient Details Page** (`/doctor/patient-details/:infoId`) ⭐ NEW
- Full view of patient's medical information
- AI conversation summary
- Medical reports summary
- Text area for doctor to add clinical notes
- Automatic status update when notes are saved

**Workflow:**
1. Doctor clicks "View Full Details & Add Notes" from queue
2. Doctor sees complete patient information
3. Doctor types their clinical assessment, diagnosis, and recommendations
4. Doctor clicks "Save Notes & Mark as Reviewed"
5. Patient status changes from "Pending" to "Reviewed"
6. Patient info is saved to MongoDB

---

## Complete User Flows

### Patient Flow

```
1. Patient visits app
   ↓
2. Goes to /patient/auth
   ↓
3. Signs up or logs in
   ↓
4. Redirected to /patient/dashboard
   ↓
5. Clicks "Intake" → goes to /patient/intake
   ↓
6. AI asks adaptive questions
   ↓
7. Patient responds (multiple messages)
   ↓
8. Patient clicks "Finish"
   ↓
9. Conversation saved to MongoDB
   ↓
10. Patient sees summary
   ↓
11. Patient can view /patient/medical-history anytime
    to see past consultations with doctors' notes
```

### Doctor Flow

```
1. Doctor visits app
   ↓
2. Goes to /patient/auth
   ↓
3. Signs up as doctor or logs in
   ↓
4. Redirected to /doctor/queue
   ↓
5. Sees all patients ready for review (from MongoDB)
   ↓
6. Clicks "View Full Details & Add Notes"
   ↓
7. Goes to /doctor/patient-details/:infoId
   ↓
8. Sees full conversation summary and medical reports
   ↓
9. Types clinical notes in text area
   ↓
10. Clicks "Save Notes & Mark as Reviewed"
    ↓
11. Notes saved to MongoDB
    Patient status: "pending" → "reviewed"
    ↓
12. Doctor redirected back to queue (/doctor/queue)
```

---

## Data Flow Diagram

```
PATIENT SIDE                        MONGODB                         DOCTOR SIDE
═════════════════════════════════════════════════════════════════════════════════

Patient registers         ──────→   users collection              Doctor registers
    ↓                               (stores credentials)               ↓
Patient logs in           ──────→   localStorage: user object      Doctor logs in
    ↓
Patient starts intake
    ↓
AI conversation           ──────→   (in memory during session)
    ↓
Patient completes intake            
    ↓
    └─ Saves to MongoDB ─────→   patient_info collection      ──→ Doctor sees 
       (conversation_summary)      (status: "pending")              patients in queue
       (medical_reports)
                                                                Doctor views details
                                ←─ Fetches from MongoDB ─────────  ↓
                                   getPatientMedicalInfo()     Doctor adds notes
                                   
                                   ↓
                              Updates patient_info
                           (doctor_notes added)
                        (status: "pending" → "reviewed")
```

---

## Integration Points

### 1. Authentication
- **File**: `services/backendApi.ts`
- **Functions**: `loginUser()`, `registerPatient()`, `registerDoctor()`
- **Storage**: User data stored in `localStorage` with key `'user'`
- **User Object Format**:
  ```typescript
  {
    id: string,
    username: string,
    full_name: string,
    role: 'patient' | 'doctor',
    specialization?: string
  }
  ```

### 2. Intake Completion
- **File**: `pages/patient/IntakePage.tsx`
- **Function**: `completeIntakeSession()`
- **Data Passed**:
  - `sessionId`: AI conversation session ID
  - `patientId`: From localStorage user.id
  - `doctorId`: From localStorage (or selected)
- **MongoDB Destination**: `patient_info` collection

### 3. Doctor Patient List
- **File**: `pages/doctor/DoctorPatientsPage.tsx`
- **Function**: `getDoctorPatientsReady(doctorId)`
- **MongoDB Query**: All docs in `patient_info` where `doctor_id` matches

### 4. Patient Details & Notes
- **Files**: 
  - `pages/doctor/PatientDetailsPage.tsx`
  - `services/backendApi.ts`
- **Functions**: 
  - `getPatientMedicalInfo(infoId)`
  - `addDoctorNotes(infoId, doctorNotes)`
  - `updatePatientInfoStatus(infoId, status)`
- **MongoDB**: Updates `patient_info` document

### 5. Patient History
- **File**: `pages/patient/PatientMedicalHistoryPage.tsx`
- **Function**: `getPatientMedicalHistory(patientId)`
- **MongoDB Query**: All docs in `patient_info` where `patient_id` matches

---

## API Endpoints Used

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register/patient`
- `POST /api/auth/register/doctor`

### Intake & Documents
- `POST /api/intake/start`
- `POST /api/intake/message`
- `POST /api/intake/complete` (now with patientId & doctorId)

### Patient Medical Information
- `POST /api/patient-medical-info` (save info after intake)
- `GET /api/doctor/{doctorId}/patients-ready` (doctor sees queue)
- `GET /api/patient-medical-info/{infoId}` (view patient details)
- `POST /api/patient-medical-info/{infoId}/notes` (add doctor notes)
- `PUT /api/patient-medical-info/{infoId}/status` (update status)
- `GET /api/patient/{patientId}/medical-history` (patient history)

---

## Key Features Implemented

### ✅ Patient Registration & Login
- Stores credentials in MongoDB
- Redirects to `/patient/dashboard`
- User info saved in localStorage

### ✅ Doctor Registration & Login
- Specialization field for doctors
- Redirects to `/doctor/queue`
- User info saved in localStorage

### ✅ Clinical Intake with MongoDB Storage
- AI conversation captured
- Automatically saved with patient and doctor IDs
- Status tracking for review progress

### ✅ Doctor Patient Queue
- Grid/card layout showing all pending patients
- Quick preview of conversation summaries
- One-click access to full details

### ✅ Full Patient Details & Notes
- Complete conversation display
- Medical reports display
- Doctor notes textarea
- Auto-save and status update

### ✅ Patient Medical History
- Expandable history view
- Shows all past consultations
- Displays each doctor's specialty
- Organized by date

### ✅ Session Persistence
- localStorage for user data
- Prevents unauthorized access
- Redirects to auth page if logged out

---

## Navigation Routes

```
PUBLIC ROUTES:
  /                              → Landing Page
  /patient/auth                  → Auth (Login/Signup)

PATIENT ROUTES (requires role='patient'):
  /patient/dashboard             → Patient Dashboard
  /patient/booking               → Appointment Booking
  /patient/queue                 → Digital Queue
  /patient/intake                → Clinical Intake ⭐
  /patient/medical-history       → Medical History ⭐ NEW
  /patient/profile               → Patient Profile

DOCTOR ROUTES (requires role='doctor'):
  /doctor/queue                  → Patients Ready ⭐ UPDATED
  /doctor/patient-details/:infoId → Patient Details ⭐ NEW
  /doctor/consultation           → Consultation Flow

ADMIN ROUTES:
  /admin                         → Admin Panel
```

---

## Local Storage Keys

| Key | Value | Purpose |
|-----|-------|---------|
| `user` | User object (JSON) | Store logged-in user info |
| `selectedDoctorId` | Doctor ID string | Track selected doctor for patient |

---

## File Structure - New Files

```
frontend/src/
├── pages/
│   ├── patient/
│   │   └── PatientMedicalHistoryPage.tsx    ⭐ NEW
│   └── doctor/
│       ├── DoctorPatientsPage.tsx          ⭐ NEW
│       └── PatientDetailsPage.tsx          ⭐ NEW
├── services/
│   └── backendApi.ts                       (UPDATED - new endpoints)
├── types/
│   └── models.ts                           (UPDATED - new interfaces)
└── App.tsx                                 (UPDATED - new routes)
```

---

## Testing the Integration

### Test Scenario: Complete Flow

1. **Start Backend**:
   ```bash
   cd backend
   python main.py
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Patient Flow**:
   - Go to `http://localhost:5173/patient/auth`
   - Click "Signup", select "Patient"
   - Create account: `patient1` / `pass123` / `John Doe`
   - Go to `/patient/intake`
   - Have conversation with AI
   - Click "Finish" to save to MongoDB

4. **Test Doctor Flow**:
   - Go to `http://localhost:5173/patient/auth`
   - Click "Signup", select "Doctor"
   - Create account: `doctor1` / `pass123` / `Dr. Smith` / `Cardiology`
   - Go to `/doctor/queue`
   - Should see patient from step 3
   - Click "View Full Details"
   - Add clinical notes
   - Click "Save Notes & Mark as Reviewed"

5. **Test Patient History**:
   - Login as patient from step 3
   - Go to `/patient/medical-history`
   - Should see consultation with Dr. Smith's notes

---

## Debugging Tips

### Patient Not Appearing in Doctor Queue
1. Check MongoDB `patient_info` collection exists
2. Verify `doctor_id` matches when completing intake
3. Check browser localStorage for user IDs
4. Verify API responses in browser Network tab

### Doctor Notes Not Saving
1. Check browser console for errors
2. Verify `infoId` is correct
3. Check MongoDB for update success
4. Ensure API endpoint returns success response

### Routing Issues
1. Verify localStorage `user` object has `id` field
2. Check role field is 'patient' or 'doctor'
3. Ensure routes in App.tsx match component imports
4. Clear localStorage if getting stuck on auth

---

## Next Steps / Future Enhancement

- [ ] Add appointment scheduling with doctor selection
- [ ] Implement real-time notifications
- [ ] Add video consultation capability
- [ ] Patient-doctor messaging
- [ ] Prescription management
- [ ] Test results integration
- [ ] Email/SMS notifications
- [ ] Dashboard analytics for admin

---

## Support

All new components have TypeScript types and are documented with comments.

**Key Files to Reference:**
- `services/backendApi.ts` - All API calls
- `types/models.ts` - Data type definitions
- Component files - Implementation examples
