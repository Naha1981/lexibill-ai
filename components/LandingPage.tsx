// src/components/LandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { LexiBillLogoIcon } from './icons/LexiBillLogoIcon'; // Assuming this icon exists
import { ReceiptIcon } from './icons/ReceiptIcon'; // Assuming this icon exists

const LandingPage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-green-900 text-white flex flex-col">
      {/* Header */}
      <header className="p-4 md:p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <LexiBillLogoIcon className="h-10 w-auto" />
            <span className="text-2xl font-bold">LexiBill.ai</span>
          </div>
          <nav className="space-x-4 sm:space-x-6 flex items-center">
            <Link to="/login" className="text-sm sm:text-base hover:text-green-300 transition duration-300">
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm sm:text-base bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition duration-300 ease-in-out"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6">
            Intelligent Invoicing with <span className="text-green-400">LexiBill.ai</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-10">
            Streamline your billing process with AI-powered insights, automated invoice generation, and smart financial reporting.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={onGetStarted}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
            >
              Get Started
            </button>
            <button
              onClick={onGetStarted} // Also calls onGetStarted
              className="bg-transparent hover:bg-green-700 text-green-300 font-semibold hover:text-white py-3 px-8 border border-green-400 hover:border-transparent rounded-lg text-lg transition duration-300 ease-in-out w-full sm:w-auto"
            >
              Learn More
            </button>
          </div>
        </div>
      </main>

      {/* Placeholder for Features Section - can be expanded */}
      <section className="py-12 md:py-16 bg-gray-800 bg-opacity-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Why Choose LexiBill.ai?</h2>
          <div className="grid md:grid-cols-3 gap-8 px-4">
            <div className="p-6 bg-gray-700 rounded-lg bg-opacity-70">
              <ReceiptIcon className="h-12 w-12 mx-auto mb-4 text-green-400" /> {/* Assuming ReceiptIcon */}
              <h3 className="text-xl font-semibold mb-2">Automated Invoicing</h3>
              <p className="text-gray-400">Save time with invoices generated and sent automatically.</p>
            </div>
            <div className="p-6 bg-gray-700 rounded-lg bg-opacity-70">
               {/* Placeholder for another icon */}
              <svg className="h-12 w-12 mx-auto mb-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
              <p className="text-gray-400">Gain insights into your cash flow and client billing patterns.</p>
            </div>
            <div className="p-6 bg-gray-700 rounded-lg bg-opacity-70">
               {/* Placeholder for another icon */}
              <svg className="h-12 w-12 mx-auto mb-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-gray-400">Your financial data is protected with top-tier security.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} LexiBill.ai. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;