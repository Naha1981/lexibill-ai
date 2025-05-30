import React from 'react';

const LexiBillLogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 48 48"
    fill="currentColor" // Allows color control via CSS text color
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="LexiBill AI logo"
    {...props}
  >
    {/* A simple, modern 'L' for LexiBill */}
    <path
      d="M12 10 L12 38 L34 38 L34 30 L20 30 L20 10 L12 10 Z"
    />
  </svg>
);

export default LexiBillLogoIcon;
