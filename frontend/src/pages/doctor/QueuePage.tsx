import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { doctorQueue } from '../../data/mockData';

const toneByStatus: Record<(typeof doctorQueue)[number]['status'], 'success' | 'warning' | 'info'> = {
  current: 'success',
  next: 'warning',
  waiting: 'info',
};

export function QueuePage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Patient Queue"
        description="Monitor live queue and identify the current and next patient in consultation flow."
      />

      <Card title="Today\'s Queue" subtitle="Current patient is highlighted for quick focus">
        <ul className="doctor-queue-list">
          {doctorQueue.map((patient) => (
            <li
              key={patient.id}
              className={`doctor-queue-item ${patient.status === 'current' ? 'doctor-queue-current' : ''}`.trim()}
            >
              <div>
                <p>
                  {patient.name} · {patient.age}y
                </p>
                <small>
                  Token {patient.token} · {patient.complaint}
                </small>
              </div>
              <Badge tone={toneByStatus[patient.status]}>{patient.status.toUpperCase()}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
