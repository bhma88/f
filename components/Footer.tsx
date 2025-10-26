import React from 'react';
import type { Language, View } from '../types';
import { TRANSLATIONS } from '../constants';

interface FooterProps {
    lang: Language;
    translations: typeof TRANSLATIONS.en;
    onNavClick: (view: View) => void;
}

export const Footer: React.FC<FooterProps> = ({ translations, onNavClick }) => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        &copy; {currentYear} {translations.siteTitle}. {translations.allRightsReserved}.
                    </div>
                    <nav className="flex space-x-4 rtl:space-x-reverse text-sm">
                        <button onClick={() => onNavClick('privacy')} className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">{translations.privacyPolicy}</button>
                        <button onClick={() => onNavClick('terms')} className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">{translations.termsOfService}</button>
                    </nav>
                </div>
            </div>
        </footer>
    );
};