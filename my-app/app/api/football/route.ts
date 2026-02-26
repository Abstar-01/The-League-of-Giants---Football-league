import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leagueCode = searchParams.get('code');
  
  if (!leagueCode) {
    return NextResponse.json({ error: 'League code is required' }, { status: 400 });
  }

  const API_TOKEN = 'd508f3851bc24a3a8a234f4846959660';
  
  // Map of valid league codes
  const validLeagueCodes = ['PL', 'PD', 'SA', 'BL1'];
  
  if (!validLeagueCodes.includes(leagueCode)) {
    return NextResponse.json(
      { error: `Invalid league code: ${leagueCode}. Must be one of: ${validLeagueCodes.join(', ')}` },
      { status: 400 }
    );
  }

  const API_URL = `https://api.football-data.org/v4/competitions/${leagueCode}/teams`;
  
  try {
    console.log('API Route: Fetching from:', API_URL);
    
    const response = await fetch(API_URL, {
      headers: {
        'X-Auth-Token': API_TOKEN
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    console.log('API Route: Response status:', response.status);

    if (!response.ok) {
      // Try to get error details from response
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = JSON.stringify(errorData);
      } catch {
        errorDetails = await response.text();
      }
      
      console.error('API Route: Error response:', errorDetails);
      
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'API key is invalid or has insufficient permissions. Please check your football-data.org API token.' },
          { status: 403 }
        );
      } else if (response.status === 404) {
        return NextResponse.json(
          { error: `League code '${leagueCode}' not found. Please check the competition code.` },
          { status: 404 }
        );
      } else {
        return NextResponse.json(
          { error: `Football API responded with status: ${response.status}. Details: ${errorDetails.substring(0, 200)}` },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    
    // Validate the response structure
    if (!data.teams || !Array.isArray(data.teams)) {
      console.error('API Route: Invalid response structure:', data);
      return NextResponse.json(
        { error: 'Invalid response structure from football API' },
        { status: 500 }
      );
    }
    
    // Return the response with appropriate headers
    return NextResponse.json(data, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch data from football API' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}