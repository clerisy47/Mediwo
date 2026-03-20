export type AsyncState = 'loading' | 'processing' | 'empty' | 'error' | 'success';

export type QueueUrgency = 'waiting' | 'near-turn' | 'now-serving';

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
