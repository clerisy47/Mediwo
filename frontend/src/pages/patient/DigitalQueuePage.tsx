import { useEffect, useState } from 'react';
import { StatusCard } from '../../components/patient/StatusCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { StateView } from '../../components/ui/StateView';

interface Doctor {
  id: string;
  username: string;
  full_name: string;
  specialization: string;
}

interface QueueStatus {
  queue_id?: string;
  doctor_id?: string;
  position?: number;
  estimated_wait_time?: string;
  joined_at?: string;
}

export function DigitalQueuePage() {
  const [loading, setLoading] = useState(true);
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [joiningQueue, setJoiningQueue] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  useEffect(() => {
    fetchAvailableDoctors();
    fetchCurrentQueueStatus();
    
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 700);

    return () => window.clearTimeout(timer);
  }, []);

  const fetchAvailableDoctors = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/doctors/available');
      const data = await response.json();
      
      if (data.success) {
        setAvailableDoctors(data.doctors);
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    }
  };

  const fetchCurrentQueueStatus = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    try {
      const response = await fetch(`http://localhost:8000/api/queue/patient/${currentUser.id}`);
      const data = await response.json();
      
      if (data.success && data.queue_status) {
        setQueueStatus(data.queue_status);
      }
    } catch (err) {
      console.error('Failed to fetch queue status:', err);
    }
  };

  const handleJoinQueue = async (doctor: Doctor) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setError('Please login first');
      return;
    }

    setJoiningQueue(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8000/api/queue/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctor_id: doctor.id,
          patient_id: currentUser.id,
          patient_name: currentUser.full_name
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Successfully joined ${doctor.full_name}'s queue!`);
        setQueueStatus(data.queue_info);
        setSelectedDoctor(doctor);
        fetchCurrentQueueStatus(); // Refresh status
      } else {
        setError(data.detail || 'Failed to join queue');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setJoiningQueue(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Digital Queue"
        description="Track your queue position in real time and arrive when your turn is near."
        actions={
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        }
      />

      {loading ? (
        <StateView state="loading" />
      ) : (
        <>
          {error && (
            <div style={{ color: 'red', marginBottom: '15px', padding: '10px', border: '1px solid #ff6b6b', borderRadius: '5px' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ color: 'green', marginBottom: '15px', padding: '10px', border: '1px solid #51cf66', borderRadius: '5px' }}>
              {success}
            </div>
          )}

          {queueStatus ? (
            <Card title="Your Current Queue Status">
              <div style={{ padding: '15px' }}>
                <p><strong>Position:</strong> #{queueStatus.position}</p>
                <p><strong>Estimated Wait Time:</strong> {queueStatus.estimated_wait_time}</p>
                {/* <p><strong>Joined At:</strong> {new Date(queueStatus.joined_at).toLocaleString()}</p> */}
              </div>
            </Card>
          ) : (
            <Card title="Available Doctors">
              {availableDoctors.length === 0 ? (
                <p>No doctors are currently available.</p>
              ) : (
                <div className="doctors-list">
                  {availableDoctors.map((doctor) => (
                    <div key={doctor.id} style={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: '8px', 
                      padding: '15px', 
                      marginBottom: '15px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0' }}>Dr. {doctor.full_name}</h4>
                        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                          {doctor.specialization}
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleJoinQueue(doctor)}
                        disabled={joiningQueue}
                        size="sm"
                      >
                        {joiningQueue ? 'Joining...' : 'Join Queue'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {queueStatus && (
            <Card title="Queue Guidance">
              <ul className="guidance-list">
                <li>You can stay in the waiting area until your turn approaches.</li>
                <li>Please keep your phone available for notifications.</li>
                <li>Arrive at the consultation room 5 minutes before your turn.</li>
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
