import { SidebarLayout } from '../components/ui/SidebarLayout';

const adminNav = [{ label: 'Operations Panel', path: '/admin' }];

export function AdminLayout() {
  return (
    <SidebarLayout
      title="Admin Panel"
      subtitle="Hospital flow control"
      navItems={adminNav}
      userLabel="Operations Admin"
    />
  );
}
