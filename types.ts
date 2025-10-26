export type Language = 'en' | 'ar';

export type View = 'home' | 'privacy' | 'terms' | 'articles' | 'quizzes';

export type MatchCategory = 'live' | 'upcoming' | 'finished';

export type Theme = 'light' | 'dark';

export type Filters = {
    league: string;
    country: string;
    team: string;
};

export interface Article {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    category: string;
}

export interface Question {
    id: number;
    question: string;
    options: string[];
    answer: string;
    explanation: string;
}

export type QuizLevel = 'intermediate' | 'advanced' | 'champion';

export interface Quiz {
    title: string;
    level: QuizLevel;
    questions: Question[];
}

export interface Goalscorer {
    time: string;
    home_scorer: string;
    away_scorer: string;
    score: string;
    info: string;
}

export interface Card {
    time: string;
    home_fault: string;
    card: string;
    away_fault: string;
    info: string;
}

export interface LineupPlayer {
    player: string;
    player_number: string;
    player_country: string | null;
}

export interface Lineups {
    home_team: {
        starting_lineups: LineupPlayer[];
        substitutes: LineupPlayer[];
        coach: LineupPlayer[];
        missing_players: LineupPlayer[];
    };
    away_team: {
        starting_lineups: LineupPlayer[];
        substitutes: LineupPlayer[];
        coach: LineupPlayer[];
        missing_players: LineupPlayer[];
    };
}


export interface Match {
    match_id: string;
    country_id: string;
    country_name: string;
    league_id: string;
    league_name: string;
    match_date: string;
    match_status: string;
    match_time: string;
    match_hometeam_id: string;
    match_hometeam_name: string;
    match_hometeam_score: string;
    match_awayteam_id: string;
    match_awayteam_name: string;
    match_awayteam_score: string;
    match_hometeam_system: string;
    match_awayteam_system: string;
    match_live: string;
    team_home_badge: string;
    team_away_badge: string;
    goalscorer: Goalscorer[];
    cards: Card[];
    lineups: Lineups;
}

export interface ApiError {
    error: number;
    message: string;
}