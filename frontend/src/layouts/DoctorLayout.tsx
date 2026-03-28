import { useEffect, useState } from 'react';
import { SidebarLayout } from '../components/ui/SidebarLayout';

const doctorNav = [
  { label: 'Patient Queue', path: '/doctor/queue' },
  { label: 'Consultation Flow', path: '/doctor/consultation' },
];

export function DoctorLayout() {
  const [user, setUser] = useState<any>(null);

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const userLabel = user ? `Dr. ${user.full_name}` : 'Loading...';

  return (
    <SidebarLayout
      title="Doctor Dashboard"
      subtitle="Structured OPD consultation"
      navItems={doctorNav}
      userLabel={userLabel}
      showLogout={true}
    />
  );
}
