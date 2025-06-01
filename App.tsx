// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegistrationPage';
import ProtectedRoute from './components/ProtectedRoute';
import { auth } from './services/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { SpinnerIcon } from './components/icons/SpinnerIcon';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
        // This direct navigation might be better handled in AppRoutes if App is not re-rendered by Router context changes
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1A3A3A' }}>
        <SpinnerIcon className="h-12 w-12 text-green-400" />
      </div>
    );
  }

  return (
    <Router>
      <AppRoutes user={user} />
    </Router>
  );
};

// Separate component for routes to use useNavigate and context-sensitive navigation
const AppRoutes: React.FC<{ user: User | null }> = ({ user }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // If user is logged in and tries to access login/register, redirect to home.
    if (user && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
      navigate('/');
    }
    // If user is not logged in and tries to access a protected path (e.g. '/'), ProtectedRoute will handle it.
    // However, direct navigation to '/' when not logged in and not on /landing could also be handled here if needed.
  }, [user, navigate]);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <RegistrationPage />} />
      <Route path="/landing" element={<LandingPage onGetStarted={() => navigate(user ? '/' : '/login')} />} />

      <Route element={<ProtectedRoute />}>
        {/* Protected routes go here */}
        <Route path="/" element={<ChatInterface />} />
        {/* Add other protected routes like /dashboard, /profile etc. here */}
      </Route>

      {/* Fallback route: if user is logged in, go to '/', otherwise go to '/landing' */}
      <Route path="*" element={<Navigate to={user ? '/' : '/landing'} replace />} />
    </Routes>
  );
};

export default App;
