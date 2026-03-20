import { NavLink, Outlet } from 'react-router-dom';
import type { SidebarNavItem } from '../../types/models';

interface SidebarLayoutProps {
  title: string;
  subtitle: string;
  navItems: SidebarNavItem[];
  userLabel: string;
}

export function SidebarLayout({ title, subtitle, navItems, userLabel }: SidebarLayoutProps) {
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="brand-block">
          <span className="brand-pill">MEDIWO</span>
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
          <div className="user-chip">{userLabel}</div>
        </header>
        <main className="dashboard-main">
          <Outlet />
        </main>
      </section>
    </div>
  );
}
