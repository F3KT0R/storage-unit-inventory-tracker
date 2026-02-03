
import React from 'react';

export const QrCodeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V7.5a3 3 0 0 0-3-3H3.75Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 8.25v7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 12h7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12h3.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15h3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 8.25h3" />
  </svg>
);
