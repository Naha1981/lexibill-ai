// src/components/RegistrationPage.tsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from '../services/firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';

const RegistrationPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user && fullName) {
        await updateProfile(userCredential.user, {
          displayName: fullName,
        });
      }
      navigate('/'); // Navigate to home/dashboard
    } catch (err: any) {
      setError(err.message);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/'); // Navigate to home/dashboard (Google sign-up often logs the user in directly)
    } catch (err: any) {
      setError(err.message);
      console.error("Google Sign-Up error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <div style={{ padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'white', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', color: '#1A3A3A', marginBottom: '24px' }}>Create your LexiBill.ai Account</h2>
        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '16px' }}>{error}</p>}
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="fullName" style={{ display: 'block', marginBottom: '8px', color: '#333' }}>Full Name (Optional)</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', color: '#333' }}>Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', color: '#333' }}>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <button
            type="submit"
            style={{ width: '100%', padding: '12px', borderRadius: '4px', border: 'none', backgroundColor: '#00695C', color: 'white', fontSize: '16px', cursor: 'pointer' }}
            disabled={loading || !email || !password}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
          <button
            type="button"
            onClick={handleGoogleSignUp}
            style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white', color: '#333', fontSize: '16px', cursor: 'pointer', marginTop: '16px' }}
            disabled={loading}
          >
            Sign up with Google
          </button>
        </form>
        <p style={{ marginTop: '24px', textAlign: 'center', color: '#555' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#00695C', textDecoration: 'none' }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegistrationPage;
