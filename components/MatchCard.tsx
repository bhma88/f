import React, { useState } from 'react';
import type { Match } from '../types';
import { TRANSLATIONS } from '../constants';
import { DefaultTeamBadgeIcon } from './icons/DefaultTeamBadgeIcon';

interface MatchCardProps {
    match: Match;
    translations: typeof TRANSLATIONS.en;
    onMatchClick: (match: Match) => void;
}

const getLocalTime = (date: string, time: string): string => {
    if (!date || !time) return '';
    try {
        const dateTimeString = `${date}T${time}:00`;
        const eventDate = new Date(dateTimeString);
        if (isNaN(eventDate.getTime())) return time;
        
        return eventDate.toLocaleTimeString(navigator.language, { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        });
    } catch (e) {
        console.error("Failed to parse time:", e);
        return time;
    }
};

const getStatusBadge = (match: Match, translations: typeof TRANSLATIONS.en) => {
    if (match.match_live === '1') {
        return <span className="absolute top-2 right-2 rtl:right-auto rtl:left-2 text-xs font-bold text-white bg-red-600 px-2 py-1 rounded-full animate-pulse">{translations.live} {match.match_status}'</span>;
    }
    switch (match.match_status) {
        case 'Finished':
            return <span className="absolute top-2 right-2 rtl:right-auto rtl:left-2 text-xs font-bold text-gray-100 dark:text-gray-300 bg-gray-500 dark:bg-gray-600 px-2 py-1 rounded-full">{translations.final}</span>;
        case 'Postponed':
            return <span className="absolute top-2 right-2 rtl:right-auto rtl:left-2 text-xs font-bold text-white bg-yellow-600 px-2 py-1 rounded-full">{translations.postponed}</span>;
        default:
            return <span className="absolute top-2 right-2 rtl:right-auto rtl:left-2 text-xs font-bold text-gray-600 dark:text-gray-300">{getLocalTime(match.match_date, match.match_time)}</span>;
    }
};

const TeamDisplay: React.FC<{badgeUrl?: string, name: string, isIsrael: boolean}> = ({ badgeUrl, name, isIsrael }) => {
    const [imgSrc, setImgSrc] = useState(badgeUrl || '');
    
    const handleError = () => {
        setImgSrc(''); // Set to empty to trigger fallback
    };
    
    return (
        <div className="flex-1 flex flex-col items-center space-y-2 px-2">
            {imgSrc ? (
                <img src={imgSrc} alt={`${name} badge`} className="w-12 h-12 md:w-14 md:h-14 object-contain" onError={handleError} />
            ) : (
                <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
                    <DefaultTeamBadgeIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
            )}
            <h3 className="font-semibold text-sm md:text-base text-gray-700 dark:text-gray-200 truncate w-full">{name}</h3>
            {isIsrael && (
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">🇵🇸 Free Palestine</span>
            )}
        </div>
    );
};


export const MatchCard: React.FC<MatchCardProps> = ({ match, translations, onMatchClick }) => {

    const score = (match.match_hometeam_score !== '' && match.match_awayteam_score !== '')
        ? `${match.match_hometeam_score} - ${match.match_awayteam_score}`
        : translations.vs;
    
    const isIsraelTeamInMatch = match.country_name === 'Israel';

    return (
        <button 
            onClick={() => onMatchClick(match)}
            className="w-full text-left bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg dark:hover:shadow-green-500/20 transition-all duration-300 ease-in-out transform hover:-translate-y-1 relative border border-gray-200 dark:border-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
        >
            {getStatusBadge(match, translations)}
            <div className="flex items-center justify-around text-center">
                {/* Home Team */}
                <TeamDisplay 
                    badgeUrl={match.team_home_badge}
                    name={match.match_hometeam_name}
                    isIsrael={isIsraelTeamInMatch}
                />
                
                {/* Score */}
                <div className="px-2 md:px-4">
                    <div className="text-2xl md:text-4xl font-bold tracking-wider text-gray-800 dark:text-gray-100">
                       {score}
                    </div>
                </div>

                {/* Away Team */}
                <TeamDisplay 
                    badgeUrl={match.team_away_badge}
                    name={match.match_awayteam_name}
                    isIsrael={isIsraelTeamInMatch}
                />
            </div>
        </button>
    );
};