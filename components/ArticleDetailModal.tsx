import React, { useEffect } from 'react';
import type { Article } from '../types';
import { TRANSLATIONS } from '../constants';
import { AdBanner } from './AdBanner';
import { ArticleShareButtons } from './ArticleShareButtons';

interface ArticleDetailModalProps {
    article: Article;
    onClose: () => void;
    translations: typeof TRANSLATIONS.en;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({ article, onClose, translations }) => {
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-[60] flex justify-center items-center p-4"
            aria-labelledby="article-details-title"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 id="article-details-title" className="text-xl font-bold text-gray-800 dark:text-white truncate pr-4">{article.title}</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-2"
                        aria-label="Close modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Main Content */}
                <div className="p-6 space-y-6 overflow-y-auto">
                    <AdBanner className="mb-6" />
                    <div className="prose dark:prose-invert max-w-none">
                        <p>{article.content}</p>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700 space-y-4 flex-shrink-0">
                    <ArticleShareButtons article={article} translations={translations} />
                    <AdBanner />
                </div>
            </div>
        </div>
    );
};