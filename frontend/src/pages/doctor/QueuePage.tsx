import { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';

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

const toneByStatus: Record<string, 'success' | 'warning' | 'info'> = {
  waiting: 'info',
  in_consultation: 'success',
  completed: 'warning',
};

export function QueuePage() {
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<QueuePatient[]>([]);
  const [error, setError] = useState('');

  // Get current doctor from localStorage
  const getCurrentDoctor = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  useEffect(() => {
    fetchDoctorQueue();
    
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 700);

    return () => window.clearTimeout(timer);
  }, []);

  const fetchDoctorQueue = async () => {
    const currentDoctor = getCurrentDoctor();
    if (!currentDoctor) {
      setError('Please login as a doctor');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/queue/doctor/${currentDoctor.id}`);
      const data = await response.json();
      
      if (data.success) {
        setQueue(data.queue);
      }
    } catch (err) {
      console.error('Failed to fetch doctor queue:', err);
      setError('Failed to load queue');
    }
  };

  const handleStartConsultation = async (patient: QueuePatient) => {
    try {
      const response = await fetch('http://localhost:8000/api/queue/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queue_id: patient.queue_id,
          status: 'in_consultation'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh queue
        fetchDoctorQueue();
        // Navigate to consultation page
        window.location.href = `/doctor/consultation?patient_id=${patient.patient_id}`;
      } else {
        setError(data.detail || 'Failed to start consultation');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };
  return (
    <div className="page-stack">
      <PageHeader
        title="Patient Queue"
        description="Monitor live queue and identify the current and next patient in consultation flow."
        actions={
          <Button variant="secondary" size="sm" onClick={fetchDoctorQueue}>
            Refresh Queue
          </Button>
        }
      />

      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', border: '1px solid #ff6b6b', borderRadius: '5px' }}>
          {error}
        </div>
      )}

      <Card title="Today's Queue" subtitle={`Total patients waiting: ${queue.filter(p => p.status === 'waiting').length}`}>
        {loading ? (
          <div>Loading queue...</div>
        ) : queue.length === 0 ? (
          <div>No patients in queue</div>
        ) : (
          <ul className="doctor-queue-list">
            {queue.map((patient) => (
              <li
                key={patient.queue_id}
                className={`doctor-queue-item ${patient.status === 'in_consultation' ? 'doctor-queue-current' : ''}`.trim()}
              >
                <div>
                  <p>
                    {patient.patient_name} · Position #{patient.position}
                  </p>
                  <small>
                    Joined: {new Date(patient.joined_at).toLocaleTimeString()} · 
                    Wait time: {patient.estimated_wait_time}
                  </small>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Badge tone={toneByStatus[patient.status] || 'info'}>
                    {patient.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {patient.status === 'waiting' && patient.position === 1 && (
                    <Button 
                      size="sm" 
                      onClick={() => handleStartConsultation(patient)}
                    >
                      Start Consultation
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
