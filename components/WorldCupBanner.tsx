import React from 'react';
import { TRANSLATIONS } from '../constants';
import { TrophyIcon } from './icons/TrophyIcon';

interface WorldCupBannerProps {
    translations: typeof TRANSLATIONS.en;
    onClick: () => void;
}

export const WorldCupBanner: React.FC<WorldCupBannerProps> = ({ translations, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="flex items-center space-x-2 rtl:space-x-reverse bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:ring-offset-gray-900"
        >
            <TrophyIcon className="w-6 h-6 text-yellow-100" />
            <span className="text-sm">World Cup</span>
        </button>
    );
};