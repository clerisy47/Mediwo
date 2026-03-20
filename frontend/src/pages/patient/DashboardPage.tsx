import { ActionButtons } from '../../components/patient/ActionButtons';
import { DashboardCard } from '../../components/patient/DashboardCard';
import { StatusCard } from '../../components/patient/StatusCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { patientAppointment, queueStatus } from '../../data/mockData';

export function DashboardPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Welcome back, Utsav"
        description="Your upcoming consultation details and prep status are available here."
      />

      <section className="grid-two">
        <DashboardCard
          title="Active Appointment"
          value={`${patientAppointment.department} · ${patientAppointment.time}`}
          detail={`${patientAppointment.doctor} · ${patientAppointment.date}`}
        />
        <DashboardCard
          title="Consultation Mode"
          value={patientAppointment.mode === 'in-person' ? 'In-Person Visit' : 'Tele-Consult'}
          detail="Arrival guidance and queue updates are shown in real time"
        />
      </section>

      <StatusCard status={queueStatus} />

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
