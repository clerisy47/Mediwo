import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import {
  completeIntakeSession,
  sendIntakeMessage,
  startIntakeSession,
} from '../../services/backendApi';

interface ChatMessage {
  role: 'ai' | 'patient';
  message: string;
}

export function IntakePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    async function bootstrap() {
      try {
        setBusy(true);
        setError(null);

        const response = await startIntakeSession();
        setSessionId(response.sessionId);
        setMessages([{ role: 'ai', message: response.assistantMessage }]);
      } catch (requestError) {
        const message =
          requestError instanceof Error ? requestError.message : 'Unable to start intake session.';
        setError(message);
      } finally {
        setBusy(false);
      }
    }

    void bootstrap();
  }, []);

  const submitMessage = async (value: string) => {
    if (!sessionId || busy || completed) {
      return;
    }

    setMessages((prev) => [...prev, { role: 'patient', message: value }]);
    setTextInput('');
    setBusy(true);
    setError(null);

    try {
      const response = await sendIntakeMessage(sessionId, value);
      setMessages((prev) => [...prev, { role: 'ai', message: response.assistantMessage }]);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Failed to send message.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const finishIntake = async () => {
    if (!sessionId || busy || completed) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      // Get user info from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const patientId = user?.id;

      let selectedDoctorId = localStorage.getItem('selectedDoctorId');
      if (!selectedDoctorId && patientId) {
        const queueResponse = await fetch(`http://localhost:8000/api/queue/patient/${patientId}`);
        const queueData = await queueResponse.json();
        const queueDoctorId = queueData?.success ? queueData?.queue_status?.doctor_id : null;
        if (typeof queueDoctorId === 'string' && queueDoctorId) {
          selectedDoctorId = queueDoctorId;
          localStorage.setItem('selectedDoctorId', queueDoctorId);
        }
      }

      if (!selectedDoctorId) {
        throw new Error('No doctor linked to this intake. Please book an appointment first.');
      }

      const response = await completeIntakeSession(sessionId, patientId, selectedDoctorId);
      setSummary(response.summary);
      setCompleted(true);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          message: 'Thank you. Your pre-consultation intake is complete and the doctor summary is ready.',
        },
      ]);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to generate intake summary.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const submitText = async () => {
    const value = textInput.trim();
    if (!value) {
      return;
    }

    await submitMessage(value);
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Pre-Consultation Intake"
        description="Answer AI-led adaptive questions to reduce consultation start time."
      />

      <Card className="chat-card">
        <div className="chat-thread">
          {busy && messages.length === 0 && (
            <div className="chat-bubble chat-ai">Starting your intake session...</div>
          )}

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`chat-bubble ${message.role === 'ai' ? 'chat-ai' : 'chat-patient'}`}
            >
              {message.message}
            </div>
          ))}

          {error && <div className="chat-bubble chat-ai">Error: {error}</div>}
        </div>

        {!completed && (
          <div className="chat-input-row">
            <input
              type="text"
              value={textInput}
              onChange={(event) => setTextInput(event.target.value)}
              placeholder="Type your response"
              disabled={busy || !sessionId}
            />
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                void submitText();
              }}
              disabled={busy || !sessionId}
            >
              Send
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                void finishIntake();
              }}
              disabled={busy || !sessionId}
            >
              Finish
            </button>
          </div>
        )}

        {completed && summary && (
          <div className="summary-section">
            <h4>Doctor Summary</h4>
            <p>{summary}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
