import { NextResponse } from 'next/server';

const API_TOKEN = process.env.FOOTBALL_API_TOKEN || 'd508f3851bc24a3a8a234f4846959660';

// League codes mapping
const LEAGUE_CODES: Record<string, string> = {
  '4328': 'PL', // Premier League
  '4335': 'PD', // LaLiga
  '4332': 'SA', // Serie A
  '4331': 'BL1' // Bundesliga
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    console.log('API Route called with:', { leagueId, dateFrom, dateTo });

    if (!leagueId) {
      return NextResponse.json({ error: 'League ID is required' }, { status: 400 });
    }

    const leagueCode = LEAGUE_CODES[leagueId];
    
    if (!leagueCode) {
      return NextResponse.json({ 
        error: `Invalid league ID: ${leagueId}. Valid IDs: 4328 (PL), 4335 (PD), 4332 (SA), 4331 (BL1)` 
      }, { status: 400 });
    }

    // If no dates provided, get next 7 days
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const fromDate = dateFrom || today.toISOString().split('T')[0];
    const toDate = dateTo || nextWeek.toISOString().split('T')[0];

    // football-data.org API endpoint for matches
    const API_URL = `https://api.football-data.org/v4/competitions/${leagueCode}/matches?dateFrom=${fromDate}&dateTo=${toDate}`;

    console.log(`Fetching from football API:`, API_URL);

    // Increase timeout to 15 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(API_URL, {
      headers: {
        'X-Auth-Token': API_TOKEN
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('Football API response status:', response.status);

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch {
        errorText = 'Could not parse error response';
      }
      
      console.error('Football API error:', errorText);
      
      // Handle specific status codes
      if (response.status === 403) {
        return NextResponse.json(
          { error: `API key does not have access to ${getLeagueName(leagueCode)}. The free tier may only have access to Premier League and LaLiga.` },
          { status: 403 }
        );
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please wait a minute and try again.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: `Football API responded with status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.matches) {
      return NextResponse.json({ matches: [] });
    }
    
    // Transform the data
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

    return NextResponse.json({ 
      matches: transformedMatches,
      leagueCode,
      dateFrom: fromDate,
      dateTo: toDate
    });
    
  } catch (error: any) {
    console.error('API route error:', error);
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout. The football API is taking too long to respond. Please try again.' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch data from football API' },
      { status: 500 }
    );
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