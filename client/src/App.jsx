import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Pages imports
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import GuardianDashboard from './pages/GuardianDashboard';
import RouteScreen from './pages/RouteScreen';
import ProfileScreen from './pages/ProfileScreen';

// Protected Route wrapper component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold uppercase tracking-wider">Verifying Session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Role-based Dashboard Switcher
function DashboardSwitcher() {
  const { user } = useAuth();
  
  if (user?.role === 'guardian') {
    return <GuardianDashboard />;
  }
  
  return <UserDashboard />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public paths */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected dashboard paths */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardSwitcher />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/routes" 
              element={
                <ProtectedRoute>
                  <RouteScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfileScreen />
                </ProtectedRoute>
              } 
            />

            {/* Fallback path */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}
