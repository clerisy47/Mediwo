import { useEffect, useState } from 'react';
import { ActionButtons } from '../../components/patient/ActionButtons';
import { DashboardCard } from '../../components/patient/DashboardCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';

interface QueueStatus {
  queue_id?: string;
  doctor_id?: string;
  position?: number;
  estimated_wait_time?: string;
  joined_at?: string;
}

export function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    fetchQueueStatus(currentUser);
  }, []);

  const fetchQueueStatus = async (currentUser: any) => {
    if (!currentUser) return;

    try {
      const response = await fetch(`http://localhost:8000/api/queue/patient/${currentUser.id}`);
      const data = await response.json();
      
      if (data.success && data.queue_status) {
        setQueueStatus(data.queue_status);
      }
    } catch (err) {
      console.error('Failed to fetch queue status:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    if (!user) return 'Welcome';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${user.full_name}`;
  };

  const getActiveAppointmentInfo = () => {
    if (!queueStatus) {
      return {
        department: 'No active appointment',
        time: 'Book an appointment to get started',
        doctor: 'Select a doctor',
        date: 'Available time slots',
        mode: 'in-person'
      };
    }

    return {
      department: 'Consultation',
      time: queueStatus.estimated_wait_time || 'Waiting',
      doctor: `Doctor ID: ${queueStatus.doctor_id}`,
      date: queueStatus.joined_at ? new Date(queueStatus.joined_at).toLocaleDateString() : 'Today',
      mode: 'in-person'
    };
  };
  return (
    <div className="page-stack">
      <PageHeader
        title={getWelcomeMessage()}
        description="Your upcoming consultation details and prep status are available here."
      />

      <section className="grid-two">
        <DashboardCard
          title="Active Appointment"
          value={`${getActiveAppointmentInfo().department} · ${getActiveAppointmentInfo().time}`}
          detail={`${getActiveAppointmentInfo().doctor} · ${getActiveAppointmentInfo().date}`}
        />
        <DashboardCard
          title="Consultation Mode"
          value={getActiveAppointmentInfo().mode === 'in-person' ? 'In-Person Visit' : 'Tele-Consult'}
          detail="Arrival guidance and queue updates are shown in real time"
        />
      </section>

      {queueStatus ? (
        <Card title="Digital Queue Status" subtitle="Live OPD status synced every 30 seconds">
          <div className="status-grid">
            <div>
              <p className="label">Queue Position</p>
              <p className="value">#{queueStatus.position}</p>
            </div>
            <div>
              <p className="label">Estimated Wait</p>
              <p className="value">{queueStatus.estimated_wait_time}</p>
            </div>
            <div>
              <p className="label">Status</p>
              <p className="value">Waiting</p>
            </div>
            <div>
              <p className="label">Joined At</p>
              <p className="value">{queueStatus.joined_at ? new Date(queueStatus.joined_at).toLocaleTimeString() : 'Unknown'}</p>
            </div>
          </div>
        </Card>
      ) : (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          textAlign: 'center'
        }}>
          <h3>No Active Queue Status</h3>
          <p>You don't have any active appointments. Book an appointment to get started!</p>
        </div>
      )}

      <section>
        <h2>Quick Actions</h2>
        <ActionButtons
          actions={[
            { label: 'Book Appointment', to: '/patient/booking' },
            { label: 'Upload Medical Records', to: '/patient/profile', tone: 'secondary' },
            { label: 'View My Medical Summary', to: '/patient/profile' },
          ]}
        />
      </section>
    </div>
  );
}
