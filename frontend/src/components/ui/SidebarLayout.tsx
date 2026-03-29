import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import type { SidebarNavItem } from '../../types/models';
import { Button } from './Button';
import { MediwoLogo } from './MediwoLogo';

interface SidebarLayoutProps {
  title: string;
  subtitle: string;
  navItems: SidebarNavItem[];
  userLabel: string;
  showLogout?: boolean;
}

export function SidebarLayout({ title, subtitle, navItems, userLabel, showLogout = false }: SidebarLayoutProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user session
    localStorage.removeItem('user');
    // Redirect to login page
    navigate('/patient/auth');
  };
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="brand-block">
          <span className="brand-pill">
            <MediwoLogo compact />
            Mediwo
          </span>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`.trim()
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="dashboard-content-area">
        <header className="dashboard-topbar">
          <div>
            <h1>{title}</h1>
            <p>AI-powered clinical workflow workspace</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="user-chip">{userLabel}</div>
            {showLogout && (
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </div>
        </header>
        <main className="dashboard-main">
          <Outlet />
        </main>
      </section>
    </div>
  );
}
