
import React from 'react';

const UploadCloudIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M20 16.2A4.5 4.5 0 0 0 15.5 12H14a6 6 0 0 0-12 0H2.5A2.5 2.5 0 0 0 0 14.5V16a1 1 0 0 0 1 1h1.17"/>
    <path d="M7.78 12.01A6.02 6.02 0 0 0 8 12h8a4.5 4.5 0 0 1 .46 8.97"/>
    <path d="M12 12v9"></path>
    <path d="m16 16-4-4-4 4"></path>
    <path d="M22 17a1 1 0 0 0-1-1h-1.17"/>
    <path d="M16.22 19.99A6.02 6.02 0 0 0 16 21H8a6 6 0 0 1-.46-11.97"/>
  </svg>
);

// Simplified version based on common icon libraries for better rendering
const SimplifiedUploadCloudIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);


export default SimplifiedUploadCloudIcon;
