import type {
  Appointment,
  MedicalSummary,
  QueuePatient,
  QueueStatus,
  UploadedReport,
} from '../types/models';

export const patientAppointment: Appointment = {
  department: 'General Medicine',
  doctor: 'Dr. Priya Menon',
  time: '11:30 AM',
  date: 'Today',
  mode: 'in-person',
};

export const queueStatus: QueueStatus = {
  queueNumber: 24,
  currentServing: 19,
  estimatedWaitMinutes: 18,
  urgency: 'near-turn',
};

export const sampleReports: UploadedReport[] = [
  {
    id: 'rep-1',
    name: 'CBC_Report_Feb_2026.pdf',
    uploadedAt: '2026-02-11',
    type: 'Blood Test',
  },
  {
    id: 'rep-2',
    name: 'Chest_XRay_Jan_2026.jpg',
    uploadedAt: '2026-01-28',
    type: 'Imaging',
  },
];

export const baseMedicalSummary: MedicalSummary = {
  pastConditions: ['Mild asthma', 'Seasonal allergic rhinitis'],
  medications: ['Montelukast 10mg at night', 'Salbutamol inhaler as needed'],
  keyHistory: [
    'No prior admissions in the last 3 years',
    'Family history of type-2 diabetes',
    'No known drug allergies documented',
  ],
  generatedAt: '2026-03-18T10:20:00.000Z',
};

export const doctorQueue: QueuePatient[] = [
  {
    id: 'p-301',
    name: 'Aarav Singh',
    age: 41,
    complaint: 'Persistent dry cough for 5 days',
    token: 'A-19',
    status: 'current',
  },
  {
    id: 'p-302',
    name: 'Neha Raut',
    age: 29,
    complaint: 'Recurrent migraine with nausea',
    token: 'A-20',
    status: 'next',
  },
  {
    id: 'p-303',
    name: 'Rahul Vyas',
    age: 54,
    complaint: 'Uncontrolled blood pressure follow-up',
    token: 'A-21',
    status: 'waiting',
  },
  {
    id: 'p-304',
    name: 'Meera Nambiar',
    age: 37,
    complaint: 'Lower back pain',
    token: 'A-22',
    status: 'waiting',
  },
];

export const intakeSymptoms = [
  'Dry cough',
  'Mild fever',
  'Fatigue',
  'No chest pain',
  'No breathlessness at rest',
];

export const historyBullets = [
  'Past diagnosis of mild asthma',
  'No known drug allergies',
  'Smoker: No',
  'Comorbidity: Prediabetes (last HbA1c: 6.1%)',
];

export const aiClinicalSummary = [
  'Patient reports sub-acute dry cough with low-grade fever and fatigue. Symptoms began 5 days ago and have remained stable without rapid deterioration. Current triage responses do not indicate acute respiratory distress, chest pain, or red-flag symptoms requiring emergency escalation.',
  'Given prior history of mild asthma and current symptom profile, differential may include viral upper respiratory infection with reactive airway component. Review recent CBC and imaging, confirm oxygen saturation, and correlate with auscultation findings before finalizing treatment and follow-up guidance.',
];

export const aiSuggestions = {
  symptoms: [
    'Dry cough x5 days, no sputum production',
    'Low-grade fever, predominantly evening rise',
    'Mild exertional fatigue, appetite preserved',
  ],
  diagnoses: [
    'Acute viral bronchitis',
    'Upper respiratory tract infection with reactive airway symptoms',
    'Rule out early atypical lower respiratory infection',
  ],
  prescriptions: [
    'Tab Levocetirizine 5mg HS x5 days',
    'Syrup Dextromethorphan 10ml SOS for cough',
    'Steam inhalation and hydration counseling',
  ],
};

export const adminDoctors = [
  { id: 'd-101', name: 'Dr. Priya Menon', department: 'General Medicine', status: 'On Duty' },
  { id: 'd-102', name: 'Dr. Rohan Patel', department: 'Cardiology', status: 'On Duty' },
  { id: 'd-103', name: 'Dr. Sana Ali', department: 'Dermatology', status: 'On Leave' },
  { id: 'd-104', name: 'Dr. Vinay Kumar', department: 'Orthopedics', status: 'On Duty' },
];

export const adminDepartments = [
  { name: 'General Medicine', doctors: 8, avgWait: 16 },
  { name: 'Cardiology', doctors: 4, avgWait: 27 },
  { name: 'Dermatology', doctors: 3, avgWait: 12 },
  { name: 'Orthopedics', doctors: 5, avgWait: 22 },
];

export const opdMetrics = {
  activePatients: 62,
  consultationsCompleted: 118,
  avgTurnaroundMin: 14,
  aiSummaryCoverage: 93,
};

export const departmentOptions = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'ENT',
];

export const doctorByDepartment: Record<string, string[]> = {
  'General Medicine': ['Dr. Priya Menon', 'Dr. Kunal Sharma'],
  Cardiology: ['Dr. Rohan Patel', 'Dr. Ananya Gupta'],
  Dermatology: ['Dr. Sana Ali', 'Dr. Mira Dsouza'],
  Orthopedics: ['Dr. Vinay Kumar', 'Dr. S. Chatterjee'],
  ENT: ['Dr. Ritesh Nair', 'Dr. Faria Khan'],
};

export const slotOptions = [
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
];
