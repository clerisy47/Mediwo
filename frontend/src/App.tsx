import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { DoctorLayout } from './layouts/DoctorLayout';
import { PatientLayout } from './layouts/PatientLayout';
import { AdminPanelPage } from './pages/admin/AdminPanelPage';
import { ConsultationFlowPage } from './pages/doctor/ConsultationFlowPage';
import { QueuePage } from './pages/doctor/QueuePage';
import { DoctorPatientsPage } from './pages/doctor/DoctorPatientsPage';
import { PatientDetailsPage } from './pages/doctor/PatientDetailsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AppointmentBookingPage } from './pages/patient/AppointmentBookingPage';
import { AuthPage } from './pages/patient/AuthPage';
import { DashboardPage } from './pages/patient/DashboardPage';
import { DigitalQueuePage } from './pages/patient/DigitalQueuePage';
import { IntakePage } from './pages/patient/IntakePage';
import { LandingPage } from './pages/patient/LandingPage';
import { ProfilePage } from './pages/patient/ProfilePage';
import { PatientMedicalHistoryPage } from './pages/patient/PatientMedicalHistoryPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/patient/auth" element={<AuthPage />} />

      <Route path="/patient" element={<PatientLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="booking" element={<AppointmentBookingPage />} />
        <Route path="queue" element={<DigitalQueuePage />} />
        <Route path="intake" element={<IntakePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="medical-history" element={<PatientMedicalHistoryPage />} />
      </Route>

      <Route path="/doctor" element={<DoctorLayout />}>
        <Route index element={<Navigate to="queue" replace />} />
        <Route path="queue" element={<DoctorPatientsPage />} />
        <Route path="consultation" element={<ConsultationFlowPage />} />
        <Route path="patient-details/:infoId" element={<PatientDetailsPage />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminPanelPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
