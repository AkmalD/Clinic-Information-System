import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import PatientsPage from '../pages/patients/PatientsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/patients" element={<PatientsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}