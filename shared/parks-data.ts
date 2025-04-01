import { InsertPark } from "@shared/schema";
import { storage } from "../server/storage";
import { fetchWikipediaParks } from './fetch-wiki-parks';

// ELO calculation function shared between client and server
export function calculateElo(
  winnerRating: number,
  loserRating: number,
  kFactor: number = 32
): { winnerNewElo: number; loserNewElo: number; pointsExchanged: number } {
  // Calculate expected scores (probability of winning)
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));
  
  // Calculate rating changes
  const winnerChange = Math.round(kFactor * (1 - expectedWinner));
  const loserChange = Math.round(kFactor * (0 - expectedLoser));
  
  // Calculate new ratings
  const winnerNewElo = winnerRating + winnerChange;
  const loserNewElo = loserRating + loserChange;
  
  return {
    winnerNewElo,
    loserNewElo,
    pointsExchanged: winnerChange
  };
}

// Default data in case Wikipedia fetch fails
const defaultParksData: InsertPark[] = [
  {
    name: "Yellowstone",
    state: "Wyoming/Montana/Idaho",
    description: "World's first national park, known for geysers and diverse wildlife.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Yellowstone_River_in_Hayden_Valley_07-10-09_114.jpg/320px-Yellowstone_River_in_Hayden_Valley_07-10-09_114.jpg",
    visitors: 4115000,
    established: 1872,
    size: 2219791,
    tag: "First National Park",
    elo: 1500
  },
  {
    name: "Yosemite",
    state: "California",
    description: "Granite cliffs, waterfalls, giant sequoias, and diverse wildlife.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Tunnel_View%2C_Yosemite_Valley%2C_Yosemite_NP_-_Diliff.jpg/320px-Tunnel_View%2C_Yosemite_Valley%2C_Yosemite_NP_-_Diliff.jpg",
    visitors: 3667550,
    established: 1890,
    size: 759620,
    elo: 1500
  }
];

// Function to initialize parks data in the storage
export async function initializeParksData() {
  try {
    // First check if we already have data
    const response = await fetch('/api/rankings');
    
    // If rankings are already populated, no need to re-initialize
    if (response.ok) {
      const data = await response.json();
      if (data.length > 0) {
        console.log('Parks data already initialized with', data.length, 'parks');
        return;
      }
    }

    console.log('Fetching parks data from Wikipedia...');
    
    // Try to fetch park data from Wikipedia
    let parksData: InsertPark[] = [];
    
    try {
      parksData = await fetchWikipediaParks();
      console.log(`Successfully fetched ${parksData.length} parks from Wikipedia`);
    } catch (error) {
      console.error('Error fetching from Wikipedia, using default data:', error);
      parksData = defaultParksData;
    }
    
    // Initialize parks with the data we got (either from Wikipedia or default)
    if ("initializeParks" in storage && parksData.length > 0) {
      console.log(`Initializing storage with ${parksData.length} parks`);
      (storage as any).initializeParks(parksData);
    } else {
      console.error('Failed to initialize parks data');
    }
  } catch (error) {
    console.error('Error during parks initialization:', error);
  }
}
