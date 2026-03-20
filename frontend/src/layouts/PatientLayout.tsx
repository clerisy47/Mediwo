import { NavLink, Outlet } from 'react-router-dom';
import { MediwoLogo } from '../components/ui/MediwoLogo';

const patientLinks = [
  { label: 'Dashboard', path: '/patient/dashboard' },
  { label: 'Book', path: '/patient/booking' },
  { label: 'Queue', path: '/patient/queue' },
  { label: 'Intake', path: '/patient/intake' },
  { label: 'Profile', path: '/patient/profile' },
];

export function PatientLayout() {
  return (
    <div className="patient-shell">
      <header className="patient-topbar">
        <NavLink to="/" className="logo-link">
          <MediwoLogo />
        </NavLink>
        <nav className="patient-nav">
          {patientLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `patient-nav-link ${isActive ? 'patient-nav-active' : ''}`.trim()}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/auth" className="btn btn-secondary btn-sm">
          Login
        </NavLink>
      </header>
      <main className="patient-main">
        <Outlet />
      </main>
    </div>
  );
}
