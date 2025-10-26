import React from 'react';
import { TRANSLATIONS } from '../constants';

interface AdBannerProps {
    className?: string;
    isSidebar?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({ className = '', isSidebar = false }) => {
    const dimensions = isSidebar ? 'w-full h-64 md:h-96' : 'w-full max-w-4xl h-24';
    
    return (
        <div className={`flex items-center justify-center bg-gray-200/50 dark:bg-gray-700/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg ${dimensions} ${className}`}>
            <span className="text-gray-400 dark:text-gray-500 font-semibold">{TRANSLATIONS.en.advertisement} / {TRANSLATIONS.ar.advertisement}</span>
        </div>
    );
};