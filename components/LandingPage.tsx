
import React from 'react';
import { RobotIcon } from './icons'; // Using RobotIcon as a generic tech/AI icon

interface LandingPageProps {
  onNavigateToAuth: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToAuth }) => {
  return (
    <div className="min-h-screen bg-[#10231c] flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="max-w-2xl w-full">
        <header className="mb-12">
          <RobotIcon className="w-24 h-24 mx-auto mb-6 text-[#019863]" />
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Welcome to <span className="text-[#019863]">LexiBill AI</span>
          </h1>
          <p className="text-xl text-[#b2dfdb] max-w-lg mx-auto">
            Streamline your legal billing with AI-powered time logging and narrative generation. All data is stored locally in your browser for your privacy and convenience.
          </p>
        </header>

        <main className="mb-12">
          <button
            onClick={onNavigateToAuth}
            className="px-8 py-4 bg-[#019863] text-white text-lg font-semibold rounded-xl hover:bg-[#017a50] transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#019863] focus:ring-opacity-50 shadow-lg transform hover:scale-105"
            aria-label="Proceed to Login or Setup"
          >
            Access Your Local Dashboard
          </button>
        </main>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-12">
            <div className="bg-[#17352b] p-6 rounded-lg border border-[#2f6a55]">
                <h3 className="text-lg font-semibold text-[#c5e8df] mb-2">Intelligent Time Logging</h3>
                <p className="text-sm text-[#b2dfdb]">Quickly log time entries with smart suggestions and intuitive forms.</p>
            </div>
            <div className="bg-[#17352b] p-6 rounded-lg border border-[#2f6a55]">
                <h3 className="text-lg font-semibold text-[#c5e8df] mb-2">AI Narratives</h3>
                <p className="text-sm text-[#b2dfdb]">Generate professional billing narratives automatically from your task summaries.</p>
            </div>
            <div className="bg-[#17352b] p-6 rounded-lg border border-[#2f6a55]">
                <h3 className="text-lg font-semibold text-[#c5e8df] mb-2">Local & Secure</h3>
                <p className="text-sm text-[#b2dfdb]">Your clients, matters, and time entries stay on your device. No cloud sync, full privacy.</p>
            </div>
        </section>

        <footer className="mt-12">
          <p className="text-xs text-[#8ecdb7]">
            &copy; {new Date().getFullYear()} LexiBill AI. Clarity in Every Bill. Confidence in Every Client.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
