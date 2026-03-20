import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import type { MedicalSummary } from '../../types/models';

interface SummaryCardProps {
  summary: MedicalSummary;
  updateLabel?: string;
}

export function SummaryCard({ summary, updateLabel }: SummaryCardProps) {
  return (
    <Card title="AI-Generated Medical Summary" subtitle="Auto-generated from your medical records">
      <div className="summary-meta-row">
        <Badge tone="success">Auto-updated</Badge>
        <small>{updateLabel ?? `Updated at ${new Date(summary.generatedAt).toLocaleString()}`}</small>
      </div>

      <section className="summary-section">
        <h4>Past Conditions</h4>
        <ul>
          {summary.pastConditions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="summary-section">
        <h4>Medications</h4>
        <ul>
          {summary.medications.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="summary-section">
        <h4>Key History</h4>
        <ul>
          {summary.keyHistory.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {summary.clinicalNarrative && (
        <section className="summary-section">
          <h4>Clinical Narrative</h4>
          <p>{summary.clinicalNarrative}</p>
        </section>
      )}
    </Card>
  );
}
