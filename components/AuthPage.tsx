import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { LexiBillLogoIcon, MailIcon, LockIcon, UserIcon as NameIcon, SpinnerIcon } from './icons'; // UserIcon aliased as NameIcon

interface AuthPageProps {
  supabaseClient: SupabaseClient;
  onNavigateToLanding: () => void; // To go back to landing page
}

type AuthMode = 'login' | 'signup';

const AuthPage: React.FC<AuthPageProps> = ({ supabaseClient, onNavigateToLanding }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState(''); // For signup
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setIsLoading(false);
        return;
      }
      if (!fullName.trim()) {
        setError("Full name is required for sign up.");
        setIsLoading(false);
        return;
      }
      const { data, error: signUpError } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName, // Store full name in user metadata
          }
        }
      });
      if (signUpError) {
        setError(signUpError.message);
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        setMessage("Signup successful, but email confirmation might be enabled on your Supabase project and this user is unconfirmed. Please check your Supabase project email settings if login fails.");
        // This case indicates a user was created but might be unconfirmed if email confirmation is on.
        // Supabase default is usually auto-confirm OFF for new projects.
        // If auto-confirm is ON, or if user confirms email, onAuthStateChange in App.tsx will handle login.
      }
       else if (data.user) {
         setMessage("Sign up successful! You should be redirected shortly. If not, please try logging in.");
         // onAuthStateChange in App.tsx should pick this up and navigate to app.
      } else {
        setMessage("Sign up successful. Please check your email to confirm your account if required, then log in.");
      }
    } else { // Login
      const { error: signInError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
      }
      // On successful login, onAuthStateChange in App.tsx will handle redirecting to the app.
    }
    setIsLoading(false);
  };

  const commonInputClasses = "w-full px-4 py-3 rounded-lg bg-[#214a3c] border border-[#2f6a55] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#019863] transition duration-150 ease-in-out";
  const commonLabelClasses = "block text-sm font-medium text-[#8ecdb7] mb-1";

  return (
    <div className="min-h-screen bg-[#10231c] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <LexiBillLogoIcon className="w-16 h-16 mx-auto text-[#8ecdb7] mb-3" />
          <h1 className="text-3xl font-bold text-white">Welcome to LexiBill AI</h1>
          <p className="text-[#8ecdb7] mt-1">Securely access your billing dashboard.</p>
        </div>

        <div className="bg-[#17352b] p-6 sm:p-8 rounded-xl shadow-2xl border border-[#2f6a55]">
          <div className="flex mb-6 border-b border-[#2f6a55]">
            <button
              onClick={() => { setMode('login'); setError(null); setMessage(null); }}
              className={`flex-1 py-3 text-center font-semibold transition-colors duration-150 ${mode === 'login' ? 'text-[#019863] border-b-2 border-[#019863]' : 'text-[#8ecdb7] hover:text-white'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
              className={`flex-1 py-3 text-center font-semibold transition-colors duration-150 ${mode === 'signup' ? 'text-[#019863] border-b-2 border-[#019863]' : 'text-[#8ecdb7] hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          {error && <p className="mb-4 text-center text-red-400 bg-red-900/30 p-3 rounded-md text-sm">{error}</p>}
          {message && <p className="mb-4 text-center text-green-400 bg-green-900/30 p-3 rounded-md text-sm">{message}</p>}

          <form onSubmit={handleAuthAction} className="space-y-5">
            {mode === 'signup' && (
              <div>
                <label htmlFor="fullName" className={commonLabelClasses}>Full Name</label>
                <div className="relative">
                  <NameIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`${commonInputClasses} pl-10`}
                    placeholder="Your Full Name"
                    required
                  />
                </div>
              </div>
            )}
            <div>
              <label htmlFor="email" className={commonLabelClasses}>Email Address</label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${commonInputClasses} pl-10`}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className={commonLabelClasses}>Password</label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${commonInputClasses} pl-10`}
                  placeholder="••••••••"
                  required
                  minLength={mode === 'signup' ? 6 : undefined} // Supabase default min password length
                />
              </div>
               {mode === 'signup' && <p className="text-xs text-gray-400 mt-1">Password should be at least 6 characters.</p>}
            </div>
            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className={commonLabelClasses}>Confirm Password</label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${commonInputClasses} pl-10`}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-[#019863] hover:bg-[#017a50] text-white font-bold py-3 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-70"
            >
              {isLoading ? <SpinnerIcon className="w-5 h-5" /> : (mode === 'login' ? 'Login' : 'Sign Up')}
            </button>
          </form>
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={onNavigateToLanding}
            className="text-sm text-[#8ecdb7] hover:text-white hover:underline transition-colors"
          >
            &larr; Back to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
