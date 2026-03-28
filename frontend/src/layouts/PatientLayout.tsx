import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MediwoLogo } from '../components/ui/MediwoLogo';

const patientLinks = [
  { label: 'Dashboard', path: '/patient/dashboard' },
  { label: 'Book', path: '/patient/booking' },
  { label: 'Queue', path: '/patient/queue' },
  { label: 'Intake', path: '/patient/intake' },
  { label: 'Profile', path: '/patient/profile' },
];

export function PatientLayout() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    // Clear user session
    localStorage.removeItem('user');
    // Redirect to login page
    navigate('/auth');
  };

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
        {user ? (
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            Logout
          </button>
        ) : (
          <NavLink to="/auth" className="btn btn-secondary btn-sm">
            Login
          </NavLink>
        )}
      </header>
      <main className="patient-main">
        <Outlet />
      </main>
    </div>
  );
}
