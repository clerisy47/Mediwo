import { Link } from 'react-router-dom';

interface ActionButtonsProps {
  actions: Array<{ label: string; to: string; tone?: 'primary' | 'secondary' }>;
}

export function ActionButtons({ actions }: ActionButtonsProps) {
  return (
    <section className="action-buttons-grid" aria-label="Quick actions">
      {actions.map((action) => (
        <Link
          key={action.to}
          to={action.to}
          className={`action-tile ${action.tone === 'secondary' ? 'action-secondary' : ''}`.trim()}
        >
          <span>{action.label}</span>
          <span aria-hidden="true">→</span>
        </Link>
      ))}
    </section>
  );
}
