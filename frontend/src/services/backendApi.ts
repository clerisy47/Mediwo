const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

interface IntakeStartResponse {
  sessionId: string;
  assistantMessage: string;
}

interface IntakeMessageResponse {
  assistantMessage: string;
}

interface IntakeCompleteResponse {
  success: boolean;
  summary: string;
}

interface ParseDocumentResponse {
  fileName: string;
  summary: string;
}

interface UserResponse {
  id: string;
  username: string;
  full_name: string;
  role: 'patient' | 'doctor';
  specialization?: string;
}

interface LoginResponse {
  success: boolean;
  user: UserResponse;
}

interface PatientMedicalInfoResponse {
  success: boolean;
  info: {
    id: string;
    patient_id: string;
    doctor_id: string;
    medical_reports_summary: string;
    conversation_summary: string | null;
    doctor_notes?: string;
    status: string;
    created_at: string;
    updated_at?: string;
  };
}

interface PatientMedicalInfoDetailResponse {
  success: boolean;
  info: {
    id: string;
    patient_id: string;
    patient_name: string;
    doctor_name?: string;
    doctor_specialization?: string;
    medical_reports_summary: string;
    conversation_summary: string | null;
    doctor_notes?: string;
    status: string;
    created_at: string;
    updated_at?: string;
  };
}

interface DoctorPatientsResponse {
  success: boolean;
  count: number;
  patients: Array<{
    id: string;
    patient_id: string;
    patient_name: string;
    patient_username: string;
    doctor_id: string;
    medical_reports_summary: string;
    conversation_summary: string | null;
    status: string;
    created_at: string;
  }>;
}

interface DoctorQueueResponse {
  success: boolean;
  queue: Array<{
    queue_id: string;
    patient_id: string;
    patient_name: string;
    doctor_id: string;
    position: number;
    estimated_wait_time: string;
    status: string;
    joined_at: string;
    medical_reports_summary?: string | null;
    intake_summary?: string | null;
    patient_info_id?: string | null;
  }>;
}

interface AcceptQueuePatientResponse {
  success: boolean;
  message: string;
  patient_info: {
    id: string;
    patient_id: string;
    doctor_id: string;
    medical_reports_summary?: string | null;
    conversation_summary?: string | null;
    status: string;
    created_at: string;
  };
}

interface PatientHistoryResponse {
  success: boolean;
  count: number;
  history: Array<{
    id: string;
    doctor_name: string;
    doctor_specialization: string;
    medical_reports_summary: string;
    conversation_summary: string | null;
    doctor_notes?: string;
    status: string;
    created_at: string;
  }>;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(body?.detail ?? 'Request failed');
  }

  return (await response.json()) as T;
}

// ==================== Authentication ====================

export async function loginUser(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  return parseResponse<LoginResponse>(response);
}

export async function registerPatient(
  username: string,
  password: string,
  full_name: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register/patient`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password, full_name }),
  });

  return parseResponse<LoginResponse>(response);
}

export async function registerDoctor(
  username: string,
  password: string,
  full_name: string,
  specialization: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register/doctor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password, full_name, specialization }),
  });

  return parseResponse<LoginResponse>(response);
}

// ==================== Intake & Clinical ====================

export async function startIntakeSession(): Promise<IntakeStartResponse> {
  const response = await fetch(`${API_BASE_URL}/api/intake/start`, {
    method: 'POST',
  });

  return parseResponse<IntakeStartResponse>(response);
}

export async function sendIntakeMessage(
  sessionId: string,
  message: string,
): Promise<IntakeMessageResponse> {
  const response = await fetch(`${API_BASE_URL}/api/intake/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId, message }),
  });

  return parseResponse<IntakeMessageResponse>(response);
}

export async function completeIntakeSession(
  sessionId: string,
  patientId?: string,
  doctorId?: string,
  medicalReportsSummary?: string,
): Promise<IntakeCompleteResponse> {
  const response = await fetch(`${API_BASE_URL}/api/intake/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      sessionId, 
      patientId, 
      doctorId,
      medical_reports_summary: medicalReportsSummary || ''
    }),
  });

  return parseResponse<IntakeCompleteResponse>(response);
}

export async function parseDocument(file: File): Promise<ParseDocumentResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/documents/parse`, {
    method: 'POST',
    body: formData,
  });

  return parseResponse<ParseDocumentResponse>(response);
}

// ==================== Patient Medical Information ====================

export async function savePatientMedicalInfo(
  patientId: string,
  doctorId: string,
  medicalReportsSummary: string,
  conversationSummary: string,
): Promise<PatientMedicalInfoResponse> {
  const response = await fetch(`${API_BASE_URL}/api/patient-medical-info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      patient_id: patientId,
      doctor_id: doctorId,
      medical_reports_summary: medicalReportsSummary,
      conversation_summary: conversationSummary,
    }),
  });

  return parseResponse<PatientMedicalInfoResponse>(response);
}

export async function getDoctorPatientsReady(doctorId: string): Promise<DoctorPatientsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/doctor/${doctorId}/patients-ready`);

  return parseResponse<DoctorPatientsResponse>(response);
}

export async function getDoctorQueueDetailed(doctorId: string): Promise<DoctorQueueResponse> {
  const response = await fetch(`${API_BASE_URL}/api/queue/doctor/${doctorId}/detailed`);

  return parseResponse<DoctorQueueResponse>(response);
}

export async function acceptQueuePatient(
  queueId: string,
  doctorId: string,
): Promise<AcceptQueuePatientResponse> {
  const response = await fetch(`${API_BASE_URL}/api/queue/${queueId}/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ doctor_id: doctorId }),
  });

  return parseResponse<AcceptQueuePatientResponse>(response);
}

export async function getPatientMedicalInfo(
  infoId: string,
): Promise<PatientMedicalInfoDetailResponse> {
  const response = await fetch(`${API_BASE_URL}/api/patient-medical-info/${infoId}`);

  return parseResponse<PatientMedicalInfoDetailResponse>(response);
}

export async function updatePatientInfoStatus(
  infoId: string,
  status: string,
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/patient-medical-info/${infoId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  return parseResponse<{ success: boolean }>(response);
}

export async function addDoctorNotes(
  infoId: string,
  doctorNotes: string,
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/patient-medical-info/${infoId}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ info_id: infoId, doctor_notes: doctorNotes }),
  });

  return parseResponse<{ success: boolean }>(response);
}

export async function getPatientMedicalHistory(
  patientId: string,
): Promise<PatientHistoryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/patient/${patientId}/medical-history`);

  return parseResponse<PatientHistoryResponse>(response);
}

export async function saveMedicalReportsSummary(
  patientId: string,
  summary: string,
): Promise<{ success: boolean; id: string }> {
  const response = await fetch(`${API_BASE_URL}/api/patient/${patientId}/medical-reports-summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ summary }),
  });

  return parseResponse<{ success: boolean; id: string }>(response);
}

export async function getMedicalReportsSummaries(
  patientId: string,
): Promise<{ success: boolean; summaries: Array<{ id: string; summary: string; created_at: string }> }> {
  const response = await fetch(`${API_BASE_URL}/api/patient/${patientId}/medical-reports-summary`);

  return parseResponse<{ success: boolean; summaries: Array<{ id: string; summary: string; created_at: string }> }>(response);
}

