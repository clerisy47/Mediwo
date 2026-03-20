import { NavLink } from 'react-router-dom';
import { Card } from '../../components/ui/Card';

const features = [
  {
    title: 'Smart Intake',
    description:
      'Collect adaptive symptom and history data before consultation to reduce OPD documentation load.',
  },
  {
    title: 'Digital Queue',
    description:
      'Live queue transparency helps patients plan arrival and helps front desk reduce crowding.',
  },
  {
    title: 'Medical Record Memory',
    description:
      'Uploaded reports are continuously transformed into structured, longitudinal patient summaries.',
  },
];

export function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <NavLink to="/" className="logo-link">
          MEDIWO
        </NavLink>
        <nav>
          <NavLink to="/auth" className="btn btn-secondary btn-sm">
            Login
          </NavLink>
          <NavLink to="/patient/dashboard" className="btn btn-primary btn-sm">
            Get Started
          </NavLink>
        </nav>
      </header>

      <section className="hero-panel">
        <p className="eyebrow">AI-Powered Medical Workflow Optimization</p>
        <h1>Reduce waiting time with AI-powered intake</h1>
        <p>
          MEDIWO streamlines OPD consultations by preparing patient context before the doctor sees the
          patient, helping care teams move faster without losing clinical detail.
        </p>
        <div className="hero-actions">
          <NavLink to="/patient/dashboard" className="btn btn-primary btn-lg">
            Get Started
          </NavLink>
          <NavLink to="/auth" className="btn btn-ghost btn-lg">
            Login
          </NavLink>
        </div>
      </section>

      <section className="feature-grid">
        {features.map((feature) => (
          <Card key={feature.title} title={feature.title}>
            <p>{feature.description}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
