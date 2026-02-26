// app/leagues/page.tsx
import React from 'react';
import ClientLeaguesPage from './ClientLeaguesPage';

interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  address: string;
  website: string;
  founded: number;
  clubColors: string;
  venue: string;
}

interface ApiResponse {
  teams: Team[];
  competition: {
    name: string;
    code: string;
    emblem: string;
  };
}

// League configuration - now using codes instead of full URLs
const LEAGUES = [
  { code: 'PL', name: 'Premier League' },
  { code: 'PD', name: 'LaLiga' },
  { code: 'SA', name: 'Serie A' },
  { code: 'BL1', name: 'Bundesliga' },
];

async function getLeagueTeams(leagueCode: string) {
  const API_TOKEN = 'd508f3851bc24a3a8a234f4846959660';
  const API_URL = `https://api.football-data.org/v4/competitions/${leagueCode}/teams`;
  
  try {
    console.log('Fetching from:', API_URL);
    
    const response = await fetch(API_URL, {
      headers: {
        'X-Auth-Token': API_TOKEN
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    return { teams: data.teams, error: null };
  } catch (error) {
    console.error('Detailed error:', error);
    return { 
      teams: [], 
      error: error instanceof Error ? error.message : 'Failed to load teams' 
    };
  }
}

export default async function LeaguesPage() {
  // Fetch initial data for Premier League on the server
  const initialResult = await getLeagueTeams('PL');
  
  return (
    <ClientLeaguesPage 
      initialTeams={initialResult.teams}
      initialError={initialResult.error}
      leagues={LEAGUES}
    />
  );
}