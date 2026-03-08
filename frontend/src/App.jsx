import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isAuthenticated, logout, verifyToken, getUser } from './services/authService';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import DeviceManagementPage from './pages/admin/DeviceManagementPage';
import './App.css';

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(!!getUser());

  useEffect(() => {
    async function checkAuth() {
      if (getUser()) {
        try {
          await verifyToken();
        } catch (error) {
          console.error("Auth verification failed", error);
        } finally {
          setIsVerifying(false);
        }
      } else {
        setIsVerifying(false);
      }
    }
    checkAuth();
  }, []);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl border border-slate-100">
            <div className="w-8 h-8 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        </div>
        <p className="mt-6 text-slate-500 font-bold text-sm uppercase tracking-widest animate-pulse">
          Đang xác thực phiên làm việc...
        </p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated() ? "/admin/overview" : "/login"} replace />} />
      
      <Route 
        path="/login" 
        element={
          isAuthenticated() ? (
            <Navigate to="/admin/overview" replace />
          ) : (
            <LoginPage 
              onLoginSuccess={() => {
                navigate('/admin/overview');
              }} 
            />
          )
        } 
      />

      {/* Auth public routes */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout onLogout={() => {
              logout();
              navigate('/login');
            }} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/overview" replace />} />
        <Route path="overview" element={<AdminOverviewPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="devices" element={<DeviceManagementPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
