import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { Match } from '../types';
import { TRANSLATIONS } from '../constants';
import { AdBanner } from './AdBanner';
import { SocialShareButtons } from './SocialShareButtons';
import { DefaultTeamBadgeIcon } from './icons/DefaultTeamBadgeIcon';
import { LoadingSpinner } from './LoadingSpinner';

interface MatchDetailModalProps {
    match: Match;
    onClose: () => void;
    translations: typeof TRANSLATIONS.en;
}

const TeamDetailDisplay: React.FC<{badgeUrl?: string, name: string, isIsrael: boolean}> = ({ badgeUrl, name, isIsrael }) => {
    const [imgSrc, setImgSrc] = useState(badgeUrl || '');
    
    const handleError = () => {
        setImgSrc('');
    };

    return (
        <div className="flex-1 flex flex-col items-center space-y-2 px-2">
             {imgSrc ? (
                <img src={imgSrc} alt={`${name} badge`} className="w-16 h-16 object-contain" onError={handleError} />
            ) : (
                <div className="w-16 h-16 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
                    <DefaultTeamBadgeIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
            )}
            <h3 className="font-bold text-lg text-gray-700 dark:text-gray-200">{name}</h3>
            {isIsrael && (
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">🇵🇸 Free Palestine</span>
            )}
        </div>
    );
};

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ match, onClose, translations }) => {
    const [summary, setSummary] = useState('');
    const [isSummaryLoading, setIsSummaryLoading] = useState(true);
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        const generateSummary = async () => {
            if (!match || !process.env.API_KEY) {
                setIsSummaryLoading(false);
                return;
            };
            
            setIsSummaryLoading(true);
            setSummary('');
            
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                
                let prompt = '';
                const home = match.match_hometeam_name;
                const away = match.match_awayteam_name;
                const league = match.league_name;

                if (match.match_live === '1') {
                    prompt = `Generate a very brief, exciting, 3-line summary for the ongoing live football match between ${home} and ${away} in the ${league}. The current score is ${match.match_hometeam_score}-${match.match_awayteam_score} at minute ${match.match_status}'. What is the situation?`;
                } else if (match.match_status === 'Finished') {
                    prompt = `Generate a very brief, insightful, 3-line summary of the completed football match between ${home} and ${away} in the ${league}. The final score was ${match.match_hometeam_score}-${match.match_awayteam_score}.`;
                } else {
                    prompt = `Generate a very brief, enticing, 3-line preview for the upcoming football match between ${home} and ${away} in the ${league}, scheduled for ${match.match_date}.`;
                }

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });

                setSummary(response.text);

            } catch (err) {
                console.error("Error generating match summary:", err);
                setSummary('');
            } finally {
                setIsSummaryLoading(false);
            }
        };

        generateSummary();

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [match]);
    
    const generateModalTitle = () => {
        const home = match.match_hometeam_name;
        const away = match.match_awayteam_name;
        const homeScore = match.match_hometeam_score;
        const awayScore = match.match_awayteam_score;

        if (match.match_live === '1') {
            return `${home} ${homeScore} - ${awayScore} ${away} (${translations.live} ${match.match_status}')`;
        }
        if (match.match_status === 'Finished') {
            return `${home} ${homeScore} - ${awayScore} ${away} (${translations.final})`;
        }
        // For upcoming or other statuses
        return `${home} ${translations.vs} ${away}`;
    };
    
    const generateSummaryTitle = () => {
        const { 
            match_hometeam_name: home, 
            match_awayteam_name: away, 
            match_hometeam_score: homeScore, 
            match_awayteam_score: awayScore,
            match_live,
            match_status
        } = match;

        if (match_live === '1') {
            return translations.liveSummaryTitle
                .replace('{home}', home)
                .replace('{away}', away);
        }
        if (match_status === 'Finished') {
            return translations.finishedSummaryTitle
                .replace('{home}', home)
                .replace('{away}', away)
                .replace('{homeScore}', homeScore)
                .replace('{awayScore}', awayScore);
        }
        return translations.upcomingPreviewTitle
            .replace('{home}', home)
            .replace('{away}', away);
    };


    const modalTitle = generateModalTitle();
    const summaryTitle = generateSummaryTitle();

    const score = (match.match_hometeam_score !== '' && match.match_awayteam_score !== '')
        ? `${match.match_hometeam_score} - ${match.match_awayteam_score}`
        : translations.vs;

    const isIsraelTeamInMatch = match.country_name === 'Israel';

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4"
            aria-labelledby="match-details-title"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10">
                    <h1 id="match-details-title" className="text-2xl font-bold text-gray-800 dark:text-white truncate pr-4">{modalTitle}</h1>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-2"
                        aria-label="Close modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Main Content */}
                <div className="p-6 space-y-6">
                    {/* Score Summary */}
                    <section className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-around text-center">
                            <TeamDetailDisplay 
                                badgeUrl={match.team_home_badge}
                                name={match.match_hometeam_name}
                                isIsrael={isIsraelTeamInMatch}
                            />
                            <div className="px-4">
                                <div className="text-4xl font-bold tracking-wider text-gray-800 dark:text-gray-100">{score}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{match.league_name}</div>
                            </div>
                             <TeamDetailDisplay 
                                badgeUrl={match.team_away_badge}
                                name={match.match_awayteam_name}
                                isIsrael={isIsraelTeamInMatch}
                            />
                        </div>
                    </section>

                    {/* AI Summary */}
                    <section aria-labelledby="ai-summary-title">
                        <h1 id="ai-summary-title" className="text-2xl font-bold text-gray-800 dark:text-white border-b-2 border-green-500 pb-2 mb-4">
                           {summaryTitle}
                        </h1>
                        <AdBanner className="mb-4" />
                        {isSummaryLoading ? (
                            <div className="flex justify-center items-center h-24">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            summary ? (
                                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{summary}</p>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">{translations.noData}</p>
                            )
                        )}
                    </section>

                    {/* Goals */}
                    {match.goalscorer && match.goalscorer.length > 0 && (
                        <section>
                            <h3 className="text-lg font-bold border-b-2 border-green-500 pb-1 mb-3">{translations.goals}</h3>
                            <ul className="space-y-2 text-sm">
                                {match.goalscorer.map((goal, index) => (
                                    <li key={index} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-700/50">
                                        <span className="font-semibold">{goal.time}' - {goal.home_scorer || goal.away_scorer}</span>
                                        <span className="text-lg font-bold">{goal.score}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Cards */}
                    {match.cards && match.cards.length > 0 && (
                        <section>
                            <h3 className="text-lg font-bold border-b-2 border-red-500 pb-1 mb-3">{translations.cards}</h3>
                            <ul className="space-y-2 text-sm">
                                {match.cards.map((card, index) => (
                                    <li key={index} className="flex items-center p-2 rounded bg-gray-50 dark:bg-gray-700/50">
                                        <span className={`w-3 h-4 rounded-sm mr-2 ${card.card === 'yellow card' ? 'bg-yellow-400' : 'bg-red-600'}`}></span>
                                        <span className="font-semibold">{card.time}' - {card.home_fault || card.away_fault}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Lineups */}
                    {match.lineups?.home_team?.starting_lineups?.length > 0 && (
                         <section>
                            <h3 className="text-lg font-bold border-b-2 border-gray-400 dark:border-gray-500 pb-1 mb-3">{translations.lineups}</h3>
                            <div className="grid grid-cols-2 gap-6 text-sm">
                                <div>
                                    <h4 className="font-bold mb-2">{match.match_hometeam_name}</h4>
                                    <ul className="space-y-1">
                                        {match.lineups.home_team.starting_lineups.map(p => <li key={p.player}>{p.player_number}. {p.player}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-2">{match.match_awayteam_name}</h4>
                                     <ul className="space-y-1">
                                        {match.lineups.away_team.starting_lineups.map(p => <li key={p.player}>{p.player_number}. {p.player}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </section>
                    )}
                    
                    {/* Share & Ad */}
                     <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                        <SocialShareButtons match={match} translations={translations} />
                        <AdBanner />
                    </div>
                </div>
            </div>
        </div>
    );
};