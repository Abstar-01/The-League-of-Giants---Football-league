'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { LeagueDataSet } from '@/constant/data';

interface League {
  idLeague: string;
  strSport: string;
  strLeague: string;
  strLeagueAlternate: string;
  strCurrentSeason: string;
  intFormedYear: string;
  dateFirstEvent: string;
  strCountry: string;
  strGender: string;
  strWebsite: string;
  strFacebook: string;
  strInstagram: string;
  strTwitter: string;
  strYoutube: string;
  strDescriptionEN: string;
}

interface TeamStanding {
  idStanding: string;
  intRank: string;
  idTeam: string;
  strTeam: string;
  strBadge: string;
  strSeason: string;
  strForm: string;
  strDescription: string;
  intPlayed: string;
  intWin: string;
  intLoss: string;
  intDraw: string;
  intGoalsFor: string;
  intGoalsAgainst: string;
  intGoalDifference: string;
  intPoints: string;
}

const AVAILABLE_SEASONS = [
  "2025-2026",
  "2024-2025",
  "2023-2024",
  "2022-2023", 
  "2021-2022",
  "2020-2021",
  "2019-2020",
  "2018-2019",
  "2017-2018",
  "2016-2017"
];

const findLeagueById = (id: string) => {
  for (const leagueObj of LeagueDataSet) {
    const leagueKey = Object.keys(leagueObj)[0];
    const league = leagueObj[leagueKey as keyof typeof leagueObj];
    if (league.id === id) {
      return league;
    }
  }
  return null;
};

const leagueColors: { [key: string]: { from: string; to: string } } = {
  "4328": { from: "#4B2E83", to: "#1a1d23" },
  "4335": { from: "#D62828", to: "#1a1d23" },
  "4332": { from: "#006400", to: "#1a1d23" },
  "4331": { from: "#E60000", to: "#1a1d23" },
};

export default function LeagueInformation() {
  const searchParams = useSearchParams();
  const leagueId = searchParams.get('leagueId') || "4328";
  
  const [league, setLeague] = useState<League | null>(null);
  const [tableData, setTableData] = useState<TeamStanding[] | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(AVAILABLE_SEASONS[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const localLeagueData = findLeagueById(leagueId);

  const gradientColors = leagueColors[leagueId] || { from: "#3b82f6", to: "#1a1d23" };

  useEffect(() => {
    async function fetchLeagueInfo() {
      setLoading(true);
      try {
        const res = await fetch(`https://www.thesportsdb.com/api/v1/json/123/lookupleague.php?id=${leagueId}`);
        if (!res.ok) throw new Error('Failed to fetch league data');
        const data = await res.json();
        setLeague(data.leagues?.[0] || null);
      } catch (err) {
        setError('Failed to load league information');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeagueInfo();
  }, [leagueId]);

  useEffect(() => {
    async function fetchLeagueTable() {
      setLoading(true);
      try {
        const res = await fetch(`https://www.thesportsdb.com/api/v1/json/123/lookuptable.php?l=${leagueId}&s=${selectedSeason}`);
        if (!res.ok) throw new Error('Failed to fetch table data');
        const data = await res.json();
        setTableData(data.table || null);
      } catch (err) {
        console.error(err);
        setTableData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchLeagueTable();
  }, [leagueId, selectedSeason]);

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeason(e.target.value);
  };

  if (loading && !league) {
    return (
      <div className="min-h-screen bg-[#0a0c0f] text-[#e6e8ea] font-sans flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-gray-600 border-t-blue-500 mb-4"></div>
          <p className="text-gray-400 text-sm sm:text-base">Loading league information...</p>
        </div>
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className="min-h-screen bg-[#0a0c0f] text-[#e6e8ea] font-sans flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl text-red-400 mb-4">{error || 'Unable to load league information'}</h1>
          <p className="text-gray-400 text-sm sm:text-base">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c0f] text-[#e6e8ea] font-sans">
      {/* Header Section - Responsive */}
      <div 
        className="relative py-8 sm:py-12 md:py-16 px-4"
        style={{
          background: `${gradientColors.from}, ${gradientColors.to})`
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col justify-center sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Logo with conditional white background for Premier League */}
            {localLeagueData?.logo && (
              <div className={`flex-shrink-0 ${leagueId === "4328" ? 'bg-white rounded-full p-2 sm:p-3' : ''}`}>
                <Image
                  src={localLeagueData.logo}
                  alt={`${league.strLeague} Logo`}
                  width={250}
                  height={250}
                  className="object-contain w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-60 lg:h-60"
                />
              </div>
            )}
            
            <div className="text-center mt-15 sm:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                {league.strLeague}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 mt-1">{league.strLeagueAlternate}</p>
              
              {/* Stats Tags - Responsive */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6">
                <span className="bg-black/30 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm border border-white/10">
                  🏆 Founded: {league.intFormedYear}
                </span>
                
                <span className="bg-black/30 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm border border-white/10">
                  ⚽ Current Season: {league.strCurrentSeason}
                </span>
                
                <span className="bg-black/30 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm border border-white/10">
                  🌍 Country: {league.strCountry}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* About Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1a1d23] rounded-xl p-4 sm:p-6 border border-gray-800">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4" style={{ color: gradientColors.from }}>
                About the League
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {league.strDescriptionEN}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar - Quick Facts & Connect */}
          <div className="space-y-6">
            {/* Quick Facts */}
            <div className="bg-[#1a1d23] rounded-xl p-4 sm:p-6 border border-gray-800">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: gradientColors.from }}>
                Quick Facts
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <FactItem label="First Event" value={league.dateFirstEvent} />
                <FactItem label="Sport" value={league.strSport} />
                <FactItem label="Gender" value={league.strGender} />
                <FactItem label="League ID" value={league.idLeague} />
              </div>
            </div>

            {/* Connect Section */}
            <div className="bg-[#1a1d23] rounded-xl p-4 sm:p-6 border border-gray-800">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: gradientColors.from }}>
                Connect
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {league.strWebsite && (
                  <SocialLink href={`https://${league.strWebsite}`} label="Official Website" icon="🌐" />
                )}
                {league.strTwitter && (
                  <SocialLink href={`https://${league.strTwitter}`} label="Twitter/X" icon="🐦" />
                )}
                {league.strFacebook && (
                  <SocialLink href={`https://${league.strFacebook}`} label="Facebook" icon="📘" />
                )}
                {league.strInstagram && (
                  <SocialLink href={`https://${league.strInstagram}`} label="Instagram" icon="📷" />
                )}
                {league.strYoutube && (
                  <SocialLink href={`https://${league.strYoutube}`} label="YouTube" icon="▶️" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* League Table Section - Responsive */}
        <div className="mt-8 sm:mt-12">
          <div className="bg-[#1a1d23] rounded-xl p-4 sm:p-6 border border-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
              <h2 className="text-xl sm:text-2xl font-semibold" style={{ color: gradientColors.from }}>
                League Standings
              </h2>
              
              {/* Season Selector */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label htmlFor="season" className="text-xs sm:text-sm text-gray-400">Season:</label>
                <select
                  id="season"
                  className="bg-[#252a33] text-white text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 w-full sm:w-auto"
                  value={selectedSeason}
                  onChange={handleSeasonChange}
                >
                  {AVAILABLE_SEASONS.map(season => (
                    <option key={season} value={season}>{season}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-6 sm:py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-4 border-gray-600 border-t-blue-500"></div>
                <p className="text-gray-400 text-sm sm:text-base mt-2">Loading standings...</p>
              </div>
            ) : tableData && tableData.length > 0 ? (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-2 sm:py-3 px-1 sm:px-2 text-gray-400 font-medium">Pos</th>
                          <th className="text-left py-2 sm:py-3 px-1 sm:px-2 text-gray-400 font-medium">Team</th>
                          <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-gray-400 font-medium">P</th>
                          <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-gray-400 font-medium">W</th>
                          <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-gray-400 font-medium">D</th>
                          <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-gray-400 font-medium">L</th>
                          <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-gray-400 font-medium">GF</th>
                          <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-gray-400 font-medium">GA</th>
                          <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-gray-400 font-medium">GD</th>
                          <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-gray-400 font-medium">Pts</th>
                          <th className="text-center py-2 sm:py-3 px-1 sm:px-2 text-gray-400 font-medium">Form</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((team) => (
                          <tr key={team.idStanding} className="border-b border-gray-800 hover:bg-[#252a33] transition-colors">
                            <td className="py-2 sm:py-3 px-1 sm:px-2 font-medium">{team.intRank}</td>
                            <td className="py-2 sm:py-3 px-1 sm:px-2">
                              <div className="flex items-center gap-1 sm:gap-2">
                                {team.strBadge && (
                                  <img 
                                    src={team.strBadge} 
                                    alt={team.strTeam}
                                    className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                )}
                                <span className="font-medium text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">
                                  {team.strTeam}
                                </span>
                              </div>
                            </td>
                            <td className="text-center py-2 sm:py-3 px-1 sm:px-2">{team.intPlayed}</td>
                            <td className="text-center py-2 sm:py-3 px-1 sm:px-2">{team.intWin}</td>
                            <td className="text-center py-2 sm:py-3 px-1 sm:px-2">{team.intDraw}</td>
                            <td className="text-center py-2 sm:py-3 px-1 sm:px-2">{team.intLoss}</td>
                            <td className="text-center py-2 sm:py-3 px-1 sm:px-2">{team.intGoalsFor}</td>
                            <td className="text-center py-2 sm:py-3 px-1 sm:px-2">{team.intGoalsAgainst}</td>
                            <td className="text-center py-2 sm:py-3 px-1 sm:px-2 font-medium">{team.intGoalDifference}</td>
                            <td className="text-center py-2 sm:py-3 px-1 sm:px-2 font-bold text-blue-400">{team.intPoints}</td>
                            <td className="text-center py-2 sm:py-3 px-1 sm:px-2">
                              <div className="flex justify-center gap-0.5 sm:gap-1">
                                {team.strForm?.split('').map((result, idx) => (
                                  <span
                                    key={idx}
                                    className={`inline-block w-3 h-3 sm:w-4 sm:h-4 text-[8px] sm:text-xs leading-3 sm:leading-4 rounded-full ${
                                      result === 'W' ? 'bg-green-600' :
                                      result === 'D' ? 'bg-yellow-600' :
                                      result === 'L' ? 'bg-red-600' :
                                      'bg-gray-600'
                                    }`}
                                  >
                                    {result}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-400 text-sm sm:text-base py-6 sm:py-8">No table data available for this season</p>
            )}

            {/* Table Legend - Responsive */}
            <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-400 flex flex-wrap gap-3 sm:gap-4">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-600"></span>
                <span className="text-xs">Win</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-600"></span>
                <span className="text-xs">Draw</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-600"></span>
                <span className="text-xs">Loss</span>
              </div>
              <div className="hidden lg:block lg:ml-auto">
                <span className="text-gray-500 text-xs">P: Played, W: Wins, D: Draws, L: Losses, GF: Goals For, GA: Goals Against, GD: Goal Difference, Pts: Points</span>
              </div>
            </div>
            {/* Mobile Legend - Shows on smaller screens */}
            <div className="lg:hidden mt-2 text-center text-gray-500 text-xs">
              <span>P: Played, W: Wins, D: Draws, L: Losses, GF: Goals For, GA: Goals Against, GD: Goal Difference, Pts: Points</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components - Responsive
function FactItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 sm:py-2 border-b border-gray-800 last:border-0">
      <span className="text-gray-400 text-xs sm:text-sm">{label}:</span>
      <span className="text-white font-medium text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">{value}</span>
    </div>
  );
}

function SocialLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg bg-[#252a33] hover:bg-[#2f3540] transition-colors duration-200"
    >
      <span className="text-base sm:text-xl">{icon}</span>
      <span className="flex-1 text-gray-300 text-xs sm:text-sm">{label}</span>
      <span className="text-gray-500 text-xs sm:text-sm">↗</span>
    </a>
  );
}