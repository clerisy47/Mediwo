import { useMemo, useState, useEffect } from 'react';
import { InlineHints } from '../../components/doctor/InlineHints';
import { RichTextEditor } from '../../components/doctor/RichTextEditor';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { MarkdownText } from '../../components/ui/MarkdownText';
import { PageHeader } from '../../components/ui/PageHeader';
import { StateView } from '../../components/ui/StateView';
import { StepIndicator } from '../../components/ui/StepIndicator';

type AsyncState = 'empty' | 'processing' | 'success' | 'error';

interface PatientSummary {
  id: string;
  patient_id: string;
  doctor_id: string;
  session_id: string;
  conversation_summary: string;
  documents_summary?: string;
  created_at: string;
  status: string;
}

interface QueuePatient {
  queue_id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  joined_at: string;
  status: string;
  position: number;
  estimated_wait_time: string;
}

const flowSteps = [
  'Patient Overview + AI Summary',
  'Smart Documentation Editor',
  'Finalize Consultation',
];

export function ConsultationFlowPage() {
  const [step, setStep] = useState(1);
  const [notes, setNotes] = useState('');
  const [acceptedHints, setAcceptedHints] = useState<string[]>([]);
  const [saveState, setSaveState] = useState<AsyncState>('empty');
  const [patientSummary, setPatientSummary] = useState<PatientSummary | null>(null);
  const [queuePatient, setQueuePatient] = useState<QueuePatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [doctor, setDoctor] = useState<any>(null);

  // Get current doctor and patient from URL params or localStorage
  const getCurrentDoctor = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  const getPatientIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('patient_id');
  };

  useEffect(() => {
    const currentDoctor = getCurrentDoctor();
    setDoctor(currentDoctor);
    fetchPatientSummary();
  }, []);

  const fetchPatientSummary = async () => {
    const currentDoctor = getCurrentDoctor();
    const patientId = getPatientIdFromUrl();
    
    if (!currentDoctor || !patientId) {
      setError('Missing doctor or patient information');
      setLoading(false);
      return;
    }

    console.log('Fetching consultation data for patient:', patientId, 'doctor:', currentDoctor.id);

    try {
      // Fetch patient summaries
      const summaryResponse = await fetch(`http://localhost:8000/api/patient-summaries/doctor/${currentDoctor.id}`);
      const summaryData = await summaryResponse.json();
      
      if (summaryData.success) {
        const patientSummary = summaryData.summaries.find((s: PatientSummary) => s.patient_id === patientId);
        if (patientSummary) {
          setPatientSummary(patientSummary);
          console.log('Found patient summary:', patientSummary);
        }
      }

      // Fetch queue patient information
      const queueResponse = await fetch(`http://localhost:8000/api/queue/doctor/${currentDoctor.id}`);
      const queueData = await queueResponse.json();
      
      if (queueData.success) {
        const queuePatient = queueData.queue.find((p: QueuePatient) => p.patient_id === patientId);
        if (queuePatient) {
          setQueuePatient(queuePatient);
          console.log('Found queue patient:', queuePatient);
        }
      }

    } catch (err) {
      console.error('Failed to fetch patient information:', err);
      setError('Failed to load patient information');
    } finally {
      setLoading(false);
    }
  };

  const appendSuggestion = (text: string) => {
    if (acceptedHints.includes(text)) {
      return;
    }

    setAcceptedHints((prev) => [...prev, text]);
    setNotes((prev) => `${prev}${prev ? '\n' : ''}- ${text}`);
  };

  const ignoreSuggestion = () => {
    return;
  };

  const notesWordCount = useMemo(() => {
    return notes.trim() ? notes.trim().split(/\s+/).length : 0;
  }, [notes]);

  const saveConsultation = async () => {
    if (!queuePatient) {
      setError('No patient selected');
      return;
    }

    setSaveState('processing');

    try {
      // Update queue status to completed
      const response = await fetch('http://localhost:8000/api/queue/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queue_id: queuePatient.queue_id,
          status: 'completed'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSaveState('success');
        console.log('Consultation completed successfully');
        
        // Redirect back to queue after 2 seconds
        setTimeout(() => {
          window.location.href = '/doctor/queue';
        }, 2000);
      } else {
        setError('Failed to complete consultation');
        setSaveState('error');
      }
    } catch (err) {
      console.error('Failed to save consultation:', err);
      setError('Network error. Please try again.');
      setSaveState('error');
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title={`Dr. ${doctor?.full_name || 'Loading...'} - Consultation`}
        description={`Consultation workflow for ${doctor?.specialization || 'General Practice'}. Fixed step-based workflow for consistency, speed, and structured clinical records.`}
      />

      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', border: '1px solid #ff6b6b', borderRadius: '5px' }}>
          {error}
        </div>
      )}

      <StepIndicator steps={flowSteps} activeStep={step} />

      {step === 1 && (
        <section className="consultation-grid">
          <Card title="Patient Overview" subtitle="Intake and longitudinal context">
            {loading ? (
              <div>Loading patient information...</div>
            ) : error ? (
              <div style={{ color: 'red' }}>{error}</div>
            ) : queuePatient ? (
              <>
                <div className="overview-block">
                  <h4>Patient Information</h4>
                  <p><strong>Name:</strong> {queuePatient.patient_name}</p>
                  <p><strong>Patient ID:</strong> {queuePatient.patient_id}</p>
                  <p><strong>Queue Position:</strong> #{queuePatient.position}</p>
                  <p><strong>Status:</strong> <Badge tone="info">{queuePatient.status}</Badge></p>
                  <p><strong>Joined Queue:</strong> {new Date(queuePatient.joined_at).toLocaleString()}</p>
                </div>

                {patientSummary ? (
                  <>
                    <div className="overview-block">
                      <h4>AI Generated Clinical Summary</h4>
                      <div style={{ 
                        background: '#f8f9fa', 
                        padding: '15px', 
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                      }}>
                        <MarkdownText content={patientSummary.conversation_summary} className="clinical-paragraph" />
                      </div>
                    </div>

                    {patientSummary.documents_summary && (
                      <div className="overview-block">
                        <h4>Document Analysis</h4>
                        <div style={{ 
                          background: '#f8f9fa', 
                          padding: '15px', 
                          borderRadius: '8px',
                          border: '1px solid #e9ecef'
                        }}>
                          <MarkdownText content={patientSummary.documents_summary} className="clinical-paragraph" />
                        </div>
                      </div>
                    )}

                    <div className="overview-block">
                      <h4>Consultation Time</h4>
                      <p>Created: {new Date(patientSummary.created_at).toLocaleString()}</p>
                    </div>
                  </>
                ) : (
                  <div className="overview-block">
                    <h4>AI Clinical Summary</h4>
                    <div style={{ 
                      background: '#fff3cd', 
                      padding: '15px', 
                      borderRadius: '8px',
                      border: '1px solid #ffeaa7'
                    }}>
                      <p style={{ margin: '0', color: '#856404' }}>
                        <strong>No AI intake completed yet.</strong><br />
                        The patient has not completed the AI-powered intake questionnaire. 
                        You can proceed with the consultation manually or ask the patient to complete the intake first.
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>No patient information available</div>
            )}
          </Card>

          <Card title="Consultation Actions" subtitle="Next steps">
            <Button onClick={() => setStep(2)} disabled={!queuePatient}>
              Next → Proceed to Documentation
            </Button>
          </Card>
        </section>
      )}

      {step === 2 && (
        <section className="editor-layout">
          <Card title="Smart Documentation Editor" subtitle="Add consultation notes">
            <RichTextEditor value={notes} onChange={setNotes} />
            <p className="muted-text">Word count: {notesWordCount}</p>
            <InlineHints acceptedHints={acceptedHints} />
          </Card>

          <div className="step-actions">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back to Overview
            </Button>
            <Button onClick={() => setStep(3)}>Next → Finalize Consultation</Button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="page-stack">
          <Card title="Finalize Consultation" subtitle="Save notes and complete this encounter">
            <p className="muted-text">
              Review complete notes and ensure diagnosis and prescription sections are finalized.
            </p>
            {notes.trim() ? (
              <MarkdownText content={notes} className="final-notes-preview" />
            ) : (
              <div className="final-notes-preview empty">No documentation added yet.</div>
            )}
            <div className="step-actions">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Back to Editor
              </Button>
              <Button variant="success" onClick={saveConsultation}>
                Save Notes
              </Button>
              <Button onClick={saveConsultation}>Complete Consultation</Button>
            </div>
          </Card>

          {saveState === 'processing' && <StateView state="processing" />}
          {saveState === 'success' && (
            <StateView
              state="success"
              title="Consultation completed"
              description="Clinical notes saved and OPD queue has moved to the next patient."
            />
          )}
        </section>
      )}
    </div>
  );
}
