
import React, { useState } from 'react';
import { MailIcon, LockIcon, SpinnerIcon } from './icons';

interface AuthPageProps {
  onLogin: (email: string) => void; 
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and Password are required.");
      setIsLoading(false);
      return;
    }

    // Simulate a short delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));

    // No actual authentication, just proceed with onLogin
    onLogin(email);
    // isLoading will be reset by parent component or page transition
  };

  const commonInputClasses = "w-full px-4 py-3 rounded-lg bg-[#214a3c] border border-[#2f6a55] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#019863] transition duration-150 ease-in-out";
  const commonLabelClasses = "block text-sm font-medium text-[#8ecdb7] mb-1";

  return (
    <div className="min-h-screen bg-[#10231c] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">LexiBill AI</h1>
          <p className="text-[#8ecdb7] mt-1">Access your local billing dashboard.</p>
        </div>

        <div className="bg-[#17352b] p-6 sm:p-8 rounded-xl shadow-2xl border border-[#2f6a55]">
          <h2 className="text-xl font-semibold text-white text-center mb-6">Login</h2>
          
          {error && <p className="mb-4 text-center text-red-400 bg-red-900/30 p-3 rounded-md text-sm">{error}</p>}

          <form onSubmit={handleAuthAction} className="space-y-5">
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
                  aria-label="Email Address"
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
                  aria-label="Password"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-[#019863] hover:bg-[#017a50] text-white font-bold py-3 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-70"
            >
              {isLoading ? <SpinnerIcon className="w-5 h-5" /> : 'Login'}
            </button>
          </form>
        </div>
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            All data is stored locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
