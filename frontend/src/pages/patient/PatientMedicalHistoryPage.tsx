import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { getPatientMedicalHistory } from '../../services/backendApi';

interface MedicalHistoryItem {
  id: string;
  doctor_name: string;
  doctor_specialization: string;
  medical_reports_summary: string;
  conversation_summary: string | null;
  doctor_notes?: string;
  status: string;
  created_at: string;
}

export function PatientMedicalHistoryPage() {
  const [history, setHistory] = useState<MedicalHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        if (!user || user.role !== 'patient') {
          navigate('/patient/auth');
          return;
        }

        const response = await getPatientMedicalHistory(user.id);
        setHistory(response.history || []);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch medical history';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalHistory();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/patient/auth');
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Medical History"
          description="Your past consultations and doctor notes"
        />
        <Card>
          <p>Loading medical history...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <PageHeader
          title="Medical History"
          description={`Your consultations (${history.length})`}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button onClick={() => navigate('/patient/dashboard')}>Dashboard</Button>
          <Button onClick={handleLogout} style={{ background: '#ff6b6b' }}>
            Logout
          </Button>
        </div>
      </div>

      {error && (
        <Card>
          <div style={{ borderLeft: '4px solid #ff6b6b', padding: '15px', marginBottom: '20px' }}>
            <p style={{ color: '#ff6b6b', margin: 0 }}>Error: {error}</p>
          </div>
        </Card>
      )}

      {history.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: '16px', color: '#666' }}>No medical history yet.</p>
            <p style={{ fontSize: '14px', color: '#999' }}>Your consultations will appear here once completed.</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {history.map((item, index) => (
            <Card key={item.id}>
              <div style={{ overflow: 'hidden' }}>
              <div
                onClick={() => toggleExpanded(item.id)}
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: expandedId === item.id ? '#f5f5f5' : 'transparent',
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>
                      Consultation #{history.length - index}
                    </h3>
                    <div style={{
                      display: 'inline-block',
                      backgroundColor:
                        item.status === 'reviewed'
                          ? '#c8e6c9'
                          : item.status === 'uploaded'
                            ? '#e3f2fd'
                            : '#fff9c4',
                      color:
                        item.status === 'reviewed'
                          ? '#2e7d32'
                          : item.status === 'uploaded'
                            ? '#1565c0'
                            : '#f57c00',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      {item.status === 'reviewed'
                        ? '✓ Reviewed'
                        : item.status === 'uploaded'
                          ? '📄 Uploaded'
                          : '⏱️ Pending'}
                    </div>
                  </div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 500 }}>
                    Dr. {item.doctor_name}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                    Specialization: {item.doctor_specialization}
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#999' }}>
                    {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div style={{ fontSize: '24px', marginLeft: '20px', color: '#999' }}>
                  {expandedId === item.id ? '▼' : '▶'}
                </div>
              </div>

              {expandedId === item.id && (
                <div style={{ borderTop: '1px solid #eee', padding: '20px', backgroundColor: '#fafafa' }}>
                  {/* Conversation Summary */}
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>
                      Consultation Summary
                    </h4>
                    <div style={{
                      backgroundColor: 'white',
                      padding: '15px',
                      borderRadius: '6px',
                      lineHeight: '1.6',
                      color: '#333',
                      fontSize: '14px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      border: '1px solid #eee'
                    }}>
                      {item.conversation_summary || 'No intake conversation summary available yet.'}
                    </div>
                  </div>

                  {item.doctor_notes && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>
                        Doctor Notes
                      </h4>
                      <div style={{
                        backgroundColor: 'white',
                        padding: '15px',
                        borderRadius: '6px',
                        lineHeight: '1.6',
                        color: '#333',
                        fontSize: '14px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        border: '1px solid #eee'
                      }}>
                        {item.doctor_notes}
                      </div>
                    </div>
                  )}

                  {/* Medical Reports */}
                  {item.medical_reports_summary && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>
                        Medical Reports
                      </h4>
                      <div style={{
                        backgroundColor: 'white',
                        padding: '15px',
                        borderRadius: '6px',
                        lineHeight: '1.6',
                        color: '#333',
                        fontSize: '14px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        border: '1px solid #eee'
                      }}>
                        {item.medical_reports_summary}
                      </div>
                    </div>
                  )}

                  <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
                    📋 All your medical information is securely stored and private
                  </p>
                </div>
              )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
