import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import StudentDashboard from './pages/student/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole?: 'student' | 'admin' }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && profile.role !== allowedRole) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/student'} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={profile?.role === 'admin' ? '/admin' : '/student'} replace /> : <Login />} />

      <Route path="/student/*" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/admin/*" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to={user ? (profile?.role === 'admin' ? '/admin' : '/student') : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
