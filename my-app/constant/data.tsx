// app/constant/data.tsx

import premierLeagueLogo from "@/app/images/League Logos/premier league logo.png";
import laLigaLogo from "@/app/images/League Logos/laliga logo.png";
import serieALogo from "@/app/images/League Logos/serieA logo.png";
import bundesligaLogo from "@/app/images/League Logos/bundesliga logo.png";

export const LeagueDataSet = [
  {
    premierLeague: {
      id: "4328",
      logo: premierLeagueLogo,
      title: "Premier League",
      country: "England",
      clubs: 20,
      year: 1992,
      UCL: 5,
      hoverColor: '#4B2E83',
    },
  },
  {
    laLiga: {
      id: "4335", 
      logo: laLigaLogo,
      title: "LaLiga",
      country: "Spain",
      clubs: 20,
      year: 1929,
      UCL: 4,
      hoverColor: '#D62828',
    },
  },
  {
    serieA: {
      id: "4332",
      logo: serieALogo,
      title: "Serie A",
      country: "Italy",
      clubs: 20,
      year: 1898,
      UCL: 4,
      hoverColor: '#006400',
    },
  },
  {
    bundesliga: {
      id: "4331",
      logo: bundesligaLogo,
      title: "Bundesliga",
      country: "Germany",
      clubs: 18,
      year: 1963,
      UCL: 4,
      hoverColor: '#E60000',
    },
  },
];