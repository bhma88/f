import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MatchCard } from './components/MatchCard';
import { AdBanner } from './components/AdBanner';
import { LoadingSpinner } from './components/LoadingSpinner';
import { FilterControls } from './components/FilterControls';
import { ArticlesPage } from './components/Articles';
import { MatchDetailModal } from './components/MatchDetailModal';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { QuizzesPage } from './components/QuizzesPage';
import { WorldCupBanner } from './components/WorldCupBanner';
import { BuyMeACoffeeButton } from './components/BuyMeACoffeeButton';
import { fetchMatches } from './services/api';
import type { Language, View, Match, MatchCategory, Filters, Theme, Article } from './types';
import { TRANSLATIONS } from './constants';

const App: React.FC = () => {
    const [language, setLanguage] = useState<Language>(() => {
        const browserLang = navigator.language.split('-')[0];
        return browserLang === 'ar' ? 'ar' : 'en';
    });
    const [view, setView] = useState<View>('home');
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<MatchCategory>('live');
    const [filters, setFilters] = useState<Filters>({ league: '', country: '', team: '' });
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedTheme = window.localStorage.getItem('theme') as Theme;
            if (storedTheme) return storedTheme;
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light';
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    const translations = TRANSLATIONS[language];

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);
    
    // Dynamic SEO Title & Description Effect
    useEffect(() => {
        const pageTitle = view === 'home' ? translations.siteTitle : `${translations[view]} | ${translations.siteTitle}`;
        document.title = pageTitle;

        const metaDescriptionTag = document.querySelector('meta[name="description"]');
        if (metaDescriptionTag) {
            metaDescriptionTag.setAttribute('content', translations.metaDescription);
        }
        
        const ogTitleTag = document.querySelector('meta[property="og:title"]');
        if (ogTitleTag) {
            ogTitleTag.setAttribute('content', pageTitle);
        }

        const ogDescriptionTag = document.querySelector('meta[property="og:description"]');
        if (ogDescriptionTag) {
            ogDescriptionTag.setAttribute('content', translations.metaDescription);
        }

    }, [language, view, translations]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        window.localStorage.setItem('theme', theme);
    }, [theme]);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300); // 300ms debounce delay

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);


    useEffect(() => {
        const getMatches = async () => {
            setLoading(true);
            setError(null);
            
            const to = new Date();
            const from = new Date();
            from.setDate(to.getDate() - 30);
            
            const formatDate = (date: Date) => date.toISOString().split('T')[0];

            const result = await fetchMatches(formatDate(from), formatDate(to));
            if ('error' in result) {
                setError(result.message);
            } else if (Array.isArray(result) && result.length > 0) {
                setMatches(result);
            } else {
                 setError(translations.noMatches);
                 setMatches([]);
            }
            setLoading(false);
        };
        getMatches();
    }, [translations.noMatches]);

    const handleLanguageChange = () => {
        setLanguage(prev => prev === 'en' ? 'ar' : 'en');
    };
    
    const handleThemeChange = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const handleNavClick = (newView: View) => {
        setView(newView);
        window.scrollTo(0, 0);
    };
    
    const handleMatchClick = (match: Match) => {
        setSelectedMatch(match);
    };

    const handleCloseModal = () => {
        setSelectedMatch(null);
    };
    
    const handleArticleClick = (article: Article) => {
        setSelectedArticle(article);
    };

    const handleCloseArticleModal = () => {
        setSelectedArticle(null);
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        if (query.length > 0 && view !== 'articles') {
            handleNavClick('articles');
        }
    }

    const { uniqueLeagues, uniqueCountries } = useMemo(() => {
        const leagues = new Set<string>();
        const countries = new Set<string>();
        matches.forEach(match => {
            leagues.add(match.league_name);
            countries.add(match.country_name);
        });
        return {
            uniqueLeagues: Array.from(leagues).sort(),
            uniqueCountries: Array.from(countries).sort(),
        };
    }, [matches]);

    const categorizedMatches = useMemo(() => {
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
        tenDaysAgo.setHours(0, 0, 0, 0);

        const live = matches.filter(m => m.match_live === '1');
        const finished = matches
            .filter(m => 
                m.match_status === 'Finished' && 
                m.match_live !== '1' &&
                new Date(m.match_date) >= tenDaysAgo
            )
            .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());
        const upcoming = matches.filter(m => m.match_live !== '1' && m.match_status !== 'Finished');
        
        if (live.length === 0 && upcoming.length > 0 && activeCategory === 'live') {
            setActiveCategory('upcoming');
        }
        return { live, upcoming, finished };
    }, [matches, activeCategory]);
    
    const filteredAndGroupedMatches = useMemo(() => {
        let matchesToFilter = categorizedMatches[activeCategory];
        
        const filtered = matchesToFilter.filter(match => {
            const teamSearch = filters.team.toLowerCase();
            return (
                (filters.country === '' || match.country_name === filters.country) &&
                (filters.league === '' || match.league_name === filters.league) &&
                (filters.team === '' || 
                    match.match_hometeam_name.toLowerCase().includes(teamSearch) || 
                    match.match_awayteam_name.toLowerCase().includes(teamSearch)
                )
            );
        });

        return filtered.reduce((acc, match) => {
            const leagueName = match.league_name;
            if (!acc[leagueName]) {
                acc[leagueName] = [];
            }
            acc[leagueName].push(match);
            return acc;
        }, {} as Record<string, Match[]>);

    }, [categorizedMatches, activeCategory, filters]);

    const handleWorldCupClick = useCallback(() => {
        setFilters(prev => ({ ...prev, league: 'World Cup', country: '', team: '' }));
        // Intelligent category selection for World Cup
        const worldCupUpcoming = matches.some(m => m.league_name.toLowerCase().includes('world cup') && m.match_live !== '1' && m.match_status !== 'Finished');
        if (worldCupUpcoming) {
            setActiveCategory('upcoming');
        } else {
            setActiveCategory('finished');
        }
    }, [matches]);


    const renderHomePage = () => {
        if (loading) return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
        if (error) return <div className="text-center text-red-500 dark:text-red-400 py-10">{error}</div>;

        return (
            <>
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        {(['live', 'upcoming', 'finished'] as MatchCategory[]).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-3 text-sm font-semibold rounded-t-md transition-colors duration-200 focus:outline-none ${
                                    activeCategory === cat 
                                    ? 'bg-green-500 text-white' 
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-green-500 hover:text-white dark:hover:bg-green-600'
                                }`}
                            >
                                {translations[`${cat}Matches`]} ({categorizedMatches[cat].length})
                            </button>
                        ))}
                    </div>
                    <WorldCupBanner translations={translations} onClick={handleWorldCupClick} />
                </div>

                <FilterControls 
                    leagues={uniqueLeagues}
                    countries={uniqueCountries}
                    filters={filters}
                    onFilterChange={setFilters}
                    translations={translations}
                />

                {Object.keys(filteredAndGroupedMatches).length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-10">{translations.noMatchesForFilter}</div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(filteredAndGroupedMatches).map(([leagueName, leagueMatches]) => {
                            const isWorldCup = leagueName.toLowerCase().includes('world cup');
                            return (
                                <section key={leagueName} aria-labelledby={`league-title-${leagueName.replace(/\s+/g, '-')}`}>
                                    <h2 
                                        id={`league-title-${leagueName.replace(/\s+/g, '-')}`} 
                                        className={`text-2xl font-bold mb-4 p-3 rounded-lg sticky top-16 z-10 transition-colors ${
                                            isWorldCup ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-800'
                                        }`}
                                    >
                                        {leagueName}
                                    </h2>
                                    <div className="space-y-4">
                                        {leagueMatches.map((match, index) => (
                                            <React.Fragment key={match.match_id}>
                                                <MatchCard match={match} translations={translations} onMatchClick={handleMatchClick} />
                                                {(index + 1) % 5 === 0 && <AdBanner className="my-6" />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </>
        );
    };

    const renderContent = () => {
        switch (view) {
            case 'articles':
                return <ArticlesPage translations={translations} searchQuery={debouncedSearchQuery} onArticleClick={handleArticleClick} />;
            case 'quizzes':
                return <QuizzesPage translations={translations} />;
            case 'privacy':
                return <PrivacyPolicyPage translations={translations} />;
            case 'terms':
                return <TermsOfServicePage translations={translations} />;
            case 'home':
            default:
                return renderHomePage();
        }
    };
    
    return (
        <div className={`min-h-screen flex flex-col ${language === 'ar' ? 'font-cairo' : 'font-inter'}`}>
            <Header
                lang={language}
                translations={translations}
                theme={theme}
                view={view}
                searchQuery={searchQuery}
                onLangChange={handleLanguageChange}
                onThemeChange={handleThemeChange}
                onNavClick={handleNavClick}
                onSearchChange={handleSearchChange}
            />
            <main className="flex-grow container mx-auto px-4 py-8">
                 <div className="lg:flex lg:gap-8">
                    <div className="lg:w-3/4">
                        {renderContent()}
                    </div>
                    <aside className="hidden lg:block lg:w-1/4">
                        <div className="sticky top-24 space-y-8">
                           <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300">{translations.sponsors}</h3>
                           <AdBanner isSidebar={true} />
                           <AdBanner isSidebar={true} />
                        </div>
                    </aside>
                </div>
            </main>
            <Footer lang={language} translations={translations} onNavClick={handleNavClick} />

            {selectedMatch && (
                <MatchDetailModal
                    match={selectedMatch}
                    onClose={handleCloseModal}
                    translations={translations}
                />
            )}
            
            {selectedArticle && (
                <ArticleDetailModal
                    article={selectedArticle}
                    onClose={handleCloseArticleModal}
                    translations={translations}
                />
            )}

            <BuyMeACoffeeButton translations={translations} />
        </div>
    );
};

const PrivacyPolicyPage: React.FC<{translations: typeof TRANSLATIONS.en}> = ({ translations }) => (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg space-y-4 prose dark:prose-invert max-w-none">
        <h1>{translations.privacyPolicy}</h1>
        <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You. We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.</p>
        
        <h2>Interpretation and Definitions</h2>
        <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
        
        <h2>Collecting and Using Your Personal Data</h2>
        <h3>Types of Data Collected</h3>
        <h4>Usage Data</h4>
        <p>Usage Data is collected automatically when using the Service. Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
        
        <h3>Use of Your Personal Data</h3>
        <p>The Company may use Personal Data for the following purposes: to provide and maintain our Service, including to monitor the usage of our Service, to manage Your Account, for the performance of a contract, to contact You, to provide You with news, special offers and general information about other goods, services and events which we offer.</p>

        <h2>Third-Party Services & Advertising</h2>
        <p>Our website uses third-party services, such as Google AdSense, to display advertisements. These services may use cookies to serve ads based on a user's prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet. This helps us monetize the service and keep it free for users. You may opt out of personalized advertising by visiting Ads Settings.</p>
        
        <h2>Solidarity with Palestine</h2>
        <p>For any teams affiliated with Israel, a "🇵🇸 Free Palestine" tag will be displayed. This is an expression of solidarity and is not intended to be a political statement that alienates any user. We believe in peace and human rights for all.</p>
    </div>
);

const TermsOfServicePage: React.FC<{translations: typeof TRANSLATIONS.en}> = ({ translations }) => (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg space-y-4 prose dark:prose-invert max-w-none">
        <h1>{translations.termsOfService}</h1>
        <h2>1. Terms</h2>
        <p>By accessing this website, you are agreeing to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.</p>
        
        <h2>2. Use License</h2>
        <p>Permission is granted to temporarily download one copy of the materials (information or software) on this website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose, or for any public display (commercial or non-commercial); attempt to decompile or reverse engineer any software contained on this website; remove any copyright or other proprietary notations from the materials; or transfer the materials to another person or "mirror" the materials on any other server.</p>
        
        <h2>3. Disclaimer</h2>
        <p>The materials and match data on this website are provided on an 'as is' basis from third-party APIs. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights. Further, we do not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.</p>
        
        <h2>4. Limitations</h2>
        <p>In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website, even if we or an authorized representative has been notified orally or in writing of the possibility of such damage.</p>
        
        <h2>5. Content and Conduct</h2>
        <p>As part of our commitment to social awareness, a "🇵🇸 Free Palestine" tag is displayed for teams from Israel. This reflects our support for human rights. Users are expected to engage respectfully with all content on the site.</p>

        <h2>6. Modifications</h2>
        <p>We may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.</p>
    </div>
);

export default App;