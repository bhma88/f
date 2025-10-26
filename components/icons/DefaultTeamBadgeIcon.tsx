import React from 'react';

export const DefaultTeamBadgeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor" {...props}>
        <path d="M50,5 C25.2,5 5,25.2 5,50 C5,74.8 25.2,95 50,95 C74.8,95 95,74.8 95,50 C95,25.2 74.8,5 50,5 Z M50,15 C69.3,15 85,30.7 85,50 C85,69.3 69.3,85 50,85 C30.7,85 15,69.3 15,50 C15,30.7 30.7,15 50,15 Z" opacity="0.1" />
        <path d="M50 20c-16.57 0-30 13.43-30 30s13.43 30 30 30 30-13.43 30-30-13.43-30-30-30zm-15 15h11.25l-7.5 22.5h11.25l-3.75 11.25 18.75-26.25h-11.25l7.5-22.5h-11.25l3.75-11.25-18.75 26.25z" opacity="0.2"/>
    </svg>
);