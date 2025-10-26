import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { ARTICLES, TRANSLATIONS } from '../constants';
import type { Language, Article } from '../types';
import { AdBanner } from './AdBanner';
import { LoadingSpinner } from './LoadingSpinner';

interface ArticlesPageProps {
    translations: typeof TRANSLATIONS.en;
    searchQuery: string;
    onArticleClick: (article: Article) => void;
}

const ARTICLES_PER_PAGE = 10;

export const ArticlesPage: React.FC<ArticlesPageProps> = ({ translations, searchQuery, onArticleClick }) => {
    const lang = document.documentElement.lang as Language;
    const articlesSource = ARTICLES[lang] || ARTICLES.en;
    
    const [page, setPage] = useState(1);
    const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);

    const filteredArticles = useMemo(() => {
        if (!searchQuery) {
            return articlesSource;
        }
        return articlesSource.filter(article => 
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [articlesSource, searchQuery]);

    const hasMore = displayedArticles.length < filteredArticles.length;

    useEffect(() => {
        // Reset and load first page on search query change
        setPage(1);
        setDisplayedArticles(filteredArticles.slice(0, ARTICLES_PER_PAGE));
    }, [filteredArticles]);

    const loadMoreArticles = useCallback(() => {
        if (loading || !hasMore) return;
        
        setLoading(true);
        setTimeout(() => { // Simulate network delay
            const nextPage = page + 1;
            const newArticles = filteredArticles.slice(0, nextPage * ARTICLES_PER_PAGE);
            setDisplayedArticles(newArticles);
            setPage(nextPage);
            setLoading(false);
        }, 500);
    }, [loading, hasMore, page, filteredArticles]);
    
    const lastArticleElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreArticles();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, loadMoreArticles]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white border-b-2 border-green-500 pb-2">
                {translations.articles}
            </h1>

            {displayedArticles.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {displayedArticles.map((article, index) => {
                            const isLastElement = displayedArticles.length === index + 1;
                            return (
                                <React.Fragment key={article.id}>
                                    <div ref={isLastElement ? lastArticleElementRef : null} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                                        <div>
                                            <span className="text-sm font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-full">
                                               {translations.articleCategory}: {article.category}
                                            </span>
                                            <h2 className="text-2xl font-bold mt-4 mb-2 text-gray-800 dark:text-gray-100">{article.title}</h2>
                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                                {article.excerpt}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onArticleClick(article)}
                                            className="self-start mt-auto font-bold text-green-600 dark:text-green-400 hover:underline"
                                        >
                                            {translations.readMore}
                                        </button>
                                    </div>
                                    {(index + 1) % 4 === 0 && (
                                        <div className="md:col-span-2 my-4">
                                            <AdBanner />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                    {loading && (
                        <div className="flex justify-center items-center h-24">
                            <LoadingSpinner />
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-16">
                    <p className="text-xl text-gray-500 dark:text-gray-400">{translations.noArticlesFound}</p>
                </div>
            )}
        </div>
    );
};