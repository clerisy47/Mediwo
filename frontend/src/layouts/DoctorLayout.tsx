import { SidebarLayout } from '../components/ui/SidebarLayout';

const doctorNav = [
  { label: 'Patient Queue', path: '/doctor/queue' },
  { label: 'Consultation Flow', path: '/doctor/consultation' },
];

export function DoctorLayout() {
  return (
    <SidebarLayout
      title="Doctor Dashboard"
      subtitle="Structured OPD consultation"
      navItems={doctorNav}
      userLabel="Dr. Priya Menon"
    />
  );
}
