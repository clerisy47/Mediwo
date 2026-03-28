import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { StateView } from '../../components/ui/StateView';

interface QueueStatus {
  queue_id?: string;
  doctor_id?: string;
  position?: number;
  estimated_wait_time?: string;
  joined_at?: string;
}

export function DigitalQueuePage() {
  const [loading, setLoading] = useState(true);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [error, setError] = useState('');

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  useEffect(() => {
    fetchCurrentQueueStatus();
    
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 700);

    return () => window.clearTimeout(timer);
  }, []);

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

          {queueStatus ? (
            <Card title="Your Current Queue Status">
              <div style={{ padding: '15px' }}>
                <p><strong>Position:</strong> #{queueStatus.position}</p>
                <p><strong>Estimated Wait Time:</strong> {queueStatus.estimated_wait_time}</p>
                <p><strong>Joined At:</strong> {queueStatus.joined_at ? new Date(queueStatus.joined_at).toLocaleString() : 'Unknown'}</p>
              </div>
            </Card>
          ) : (
            <Card title="Queue Status">
              <p>You are not currently in any queue.</p>
              <p style={{ marginTop: '15px' }}>
                <strong>To join a queue:</strong><br />
                1. Go to <strong>Appointment Booking</strong><br />
                2. Select a doctor and book an appointment<br />
                3. You will be automatically added to their queue
              </p>
              <div style={{ marginTop: '20px' }}>
                <Button onClick={() => window.location.href = '/patient/booking'}>
                  Book Appointment
                </Button>
              </div>
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
