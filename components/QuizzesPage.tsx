import React, { useState, useMemo, useEffect } from 'react';
import { QUIZZES, TRANSLATIONS } from '../constants';
import type { Language, QuizLevel, Question } from '../types';
import { QuizShareButtons } from './QuizShareButtons';
import { AdBanner } from './AdBanner';

let audioContext: AudioContext | null = null;
const getAudioContext = () => {
    if (typeof window !== 'undefined' && !audioContext) {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser");
        }
    }
    return audioContext;
};

const playSound = (type: 'tick' | 'correct' | 'incorrect') => {
    const context = getAudioContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    gainNode.gain.setValueAtTime(0, context.currentTime);

    if (type === 'tick') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1000, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.03, context.currentTime + 0.05);
    } else if (type === 'correct') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
        gainNode.gain.exponentialRampToValueAtTime(0.1, context.currentTime + 0.05);
    } else { // incorrect
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(164.81, context.currentTime); // E3
        gainNode.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.05);
    }

    oscillator.start(context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.1);
    oscillator.stop(context.currentTime + 0.1);
};


interface QuizzesPageProps {
    translations: typeof TRANSLATIONS.en;
}

export const QuizzesPage: React.FC<QuizzesPageProps> = ({ translations }) => {
    const lang = document.documentElement.lang as Language;
    const quizzes = QUIZZES[lang] || QUIZZES.en;

    const [selectedLevel, setSelectedLevel] = useState<QuizLevel | null>(null);
    const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [timer, setTimer] = useState(6);

    const currentQuiz = useMemo(() => {
        return quizzes.find(q => q.level === selectedLevel);
    }, [selectedLevel, quizzes]);

    const currentQuestion: Question | undefined = activeQuestions[currentQuestionIndex];
    const isQuizFinished = currentQuiz && currentQuestionIndex >= activeQuestions.length && activeQuestions.length > 0;

    useEffect(() => {
        if (selectedLevel && !isAnswered && !isQuizFinished) {
            const interval = setInterval(() => {
                setTimer(prev => {
                    if (prev > 1) {
                        playSound('tick');
                        return prev - 1;
                    }
                    // Time's up
                    handleNextQuestion();
                    return 6;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [selectedLevel, isAnswered, isQuizFinished, currentQuestionIndex]);

    const handleLevelSelect = (level: QuizLevel) => {
        const quizData = quizzes.find(q => q.level === level);
        if (!quizData) return;

        // Get seen questions from localStorage
        const seenQuestionsKey = `seen_questions_${level}`;
        let seenIds: number[] = JSON.parse(localStorage.getItem(seenQuestionsKey) || '[]');

        // Filter out seen questions
        let availableQuestions = quizData.questions.filter(q => !seenIds.includes(q.id));

        // If not enough questions left, reset seen questions for this level
        if (availableQuestions.length < 5) {
            seenIds = [];
            localStorage.setItem(seenQuestionsKey, '[]');
            availableQuestions = quizData.questions;
        }

        // Shuffle and pick 5
        const shuffled = availableQuestions.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, 5);
        
        setActiveQuestions(selectedQuestions);
        setSelectedLevel(level);
        setCurrentQuestionIndex(0);
        setScore(0);
        setIsAnswered(false);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setTimer(6);
    };
    
    const handleAnswerSelect = (option: string) => {
        if (isAnswered || !currentQuestion) return;
        
        setSelectedAnswer(option);
        setIsAnswered(true);
        if (option === currentQuestion.answer) {
            setScore(prev => prev + 1);
            playSound('correct');
        } else {
            playSound('incorrect');
        }

        // Add to localStorage
        if (selectedLevel) {
            const seenQuestionsKey = `seen_questions_${selectedLevel}`;
            const seenIds: number[] = JSON.parse(localStorage.getItem(seenQuestionsKey) || '[]');
            if (!seenIds.includes(currentQuestion.id)) {
                seenIds.push(currentQuestion.id);
                localStorage.setItem(seenQuestionsKey, JSON.stringify(seenIds));
            }
        }
        
        setShowExplanation(true);
    };
    
    const handleNextQuestion = () => {
        setIsAnswered(false);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setTimer(6);
        setCurrentQuestionIndex(prev => prev + 1);
    };

    const handleRestart = (backToLevels: boolean = false) => {
        if (backToLevels) {
            setSelectedLevel(null);
            setActiveQuestions([]);
        } else if (selectedLevel) {
            // Get a new set of questions for the same level
            handleLevelSelect(selectedLevel);
            return;
        }
        // Reset state for "Back to Levels"
        setCurrentQuestionIndex(0);
        setScore(0);
        setIsAnswered(false);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setTimer(6);
    };
    
    if (!selectedLevel || !currentQuiz) {
        return (
            <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{translations.quizTitle}</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8">{translations.quizIntro}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quizzes.map(quiz => (
                        <button 
                            key={quiz.level} 
                            onClick={() => handleLevelSelect(quiz.level)}
                            className="w-full text-lg font-semibold py-4 px-6 rounded-lg text-white bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition-transform transform hover:scale-105"
                        >
                            {translations[quiz.level]}
                        </button>
                    ))}
                </div>
            </div>
        );
    }
    
    if (isQuizFinished) {
        return (
            <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">{translations.yourScore}</h2>
                <p className="text-5xl font-bold text-green-500 dark:text-green-400 mb-4">{score} / {activeQuestions.length}</p>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                    {translations.quizResult
                        .replace('{score}', score.toString())
                        .replace('{total}', activeQuestions.length.toString())}
                </p>
                <div className="space-y-4">
                    <QuizShareButtons score={score} total={activeQuestions.length} level={selectedLevel} translations={translations} />
                    <AdBanner className="my-4"/>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => handleRestart()} className="font-semibold py-2 px-6 rounded-lg text-white bg-green-500 hover:bg-green-600 transition-colors">
                            {translations.playAgain}
                        </button>
                         <button onClick={() => handleRestart(true)} className="font-semibold py-2 px-6 rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            {translations.backToLevels}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
         <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            {/* Header: Progress & Timer */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">{currentQuiz.title}</span>
                    <span className="font-bold text-lg text-green-500">{timer}s</span>
                    <span className="font-semibold">Question {currentQuestionIndex + 1}/{activeQuestions.length}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%` }}></div>
                </div>
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">{currentQuestion?.question}</h2>
            
            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {currentQuestion?.options.map(option => {
                    const isCorrect = option === currentQuestion.answer;
                    const isSelected = option === selectedAnswer;
                    let buttonClass = 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600';
                    if (isAnswered) {
                        if (isCorrect) {
                            buttonClass = 'bg-green-500 text-white animate-pulse';
                        } else if (isSelected) {
                            buttonClass = 'bg-red-500 text-white';
                        }
                    }

                    return (
                        <button 
                            key={option} 
                            onClick={() => handleAnswerSelect(option)}
                            disabled={isAnswered}
                            className={`w-full text-left font-semibold py-3 px-5 rounded-lg transition-colors duration-300 ${buttonClass}`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
            
            {/* Explanation and Next Button */}
             {isAnswered && (
                <div className="text-center mt-6 p-4 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-lg animate-fade-in">
                    {showExplanation && (
                        <>
                            <AdBanner className="mb-4" />
                            <p className="text-gray-700 dark:text-gray-200 mb-4">{currentQuestion?.explanation}</p>
                        </>
                    )}
                    <button 
                        onClick={handleNextQuestion}
                        className="font-bold py-2 px-8 rounded-lg text-white bg-green-500 hover:bg-green-600 transition-colors"
                    >
                        {translations.nextQuestion}
                    </button>
                </div>
            )}
        </div>
    );
};