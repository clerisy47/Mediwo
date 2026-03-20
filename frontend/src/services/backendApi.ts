const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

interface IntakeStartResponse {
  sessionId: string;
  assistantMessage: string;
}

interface IntakeMessageResponse {
  assistantMessage: string;
}

interface IntakeCompleteResponse {
  summary: string;
}

interface ParseDocumentResponse {
  fileName: string;
  summary: string;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(body?.detail ?? 'Request failed');
  }

  return (await response.json()) as T;
}

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

export async function completeIntakeSession(sessionId: string): Promise<IntakeCompleteResponse> {
  const response = await fetch(`${API_BASE_URL}/api/intake/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId }),
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
