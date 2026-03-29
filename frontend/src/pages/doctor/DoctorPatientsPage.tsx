import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { acceptQueuePatient, getDoctorQueueDetailed } from '../../services/backendApi';

interface QueuePatient {
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
}

export function DoctorPatientsPage() {
  const [patients, setPatients] = useState<QueuePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingQueueId, setAcceptingQueueId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        if (!user || user.role !== 'doctor') {
          navigate('/patient/auth');
          return;
        }

        const response = await getDoctorQueueDetailed(user.id);
        setPatients(response.queue || []);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch patients';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [navigate]);

  const handleAcceptPatient = async (queuePatient: QueuePatient) => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user?.id) {
        setError('Unable to identify doctor. Please login again.');
        return;
      }

      setAcceptingQueueId(queuePatient.queue_id);
      const result = await acceptQueuePatient(queuePatient.queue_id, user.id);
      navigate(`/doctor/patient-details/${result.patient_info.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to accept patient';
      setError(message);
    } finally {
      setAcceptingQueueId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/patient/auth');
  };

  if (loading) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Appointments"
          description="Patients who booked you and are waiting for acceptance"
        />
        <Card>
          <p>Loading patients...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <PageHeader
          title="Appointments"
          description={`Patients waiting in your queue (${patients.length})`}
        />
        <Button onClick={handleLogout} style={{ background: '#ff6b6b' }}>
          Logout
        </Button>
      </div>

      {error && <p style={{ color: '#ff6b6b', marginTop: 0 }}>Error: {error}</p>}

      {patients.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: '16px', color: '#666' }}>No patients waiting for review yet.</p>
            <p style={{ fontSize: '14px', color: '#999' }}>Patients will appear here as soon as they book appointments.</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {patients.map((patient) => (
            <Card key={patient.queue_id}>
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{patient.patient_name}</h3>
                <div style={{ display: 'inline-block', backgroundColor: '#e3f2fd', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#1976d2' }}>
                  {patient.status === 'waiting' ? '⏱ Waiting' : 'In Consultation'}
                </div>
              </div>

              <div style={{ marginBottom: '15px', fontSize: '13px', color: '#666' }}>
                <p style={{ margin: '0 0 4px 0' }}>Queue Position: <strong>{patient.position}</strong></p>
                <p style={{ margin: '0 0 4px 0' }}>Estimated Wait: <strong>{patient.estimated_wait_time}</strong></p>
              </div>

              <div style={{ marginBottom: '15px', fontSize: '13px' }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: '500', color: '#333' }}>
                  Intake Summary:
                </p>
                <p style={{ margin: 0, color: '#666', lineHeight: '1.5', maxHeight: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {patient.intake_summary || 'No intake conversation yet (null summary).' }
                </p>
              </div>

              {patient.medical_reports_summary && (
                <div style={{ marginBottom: '15px', fontSize: '13px' }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: '500', color: '#333' }}>
                    Medical Reports Summary:
                  </p>
                  <p style={{ margin: 0, color: '#666', lineHeight: '1.5', maxHeight: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {patient.medical_reports_summary}
                  </p>
                </div>
              )}

              <div style={{ fontSize: '12px', color: '#999', marginBottom: '15px' }}>
                Appointment time: {new Date(patient.joined_at).toLocaleDateString()} at {new Date(patient.joined_at).toLocaleTimeString()}
              </div>

              <Button
                onClick={() => {
                  if (patient.patient_info_id) {
                    navigate(`/doctor/patient-details/${patient.patient_info_id}`);
                    return;
                  }
                  void handleAcceptPatient(patient);
                }}
                style={{ width: '100%', background: '#1976d2', color: 'white' }}
                disabled={acceptingQueueId === patient.queue_id}
              >
                {acceptingQueueId === patient.queue_id
                  ? 'Accepting...'
                  : patient.patient_info_id
                    ? 'Open Details'
                    : 'Accept Patient'}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
