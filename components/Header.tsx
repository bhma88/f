import React from 'react';
import { GlobeIcon } from './icons/GlobeIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SearchIcon } from './icons/SearchIcon';
import type { Language, View, Theme } from '../types';
import { TRANSLATIONS } from '../constants';
import { AdBanner } from './AdBanner';

interface HeaderProps {
    lang: Language;
    translations: typeof TRANSLATIONS.en;
    theme: Theme;
    view: View;
    searchQuery: string;
    onLangChange: () => void;
    onThemeChange: () => void;
    onNavClick: (view: View) => void;
    onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, translations, theme, view, searchQuery, onLangChange, onThemeChange, onNavClick, onSearchChange }) => {
    
    const navItems: { view: View; labelKey: keyof typeof translations }[] = [
        { view: 'home', labelKey: 'home' },
        { view: 'articles', labelKey: 'articles' },
        { view: 'quizzes', labelKey: 'quizzes' },
    ];

    return (
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <button onClick={() => onNavClick('home')} className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
                        ⚽ {translations.siteTitle}
                    </button>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
                           {navItems.map(item => (
                               <button 
                                key={item.view}
                                onClick={() => onNavClick(item.view)}
                                className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none ${
                                    view === item.view
                                    ? 'bg-green-500 text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-green-500 hover:text-white dark:hover:bg-green-600'
                                }`}
                               >
                                {translations[item.labelKey]}
                               </button>
                           ))}
                           <div className="relative">
                               <input 
                                   type="text"
                                   value={searchQuery}
                                   onChange={(e) => onSearchChange(e.target.value)}
                                   placeholder={translations.searchArticlesPlaceholder}
                                   className="w-32 lg:w-48 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full py-1.5 px-4 pl-10 rtl:pr-10 rtl:pl-4 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                               />
                               <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-3 rtl:pr-3 pointer-events-none">
                                   <SearchIcon className="w-4 h-4 text-gray-400"/>
                               </div>
                           </div>
                        </nav>
                        <button
                            onClick={onThemeChange}
                            className="p-2 rounded-full text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            aria-label={translations.toggleTheme}
                        >
                            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={onLangChange}
                            className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-full text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            aria-label="Toggle language"
                        >
                            <GlobeIcon className="w-5 h-5" />
                            <span className="text-sm font-semibold">{lang === 'en' ? 'AR' : 'EN'}</span>
                        </button>
                    </div>
                </div>
            </div>
             <div className="bg-gray-100/50 dark:bg-gray-900/50 py-2 flex justify-center">
                <AdBanner />
            </div>
        </header>
    );
};