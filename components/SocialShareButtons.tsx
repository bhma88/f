import React from 'react';
import type { Match } from '../types';
import { TRANSLATIONS } from '../constants';
import { FacebookIcon } from './icons/FacebookIcon';
import { XIcon } from './icons/XIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

interface SocialShareButtonsProps {
    match: Match;
    translations: typeof TRANSLATIONS.en;
}

export const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({ match, translations }) => {
    const siteUrl = window.location.href;
    const shareText = encodeURIComponent(
        `${match.match_hometeam_name} ${match.match_hometeam_score} - ${match.match_awayteam_score} ${match.match_awayteam_name} - ${translations.siteTitle}`
    );

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${shareText}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(siteUrl)}&text=${shareText}`,
        whatsapp: `https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(siteUrl)}`,
    };

    const socialButtons = [
        { name: 'Facebook', href: shareLinks.facebook, icon: <FacebookIcon className="w-5 h-5" />, color: 'hover:bg-blue-600' },
        { name: 'X', href: shareLinks.twitter, icon: <XIcon className="w-5 h-5" />, color: 'hover:bg-gray-800 dark:hover:bg-gray-200' },
        { name: 'WhatsApp', href: shareLinks.whatsapp, icon: <WhatsAppIcon className="w-5 h-5" />, color: 'hover:bg-green-500' },
    ];

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">{translations.share}:</h4>
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