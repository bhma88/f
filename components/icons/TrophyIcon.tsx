import React from 'react';

export const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 011.056-4.301 9.75 9.75 0 0116.888 0A9.75 9.75 0 0116.5 18.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14.25V21" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75v-3.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a2.25 2.25 0 012.25 2.25H9.75A2.25 2.25 0 0112 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 6.75h4.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 10.5c0-2.074 1.676-3.75 3.75-3.75h6c2.074 0 3.75 1.676 3.75 3.75" />
    </svg>
);