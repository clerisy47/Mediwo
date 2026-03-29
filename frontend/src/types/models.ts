export type AsyncState = 'loading' | 'processing' | 'empty' | 'error' | 'success';

export type QueueUrgency = 'waiting' | 'near-turn' | 'now-serving';

export interface User {
  id: string;
  username: string;
  full_name: string;
  role: 'patient' | 'doctor';
  specialization?: string;
}

export interface Appointment {
  department: string;
  doctor: string;
  time: string;
  date: string;
  mode: 'in-person' | 'tele-consult';
}

export interface UploadedReport {
  id: string;
  name: string;
  uploadedAt: string;
  type: string;
}

export interface MedicalSummary {
  pastConditions: string[];
  medications: string[];
  keyHistory: string[];
  generatedAt: string;
  clinicalNarrative?: string;
}

export interface QueueStatus {
  queueNumber: number;
  currentServing: number;
  estimatedWaitMinutes: number;
  urgency: QueueUrgency;
}

export interface QueuePatient {
  id: string;
  name: string;
  age: number;
  complaint: string;
  token: string;
  status: 'current' | 'next' | 'waiting';
}

export interface SidebarNavItem {
  label: string;
  path: string;
}

// MongoDB Patient Medical Info Types
export interface PatientMedicalInfo {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_username?: string;
  doctor_id: string;
  doctor_name?: string;
  doctor_specialization?: string;
  medical_reports_summary: string;
  conversation_summary: string;
  doctor_notes?: string;
  status: 'pending' | 'reviewed' | 'completed';
  created_at: string;
  updated_at?: string;
}

export interface PatientMedicalHistoryItem {
  id: string;
  doctor_name: string;
  doctor_specialization: string;
  medical_reports_summary: string;
  conversation_summary: string;
  status: string;
  created_at: string;
}

