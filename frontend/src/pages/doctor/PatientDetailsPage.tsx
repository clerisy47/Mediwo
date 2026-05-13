import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { MarkdownText } from '../../components/ui/MarkdownText';
import {
  getPatientMedicalInfo,
  addDoctorNotes,
  generateDoctorSuggestions,
} from '../../services/backendApi';

interface PatientDetailsInfo {
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
}

export function PatientDetailsPage() {
  const { infoId } = useParams<{ infoId: string }>();
  const navigate = useNavigate();
  const [info, setInfo] = useState<PatientDetailsInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submittingNotes, setSubmittingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [notesSuccess, setNotesSuccess] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchPatientInfo = async () => {
      try {
        if (!infoId) {
          throw new Error('No patient info ID provided');
        }

        const response = await getPatientMedicalInfo(infoId);
        setInfo(response.info);
        setNotes(response.info.doctor_notes || '');
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch patient information';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientInfo();
  }, [infoId]);

  const handleAddNotes = async () => {
    if (!infoId || !notes.trim()) {
      setNotesError('Please enter your notes');
      return;
    }

    setSubmittingNotes(true);
    setNotesError(null);
    setNotesSuccess(false);

    try {
      await addDoctorNotes(infoId, notes);

      // Refresh the patient info
      const response = await getPatientMedicalInfo(infoId);
      setInfo(response.info);
      
      setNotesSuccess(true);
      setTimeout(() => setNotesSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save notes';
      setNotesError(message);
    } finally {
      setSubmittingNotes(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!info) {
      return;
    }

    setIsGeneratingSuggestions(true);
    setSuggestionsError(null);
    setSuggestions([]);
    setAcceptedSuggestions(new Set());

    try {
      const response = await generateDoctorSuggestions(
        info.medical_reports_summary || '',
        info.conversation_summary || '',
      );
      setSuggestions(response.suggestions);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate suggestions';
      setSuggestionsError(message);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleAcceptSuggestion = (suggestion: string) => {
    // Add to notes as a complete entry (already formatted as clinical note)
    setNotes((prev) => `${prev}${prev ? '\n' : ''}${suggestion}`);
    // Mark as accepted
    setAcceptedSuggestions((prev) => new Set([...prev, suggestion]));
  };

  const handleRejectSuggestion = (suggestion: string) => {
    // Remove from suggestions list
    setSuggestions((prev) => prev.filter((s) => s !== suggestion));
  };

  if (loading) {
    return (
      <div className="page-stack">
        <PageHeader title="Patient Details" description="Loading..." />
        <Card>
          <p>Loading patient information...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-stack">
        <PageHeader title="Patient Details" description="Error loading patient" />
        <Card style={{ borderLeft: '4px solid #ff6b6b', padding: '15px' }}>
          <p style={{ color: '#ff6b6b', margin: 0 }}>Error: {error}</p>
        </Card>
        <Button onClick={() => navigate('/doctor/queue')}>Back to Patients</Button>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="page-stack">
        <PageHeader title="Patient Details" description="Patient not found" />
        <Card>
          <p>Patient information not found</p>
        </Card>
        <Button onClick={() => navigate('/doctor/queue')}>Back to Patients</Button>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <PageHeader 
          title={`Patient: ${info.patient_name}`}
          description={`Review intake and add clinical notes`}
        />
        <Button onClick={() => navigate('/doctor/queue')}>Back to Patients</Button>
      </div>

      {/* Patient Information Section */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Patient Name</p>
            <h3 style={{ margin: 0, fontSize: '18px' }}>{info.patient_name}</h3>
          </div>
          <div>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Status</p>
            <div style={{
              display: 'inline-block',
              backgroundColor: info.status === 'reviewed' ? '#c8e6c9' : '#fff9c4',
              color: info.status === 'reviewed' ? '#2e7d32' : '#f57c00',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 500
            }}>
              {info.status === 'reviewed' ? '✓ Reviewed' : '⏱️ Pending Review'}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#999' }}>
          Intake completed: {new Date(info.created_at).toLocaleString()}
        </div>
      </Card>

      {/* AI Conversation Summary */}
      <Card style={{ marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>AI Assistant Conversation Summary</h3>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '6px',
          lineHeight: '1.6',
          color: '#333',
          wordBreak: 'break-word'
        }}>
          <MarkdownText content={info.conversation_summary || 'No intake conversation available.'} />
        </div>
      </Card>

      {/* Medical Reports Summary */}
      {info.medical_reports_summary && (
        <Card style={{ marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>Medical Reports Summary</h3>
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '15px',
            borderRadius: '6px',
            lineHeight: '1.6',
            color: '#333',
            wordBreak: 'break-word'
          }}>
            <MarkdownText content={info.medical_reports_summary} />
          </div>
        </Card>
      )}

      {/* Patient Counseling & Recommendations */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Suggested Clinical Notes for Patient</h3>
          <Button onClick={handleGenerateSuggestions} disabled={isGeneratingSuggestions}>
            {isGeneratingSuggestions ? 'Generating...' : 'Generate Suggestions'}
          </Button>
        </div>

        {suggestionsError && (
          <div
            style={{
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '12px',
            }}
          >
            Error: {suggestionsError}
          </div>
        )}

        {suggestions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: acceptedSuggestions.has(suggestion) ? '#e8f5e9' : '#f5f5f5',
                  padding: '12px',
                  borderRadius: '6px',
                  border: acceptedSuggestions.has(suggestion) ? '2px solid #4caf50' : '1px solid #ddd',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <p style={{ margin: 0, flex: 1, color: '#333', lineHeight: '1.5' }}>{suggestion}</p>
                <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                  {acceptedSuggestions.has(suggestion) ? (
                    <span style={{ color: '#4caf50', fontWeight: 'bold', padding: '6px 12px' }}>✓ Added</span>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleAcceptSuggestion(suggestion)}
                        style={{
                          background: '#4caf50',
                          color: 'white',
                          padding: '6px 12px',
                          fontSize: '12px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleRejectSuggestion(suggestion)}
                        style={{
                          background: '#f5f5f5',
                          color: '#666',
                          padding: '6px 12px',
                          fontSize: '12px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#999', margin: 0 }}>Generate AI-suggested clinical note entries to quickly document your counseling points from medical reports and patient intake.</p>
        )}
      </Card>

      {/* Doctor Notes Section */}
      <Card style={{ marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>Your Clinical Notes</h3>
        
        {notesSuccess && (
          <div style={{
            backgroundColor: '#c8e6c9',
            color: '#2e7d32',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            ✓ Notes saved successfully and patient marked as reviewed
          </div>
        )}

        {notesError && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            Error: {notesError}
          </div>
        )}

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter your clinical diagnosis, observations, and care recommendations..."
          style={{
            width: '100%',
            minHeight: '150px',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontFamily: 'inherit',
            fontSize: '14px',
            lineHeight: '1.5',
            marginBottom: '15px',
            boxSizing: 'border-box'
          }}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            onClick={handleAddNotes}
            style={{
              background: '#1976d2',
              color: 'white',
              flex: 1
            }}
            disabled={submittingNotes}
          >
            {submittingNotes ? 'Saving...' : 'Save Notes & Mark as Reviewed'}
          </Button>
        </div>
      </Card>

      {/* Summary */}
      <Card style={{ backgroundColor: '#f5f5f5' }}>
        <h4 style={{ marginTop: 0, marginBottom: '8px' }}>Review Checklist</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
          <li>✓ Read AI conversation summary above</li>
          <li>✓ Review medical reports if available</li>
          <li>✓ Document your clinical assessment in notes</li>
          <li>✓ Save notes to mark patient as reviewed</li>
        </ul>
      </Card>
    </div>
  );
}
