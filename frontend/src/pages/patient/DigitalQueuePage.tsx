import { useEffect, useState } from 'react';
import { StatusCard } from '../../components/patient/StatusCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { StateView } from '../../components/ui/StateView';
import { queueStatus as initialQueueStatus } from '../../data/mockData';
import type { QueueStatus } from '../../types/models';

const cycle: QueueStatus['urgency'][] = ['waiting', 'near-turn', 'now-serving'];

export function DigitalQueuePage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<QueueStatus>(initialQueueStatus);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 700);

    return () => window.clearTimeout(timer);
  }, []);

  const simulateQueueProgress = () => {
    const currentIndex = cycle.indexOf(status.urgency);
    const nextUrgency = cycle[(currentIndex + 1) % cycle.length];
    const currentServing = status.currentServing + (nextUrgency === 'now-serving' ? 1 : 0);

    setStatus({
      ...status,
      urgency: nextUrgency,
      currentServing,
      estimatedWaitMinutes: Math.max(0, status.queueNumber - currentServing) * 3,
    });
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Digital Queue"
        description="Track your queue position in real time and arrive when your turn is near."
        actions={
          <Button variant="secondary" size="sm" onClick={simulateQueueProgress}>
            Simulate Update
          </Button>
        }
      />

      {loading ? (
        <StateView state="loading" />
      ) : (
        <>
          <StatusCard status={status} />
          <Card title="Queue Guidance">
            <ul className="guidance-list">
              <li>Waiting: You can stay in the waiting area.</li>
              <li>Near Turn: Please stay close to consultation room.</li>
              <li>Now Serving: Proceed to the doctor cabin now.</li>
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
