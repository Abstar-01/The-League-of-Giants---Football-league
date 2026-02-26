'use server';
import React from 'react';
import ClientFixturesPage from './ClientFixturesPage';
import { LeagueDataSet } from '@/constant/data';

// This is a Server Component
export default async function FixturesPage() {
  // Get the first league (Premier League) ID for initial data
  const premierLeagueId = '4328';
  
  // Fetch initial data on the server
  const initialData = await fetchInitialFixtures(premierLeagueId);
  
  return (
    <ClientFixturesPage 
      initialMatches={initialData.matches}
      initialError={initialData.error}
      leagueData={LeagueDataSet}
    />
  );
}

// League codes mapping
const LEAGUE_CODES: Record<string, string> = {
  '4328': 'PL', // Premier League
  '4335': 'PD', // LaLiga
  '4332': 'SA', // Serie A
  '4331': 'BL1' // Bundesliga
};

async function fetchInitialFixtures(leagueId: string) {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const dateFrom = today.toISOString().split('T')[0];
  const dateTo = nextWeek.toISOString().split('T')[0];
  
  const leagueCode = LEAGUE_CODES[leagueId];
  
  if (!leagueCode) {
    return { 
      matches: [], 
      error: `Invalid league ID: ${leagueId}` 
    };
  }

  const API_TOKEN = process.env.FOOTBALL_API_TOKEN || 'd508f3851bc24a3a8a234f4846959660';
  
  // Increase timeout to 15 seconds (15000ms)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    console.log('Fetching fixtures for league:', leagueCode);
    
    // First, try to fetch competition info to verify API access
    const compResponse = await fetch(`https://api.football-data.org/v4/competitions/${leagueCode}`, {
      headers: {
        'X-Auth-Token': API_TOKEN
      },
      signal: controller.signal
    });

    if (!compResponse.ok) {
      clearTimeout(timeoutId);
      console.error('Competition fetch failed:', compResponse.status);
      
      if (compResponse.status === 403) {
        return { 
          matches: [], 
          error: `API key does not have access to ${getLeagueName(leagueCode)}. The free tier may only have access to Premier League and LaLiga.` 
        };
      }
      
      if (compResponse.status === 429) {
        return { 
          matches: [], 
          error: 'Rate limit exceeded. Please wait a minute and try again.' 
        };
      }
    }

    // Now fetch the matches
    const API_URL = `https://api.football-data.org/v4/competitions/${leagueCode}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
    
    const response = await fetch(API_URL, {
      headers: {
        'X-Auth-Token': API_TOKEN
      },
      signal: controller.signal,
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('Football API error status:', response.status);
      
      if (response.status === 403) {
        return { 
          matches: [], 
          error: `API key does not have access to ${getLeagueName(leagueCode)} matches.` 
        };
      }
      
      if (response.status === 429) {
        return { 
          matches: [], 
          error: 'Rate limit exceeded. Please try again later.' 
        };
      }
      
      return { 
        matches: [], 
        error: `Failed to fetch matches: ${response.status}` 
      };
    }

    const data = await response.json();
    
    if (!data.matches || data.matches.length === 0) {
      return { matches: [], error: null };
    }
    
    // Transform the data to match your Match interface
    const transformedMatches = data.matches.map((match: any) => ({
      idEvent: match.id.toString(),
      strEvent: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      strLeague: getLeagueName(leagueCode),
      strSeason: match.season?.startDate?.substring(0, 4) || '2024',
      strHomeTeam: match.homeTeam.name,
      strAwayTeam: match.awayTeam.name,
      dateEvent: match.utcDate.split('T')[0],
      strTime: match.utcDate.split('T')[1]?.substring(0, 5) || '15:00',
      strVenue: match.venue || 'TBD',
      strHomeTeamBadge: match.homeTeam.crest || `https://crests.football-data.org/${match.homeTeam.id}.png`,
      strAwayTeamBadge: match.awayTeam.crest || `https://crests.football-data.org/${match.awayTeam.id}.png`,
      intRound: match.matchday?.toString() || '1',
      status: match.status,
      score: match.score
    }));

    return { matches: transformedMatches, error: null };
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.error('Request timeout after 15 seconds');
      return { 
        matches: [], 
        error: 'Request timeout. The API is taking too long to respond. Please try again.' 
      };
    }
    
    console.error('Server fetch error:', error);
    return { 
      matches: [], 
      error: error instanceof Error ? error.message : 'Failed to load fixtures' 
    };
  }
}

function getLeagueName(code: string): string {
  const leagueNames: Record<string, string> = {
    'PL': 'Premier League',
    'PD': 'LaLiga',
    'SA': 'Serie A',
    'BL1': 'Bundesliga'
  };
  return leagueNames[code] || code;
}