
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Initialize Firebase
import { app, analytics } from './services/firebaseConfig';
console.log('Firebase Initialized: ', app);
console.log('Analytics Initialized: ', analytics);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
