import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UnitsPage from './pages/UnitsPage';
import DevelopersPage from './pages/DevelopersPage';
import CompoundsPage from './pages/CompoundsPage';
import MarketplacePage from './pages/MarketplacePage';
import PhoneRequestsPage from './pages/PhoneRequestsPage';
import PublicUnitPage from './pages/PublicUnitPage';
import TeamsPage from './pages/TeamsPage';
import UsersPage from './pages/UsersPage';
import VisibilityRequestsPage from './pages/VisibilityRequestsPage';
import DropdownsPage from './pages/DropdownsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import './index.css';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/units" element={<UnitsPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/phone-requests" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><PhoneRequestsPage /></ProtectedRoute>} />
        <Route path="/visibility-requests" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><VisibilityRequestsPage /></ProtectedRoute>} />
        <Route path="/developers" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'manager']}><DevelopersPage /></ProtectedRoute>} />
        <Route path="/compounds" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'manager']}><CompoundsPage /></ProtectedRoute>} />
        <Route path="/teams" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><TeamsPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><UsersPage /></ProtectedRoute>} />
        <Route path="/dropdowns" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'manager']}><DropdownsPage /></ProtectedRoute>} />
        <Route path="/audit-logs" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><AuditLogsPage /></ProtectedRoute>} />
      </Route>

      <Route path="/unit/:id/share" element={<PublicUnitPage />} />
      <Route path="/share/unit/:id" element={<PublicUnitPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
