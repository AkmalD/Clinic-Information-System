import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import PatientsPage from '../pages/patients/PatientsPage';
import RegistrationsPage from '../pages/registrations/RegistrationsPage';
import MedicalRecordsPage from '../pages/medicalRecords/MedicalRecordsPage';
import DoctorsPage from '../pages/doctors/DoctorsPage';
import UsersPage from '../pages/users/UsersPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/registrations" element={<RegistrationsPage />} />
          <Route path="/medical-records" element={<MedicalRecordsPage />} />

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}