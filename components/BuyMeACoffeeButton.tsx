import React from 'react';
import { CoffeeIcon } from './icons/CoffeeIcon';
import { TRANSLATIONS } from '../constants';

interface BuyMeACoffeeButtonProps {
    translations: typeof TRANSLATIONS.en;
}

export const BuyMeACoffeeButton: React.FC<BuyMeACoffeeButtonProps> = ({ translations }) => {
    return (
        <a
            href="https://www.paypal.com/paypalme/bourah"
            target="_blank"
            rel="noopener noreferrer"
            title={translations.buyMeACoffee}
            aria-label={translations.buyMeACoffee}
            className="fixed bottom-5 right-5 rtl:right-auto rtl:left-5 z-50 w-16 h-16 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300 ease-in-out"
        >
            <CoffeeIcon className="w-8 h-8" />
        </a>
    );
};