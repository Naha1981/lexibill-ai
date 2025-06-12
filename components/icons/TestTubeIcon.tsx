
import React from 'react';

const TestTubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <path d="M14 2v6h6"></path>
    <path d="M10 14H8"></path>
    <path d="M16 14H8"></path>
    <path d="M10 18H8"></path>
    <path d="M16 18H8"></path>
  </svg>
);
// This SVG is actually more like a file icon, let's try a simplified test tube
const ActualTestTubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
        <path d="M9 14h7"></path>
        <path d="M9 18h4"></path>
        <path d="M14 2v6h6"></path>
    </svg>
);
// A more accurate simple test tube
const BetterTestTubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    {/* The lines below were for a file icon, not a test tube. Let's make a test tube shape. */}
    <path d="M9 9l3-7v16a3 3 0 0 1-6 0V2zM9 9h6"></path> {/* Simplified test tube form */}
  </svg>
);

// Final simplified test tube icon
const FinalTestTubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        <path d="M6 2L6 8"></path>
        <path d="M18 2L18 8"></path>
        <path d="M6 20C6 21.1046 6.89543 22 8 22H16C17.1046 22 18 21.1046 18 20V8H6V20Z"></path>
        <path d="M10 12H14"></path>
        <path d="M10 16H14"></path>
    </svg>
);


export default FinalTestTubeIcon;