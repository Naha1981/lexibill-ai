
import React from 'react';

const BrainCircuitIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5v.43a4.53 4.53 0 0 0-1.43 8.65 4.5 4.5 0 0 0 0 8.84V22a4.5 4.5 0 0 0 4.5-4.5v-.43a4.53 4.53 0 0 0 1.43-8.65 4.5 4.5 0 0 0 0-8.84z"/>
    <path d="M12 2a4.5 4.5 0 0 1 4.5 4.5v.43a4.53 4.53 0 0 1 1.43 8.65 4.5 4.5 0 0 1 0 8.84V22a4.5 4.5 0 0 1-4.5-4.5v-.43a4.53 4.53 0 0 1-1.43-8.65 4.5 4.5 0 0 1 0-8.84z"/>
    <path d="M19.5 7.5a4.5 4.5 0 0 0-8.65-1.43A4.5 4.5 0 0 0 4.5 7.5"/>
    <path d="M4.5 16.5a4.5 4.5 0 0 0 8.65 1.43A4.5 4.5 0 0 0 19.5 16.5"/>
    <circle cx="12" cy="12" r=".5" fill="currentColor" stroke="none"/>
    <circle cx="16.5" cy="19.5" r=".5" fill="currentColor" stroke="none"/>
    <circle cx="19.5" cy="12" r=".5" fill="currentColor" stroke="none"/>
    <circle cx="16.5" cy="4.5" r=".5" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="19.5" r=".5" fill="currentColor" stroke="none"/>
    <circle cx="7.5" cy="19.5" r=".5" fill="currentColor" stroke="none"/>
    <circle cx="4.5" cy="12" r=".5" fill="currentColor" stroke="none"/>
    <circle cx="7.5" cy="4.5" r=".5" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="4.5" r=".5" fill="currentColor" stroke="none"/>
  </svg>
);

export default BrainCircuitIcon;
