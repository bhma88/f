import React from 'react';
import { TRANSLATIONS } from '../constants';
import { FacebookIcon } from './icons/FacebookIcon';
import { XIcon } from './icons/XIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import type { QuizLevel } from '../types';

interface QuizShareButtonsProps {
    score: number;
    total: number;
    level: QuizLevel;
    translations: typeof TRANSLATIONS.en;
}

export const QuizShareButtons: React.FC<QuizShareButtonsProps> = ({ score, total, level, translations }) => {
    const siteUrl = window.location.href;
    const shareText = encodeURIComponent(
        `I scored ${score}/${total} on the ${translations[level]} football quiz! Can you beat my score? Test your knowledge here: `
    );
     const shareTextAr = encodeURIComponent(
        `لقد حصلت على ${score}/${total} في اختبار كرة القدم مستوى ${translations[level]}! هل يمكنك التغلب على نتيجتي؟ اختبر معلوماتك هنا: `
    );
    const textToUse = document.documentElement.lang === 'ar' ? shareTextAr : shareText;


    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${textToUse}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(siteUrl)}&text=${textToUse}`,
        whatsapp: `https://api.whatsapp.com/send?text=${textToUse}%20${encodeURIComponent(siteUrl)}`,
        instagram: `https://www.instagram.com`, // Instagram doesn't allow pre-filled text
    };

    const socialButtons = [
        { name: 'Facebook', href: shareLinks.facebook, icon: <FacebookIcon className="w-5 h-5" />, color: 'hover:bg-blue-600' },
        { name: 'X', href: shareLinks.twitter, icon: <XIcon className="w-5 h-5" />, color: 'hover:bg-gray-800 dark:hover:bg-gray-200' },
        { name: 'WhatsApp', href: shareLinks.whatsapp, icon: <WhatsAppIcon className="w-5 h-5" />, color: 'hover:bg-green-500' },
        { name: 'Instagram', href: shareLinks.instagram, icon: <InstagramIcon className="w-5 h-5" />, color: 'hover:bg-pink-500' },
    ];

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">{translations.shareResult}:</h4>
            <div className="flex items-center gap-2">
                {socialButtons.map(social => (
                    <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Share on ${social.name}`}
                        className={`flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white transition-colors ${social.color} hover:text-white dark:hover:text-gray-900`}
                    >
                        {social.icon}
                    </a>
                ))}
            </div>
        </div>
    );
};
