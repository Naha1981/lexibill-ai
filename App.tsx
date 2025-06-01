import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegistrationPage';
import ProtectedRoute from './components/ProtectedRoute';
import { auth } from './services/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { SpinnerIcon } from './components/icons/SpinnerIcon'; // Assuming a spinner icon

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <SpinnerIcon className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <Router>
      <AppRoutes user={user} />
    </Router>
  );
};

// Separate component for routes to use useNavigate
const AppRoutes: React.FC<{ user: User | null }> = ({ user }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (user && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
      navigate('/'); // Redirect to home/dashboard if user is logged in and on login/register page
    }
  }, [user, navigate]);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <RegistrationPage />} />
      <Route element={<ProtectedRoute />}>
        {/* Place all protected routes here */}
        <Route path="/" element={<ChatInterface />} />
        {/* Example: <Route path="/dashboard" element={<Dashboard />} /> */}
      </Route>
      <Route path="/landing" element={<LandingPage onGetStarted={() => navigate(user ? '/' : '/login')} />} />
      {/* Default redirect to landing or main app based on auth */}
      <Route path="*" element={<Navigate to={user ? '/' : '/landing'} />} />
    </Routes>
  );
};

export default App;
