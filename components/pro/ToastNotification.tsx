
import React, { useEffect } from 'react';
import { CheckCircleIcon, AlertCircleIcon, InfoIcon, XIcon } from '../icons'; // Added XIcon

interface ToastNotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const bgColor = {
    success: 'bg-green-600 border-green-700',
    error: 'bg-red-600 border-red-700',
    info: 'bg-sky-600 border-sky-700',
  }[type];

  const Icon = {
    success: <CheckCircleIcon className="w-5 h-5 mr-2" />,
    error: <AlertCircleIcon className="w-5 h-5 mr-2" />,
    info: <InfoIcon className="w-5 h-5 mr-2" />,
  }[type];

  return (
    <div 
      className={`fixed top-5 right-5 z-[200] p-4 rounded-lg shadow-2xl text-white text-sm flex items-center border ${bgColor} animate-slide-in-right`}
      role="alert"
      aria-live="assertive"
    >
      {Icon}
      <span>{message}</span>
      <button 
        onClick={onDismiss} 
        className="ml-4 -mr-1 p-1 rounded-full hover:bg-black/20 transition-colors"
        aria-label="Dismiss notification"
      >
        <XIcon className="w-4 h-4" />
      </button>
      {/* The animate-slide-in-right class and its @keyframes definition
          should be defined in a global CSS file or within a <style> tag in index.html.
          Example CSS for animate-slide-in-right:
          @keyframes slide-in-right {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-slide-in-right {
            animation: slide-in-right 0.3s ease-out forwards;
          }
      */}
    </div>
  );
};

export default ToastNotification;
