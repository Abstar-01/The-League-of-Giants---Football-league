'use client';

import Image from "next/image";
import { Inter } from "next/font/google";
import { LeagueDataSet } from "@/constant/data";
import TrophyImage from "./Images/trophy.png";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const handleLinkClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <main
      className={`min-h-screen bg-[#0a0c0f] text-[#e6e8ea] font-sans ${inter.className}`}
    >
      <div className="fixed inset-0 bg-gradient-to-br from-[#1a1d23]/30 to-[#0a0c0f]/90 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <section className="h-full mb-20 mt-20 md:mb-20 text-center">
          <div className="flex flex-col items-center justify-center gap-2 text-[#9fb7c9] uppercase tracking-widest text-sm font-medium mb-2">
            <Image src={TrophyImage} alt="Logo" width={250} height={250} />
            <span>the inner circle</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight max-w-6xl mx-auto">
            Welcome to the hub of the <br />
            <span className="font-semibold text-white">
              top 4 greatest football leagues
            </span>
          </h1>

          <p className="text-lg text-[#b0b8c0] mt-4 max-w-xl mx-auto">
            Where passion lives, from the stands to the history books. Built for
            the true fan.
          </p>
        </section>

        <section className="mb-20">
          <div className="flex items-center justify-between mb-6 border-b border-[#262b33] pb-2">
            <h2 className="text-xl font-medium tracking-wide flex items-center gap-2">
              League of Champions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {LeagueDataSet.map((leagueObj, index) => {
              const leagueKey = Object.keys(leagueObj)[0];
              const league = leagueObj[leagueKey as keyof typeof leagueObj];

              const hoverStyles = {
                premierLeague: "hover:bg-[#4B2E83] hover:text-white",
                laLiga: "hover:bg-[#D62828] hover:text-white",
                serieA: "hover:bg-[#006400] hover:text-white",
                bundesliga: "hover:bg-[#E60000] hover:text-white",
              };

              const hoverStyle = hoverStyles[leagueKey as keyof typeof hoverStyles] || "hover:bg-[#2d333d]";

              return (
                <div
                  key={index}
                  className={`bg-white border border-[#2d333d] p-5 rounded-xl transition-all duration-300 ${hoverStyle} group`}
                >
                  <Link 
                    href={`./LeagueInformation?leagueId=${league.id}`} 
                    className="block"
                    onClick={handleLinkClick}
                  >
                    {/* Mobile Layout: Logo above text */}
                    <div className="flex flex-col items-center md:hidden">
                      <div className="relative mb-4">
                        <Image
                          src={league.logo}
                          width={120}
                          height={120}
                          alt={`${league.title} Logo`}
                          className="transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      
                      <div className="text-center">
                        <h3 className="text-2xl font-semibold text-black hover:text-white group-hover:text-white transition-colors duration-300">
                          {league.title}
                        </h3>
                        <p className="text-sm text-[#95a5b8] mt-1 group-hover:text-white/90 transition-colors duration-300">
                          {league.country} · {league.clubs} clubs
                        </p>
                        <div className="mt-4 flex gap-2 text-xs justify-center">
                          <span className="bg-[#20262e] px-3 py-1.5 rounded-full group-hover:bg-black/30 group-hover:text-white transition-all duration-300">
                            since {league.year}
                          </span>
                          <span className="bg-[#20262e] px-3 py-1.5 rounded-full group-hover:bg-black/30 group-hover:text-white transition-all duration-300">
                            {league.UCL} UCL spots
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout: Text left, Logo right */}
                    <div className="hidden md:flex md:flex-row items-center md:items-start gap-4">
                      <div className="text-center md:text-left flex-1">
                        <h3 className="text-2xl font-semibold text-black hover:text-white group-hover:text-white transition-colors duration-300">
                          {league.title}
                        </h3>
                        <p className="text-sm text-[#95a5b8] mt-1 group-hover:text-white/90 transition-colors duration-300">
                          {league.country} · {league.clubs} clubs
                        </p>
                        <div className="mt-4 flex gap-2 text-xs justify-center md:justify-start">
                          <span className="bg-[#20262e] px-3 py-1.5 rounded-full group-hover:bg-black/30 group-hover:text-white transition-all duration-300">
                            since {league.year}
                          </span>
                          <span className="bg-[#20262e] px-3 py-1.5 rounded-full group-hover:bg-black/30 group-hover:text-white transition-all duration-300">
                            {league.UCL} UCL spots
                          </span>
                        </div>
                      </div>

                      <div className="relative">
                        <Image
                          src={league.logo}
                          width={120}
                          height={120}
                          alt={`${league.title} Logo`}
                          className="transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}