'use client'

import React from 'react';
import Link from 'next/link';

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

interface League {
  code: string;
  name: string;
  url: string;
}

interface ErrorDetails {
  league?: string;
  leagueName?: string;
  status?: number;
  details?: any;
  errorType?: string;
}

export default function ClientLeaguesPage({ 
  initialTeams, 
  initialError,
  leagues 
}: { 
  initialTeams: Team[];
  initialError: string | null;
  leagues: League[];
}) {
  const [currentLeagueIndex, setCurrentLeagueIndex] = React.useState(0);
  const [teams, setTeams] = React.useState<Team[]>(initialTeams);
  const [error, setError] = React.useState<string | null>(initialError);
  const [errorDetails, setErrorDetails] = React.useState<ErrorDetails | null>(null);
  const [loading, setLoading] = React.useState(false);

  const currentLeague = leagues[currentLeagueIndex];

  const nextLeague = () => {
    const newIndex = (currentLeagueIndex + 1) % leagues.length;
    setCurrentLeagueIndex(newIndex);
    fetchLeagueData(leagues[newIndex].code);
  };

  const prevLeague = () => {
    const newIndex = (currentLeagueIndex - 1 + leagues.length) % leagues.length;
    setCurrentLeagueIndex(newIndex);
    fetchLeagueData(leagues[newIndex].code);
  };

  const fetchLeagueData = async (leagueCode: string) => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    
    try {
      console.log('Fetching data for league:', leagueCode);
      
      const response = await fetch(`/api/football?code=${leagueCode}`);
      
      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `API responded with status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          setErrorDetails({
            league: errorData.league,
            leagueName: errorData.leagueName,
            status: errorData.status || response.status,
            details: errorData.details
          });
        } catch {
          // If JSON parsing fails, just use the status text
          errorMessage = `API responded with status: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Only try to parse JSON if response is OK
      const data = await response.json();

      // Validate the response data
      if (!data || !data.teams) {
        throw new Error('Invalid response format: missing teams data');
      }
      
      setTeams(data.teams);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F17] to-[#1a1f2e] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Arrow Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={prevLeague}
              className="p-3 bg-[#1a1d23] hover:bg-[#252a33] rounded-full transition-colors border border-gray-800"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-center">
              <div className="text-2xl font-bold text-white">{currentLeague.name}</div>
              <div className="text-sm text-gray-500">{currentLeague.code}</div>
            </div>

            <button
              onClick={nextLeague}
              className="p-3 bg-[#1a1d23] hover:bg-[#252a33] rounded-full transition-colors border border-gray-800"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F17] to-[#1a1f2e] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Arrow Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={prevLeague}
              className="p-3 bg-[#1a1d23] hover:bg-[#252a33] rounded-full transition-colors border border-gray-800"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-center">
              <div className="text-2xl font-bold text-white">{currentLeague.name}</div>
              <div className="text-sm text-gray-500">{currentLeague.code}</div>
            </div>

            <button
              onClick={nextLeague}
              className="p-3 bg-[#1a1d23] hover:bg-[#252a33] rounded-full transition-colors border border-gray-800"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="bg-red-900/20 border border-red-800 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-red-400 mb-4">Oops! Something went wrong</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            
            {/* Default debug info */}
            <div className="bg-[#252a33] p-4 rounded-lg text-left mt-4">
              <p className="text-gray-400 text-sm font-semibold">Debug Information:</p>
              <p className="text-gray-400 text-xs mt-2">League: {currentLeague.name} ({currentLeague.code})</p>
              <p className="text-gray-400 text-xs">API Route: /api/football?code={currentLeague.code}</p>
              <p className="text-gray-400 text-xs">Token: d508f3851bc24a3a8a234f4846959660 (first 8 chars: d508f385)</p>
              
              <div className="pt-2 mt-2 border-t border-gray-700">
                <p className="text-gray-400 text-xs font-semibold">Quick Test (opens in new tab):</p>
                <a 
                  href={`https://api.football-data.org/v4/competitions/${currentLeague.code}/teams`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 text-xs hover:underline block mt-1"
                >
                  Test API URL directly
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F17] to-[#1a1f2e] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Arrow Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={prevLeague}
              className="p-3 bg-[#1a1d23] hover:bg-[#252a33] rounded-full transition-colors border border-gray-800"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-center">
              <div className="text-2xl font-bold text-white">{currentLeague.name}</div>
              <div className="text-sm text-gray-500">{currentLeague.code}</div>
            </div>

            <button
              onClick={nextLeague}
              className="p-3 bg-[#1a1d23] hover:bg-[#252a33] rounded-full transition-colors border border-gray-800"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-yellow-400 mb-4">No Teams Found</h3>
            <p className="text-gray-300">The API returned no teams for {currentLeague.name}.</p>
          </div>
        </div>
      </div>
    );
  }

  const sortedTeams = teams.sort((a, b) => a.name.localeCompare(b.name));
  
  const firstLetters = ['all', ...Array.from(new Set(sortedTeams.map(team => team.name.charAt(0).toUpperCase())))].sort();

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B0F17] to-[#1a1f2e] py-8 px-4 md:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Arrow Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={prevLeague}
            className="p-3 bg-[#1a1d23] hover:bg-[#252a33] rounded-full transition-colors border border-gray-800 hover:border-blue-500/50"
          >
            <svg className="w-6 h-6 text-gray-400 hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-center">
            <div className="text-2xl font-bold text-white">{currentLeague.name}</div>
            <div className="text-sm text-gray-500">{currentLeague.code}</div>
          </div>

          <button
            onClick={nextLeague}
            className="p-3 bg-[#1a1d23] hover:bg-[#252a33] rounded-full transition-colors border border-gray-800 hover:border-blue-500/50"
          >
            <svg className="w-6 h-6 text-gray-400 hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-[#3b82f6]/10 rounded-full mb-4">
            <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {currentLeague.name} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Clubs</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover all clubs competing in {currentLeague.name}
          </p>
          <div className="flex justify-center gap-4 mt-4 text-sm text-gray-500">
            <span>{teams.length} Clubs</span>
          </div>
        </div>

        <LeagueTeams teams={sortedTeams} firstLetters={firstLetters} />
      </div>
    </main>
  );
}

const LeagueTeams = ({ teams, firstLetters }: { teams: Team[], firstLetters: string[] }) => {
  'use client';
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedLetter, setSelectedLetter] = React.useState('all');

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLetter = selectedLetter === 'all' || team.name.charAt(0).toUpperCase() === selectedLetter;
    return matchesSearch && matchesLetter;
  });

  return (
    <>
      <TeamGrid teams={filteredTeams} />
    </>
  );
};

const TeamGrid = ({ teams }: { teams: Team[] }) => {
  'use client';

  const getTeamLogoUrl = (team: Team) => {
    if (team.crest) return team.crest;
    
    const teamNameSlug = team.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace('fc', '')
      .replace('afc', '')
      .replace('f-c', '')
      .replace('united', '')
      .trim();
    
    return `https://www.footylogos.com/logos/${teamNameSlug}-premier-league.png`;
  };

  if (teams.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-2xl font-bold text-white mb-2">No clubs found</h3>
        <p className="text-gray-400">Try adjusting your search or filter</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {teams.map((team) => (
        <Link
          key={team.id}
          href={`/premier-league/${team.id}`}
          className="group"
        >
          <div className="bg-[#1a1d23] rounded-xl border border-gray-800 overflow-hidden hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 h-full flex flex-col">
            <div className="p-6 bg-gradient-to-br from-[#252a33] to-[#1a1d23] flex justify-center items-center h-48">
              <div className="relative w-32 h-32 transform group-hover:scale-110 transition-transform duration-500">
                <img
                  src={getTeamLogoUrl(team)}
                  alt={`${team.name} crest`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128x128?text=⚽';
                  }}
                />
              </div>
            </div>

            <div className="p-5 border-t border-gray-800 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {team.name}
              </h3>
              
              <div className="space-y-2 text-sm flex-1">
                <div className="flex items-center gap-2 text-gray-400">
                  <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-1.8C18 6.57 15.35 4 12 4s-6 2.57-6 6.2c0 2.34 1.95 5.44 6 9.14 4.05-3.7 6-6.8 6-9.14z"/>
                  </svg>
                  <span className="truncate">{team.venue || 'Venue TBD'}</span>
                </div>
                
                {team.founded > 0 && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                    </svg>
                    <span>Est. {team.founded}</span>
                  </div>
                )}

                {team.clubColors && team.clubColors !== ',' && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {team.clubColors.split('/').map((color, i) => {
                        const cleanColor = color.trim().toLowerCase();
                        return (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full border border-gray-700"
                            style={{ backgroundColor: cleanColor }}
                            title={color.trim()}
                          />
                        );
                      })}
                    </div>
                    <span className="text-gray-400 text-xs truncate">{team.clubColors}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};