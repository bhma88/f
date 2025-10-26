import { API_BASE_URL, FOOTBALL_API_KEY } from '../constants';
import type { Match, ApiError } from '../types';

export async function fetchMatches(from: string, to: string): Promise<Match[] | ApiError> {
    // FIX: Removed comparison to 'YOUR_API_KEY_HERE' which was causing a type error
    // because FOOTBALL_API_KEY is a constant with a different value.
    if (!FOOTBALL_API_KEY) {
        return { error: 500, message: "API Key not found. Please add your API key in constants.ts" };
    }
    
    const url = `${API_BASE_URL}?action=get_events&from=${from}&to=${to}&APIkey=${FOOTBALL_API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // The API returns an error object inside a successful 200 response
        if (data.error) {
            return data as ApiError;
        }

        // The API can return an empty array, which is valid, but we handle it upstream.
        return data as Match[];
    } catch (error) {
        console.error("Failed to fetch matches:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { error: 500, message: `Failed to fetch data: ${errorMessage}` };
    }
}