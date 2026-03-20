import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import type { QueueStatus } from '../../types/models';

interface StatusCardProps {
  status: QueueStatus;
}

const toneByStatus: Record<QueueStatus['urgency'], 'warning' | 'success' | 'info'> = {
  waiting: 'info',
  'near-turn': 'warning',
  'now-serving': 'success',
};

const labelByStatus: Record<QueueStatus['urgency'], string> = {
  waiting: 'Waiting',
  'near-turn': 'Near Turn',
  'now-serving': 'Now Serving',
};

export function StatusCard({ status }: StatusCardProps) {
  return (
    <Card title="Digital Queue Status" subtitle="Live OPD status synced every 30 seconds">
      <div className="status-grid">
        <div>
          <p className="label">Queue Number</p>
          <p className="value">#{status.queueNumber}</p>
        </div>
        <div>
          <p className="label">Current Serving</p>
          <p className="value">#{status.currentServing}</p>
        </div>
        <div>
          <p className="label">Estimated Wait</p>
          <p className="value">{status.estimatedWaitMinutes} mins</p>
        </div>
        <div>
          <p className="label">Status</p>
          <Badge tone={toneByStatus[status.urgency]}>{labelByStatus[status.urgency]}</Badge>
        </div>
      </div>
    </Card>
  );
}
