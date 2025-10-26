import React, { useState, useEffect } from 'react';
import type { Filters } from '../types';
import { TRANSLATIONS } from '../constants';

interface FilterControlsProps {
    leagues: string[];
    countries: string[];
    filters: Filters;
    onFilterChange: (filters: Filters) => void;
    translations: typeof TRANSLATIONS.en;
}

export const FilterControls: React.FC<FilterControlsProps> = ({ leagues, countries, filters, onFilterChange, translations }) => {
    
    const [currentFilters, setCurrentFilters] = useState<Filters>(filters);

    useEffect(() => {
        setCurrentFilters(filters);
    }, [filters]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newFilters = { ...currentFilters, [name]: value };
        setCurrentFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-center border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="col-span-1">
                <select 
                    name="country"
                    value={currentFilters.country}
                    onChange={handleInputChange}
                    className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                >
                    <option value="">{translations.allCountries}</option>
                    {countries.map(country => <option key={country} value={country}>{country}</option>)}
                </select>
            </div>
             <div className="col-span-1">
                <select 
                    name="league"
                    value={currentFilters.league}
                    onChange={handleInputChange}
                    className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                >
                    <option value="">{translations.allLeagues}</option>
                    {leagues.map(league => <option key={league} value={league}>{league}</option>)}
                </select>
            </div>
             <div className="col-span-1">
                <input 
                    type="text"
                    name="team"
                    value={currentFilters.team}
                    onChange={handleInputChange}
                    placeholder={translations.searchTeamPlaceholder}
                    className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder-gray-500 dark:placeholder-gray-400"
                />
            </div>
        </div>
    );
};