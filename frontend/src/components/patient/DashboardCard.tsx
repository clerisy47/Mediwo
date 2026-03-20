import { Card } from '../ui/Card';

interface DashboardCardProps {
  title: string;
  value: string;
  detail: string;
}

export function DashboardCard({ title, value, detail }: DashboardCardProps) {
  return (
    <Card className="dashboard-card" title={title}>
      <p className="metric-value">{value}</p>
      <p className="metric-detail">{detail}</p>
    </Card>
  );
}
