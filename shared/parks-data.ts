import { InsertPark } from "@shared/schema";
import { storage } from "../server/storage";

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

// Initial data for national parks
const nationalParksData: InsertPark[] = [
  {
    name: "Great Smoky Mountains",
    state: "Tennessee/North Carolina",
    description: "Ridge upon ridge of forest straddling the border between North Carolina and Tennessee.",
    image: "great_smoky_mountains.jpg",
    visitors: 14161548,
    established: 1934,
    size: 522427,
    tag: "#1 Most Visited",
    elo: 1500
  },
  {
    name: "Grand Canyon",
    state: "Arizona",
    description: "Immense canyon carved by the Colorado River over millions of years.",
    image: "grand_canyon.jpg",
    visitors: 4532677,
    established: 1919,
    size: 1217403,
    tag: "Popular",
    elo: 1500
  },
  {
    name: "Zion",
    state: "Utah",
    description: "Deep red canyon walls and sandstone cliffs in southwestern Utah.",
    image: "zion.jpg",
    visitors: 4257704,
    established: 1919,
    size: 147237,
    elo: 1500
  },
  {
    name: "Yellowstone",
    state: "Wyoming/Montana/Idaho",
    description: "World's first national park, known for geysers and diverse wildlife.",
    image: "yellowstone.jpg",
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
    image: "yosemite.jpg",
    visitors: 3667550,
    established: 1890,
    size: 759620,
    elo: 1500
  },
  {
    name: "Acadia",
    state: "Maine",
    description: "Rocky headlands, woodland, lakes and mountains on the Atlantic coast.",
    image: "acadia.jpg",
    visitors: 3537575,
    established: 1919,
    size: 49075,
    elo: 1500
  },
  {
    name: "Olympic",
    state: "Washington",
    description: "Diverse ecosystems from glacier-capped mountains to old-growth temperate rainforests.",
    image: "olympic.jpg",
    visitors: 2718925,
    established: 1938,
    size: 922650,
    elo: 1500
  },
  {
    name: "Joshua Tree",
    state: "California",
    description: "Rugged mountains, gold mining ruins, desert landscape, and the Joshua Tree.",
    image: "joshua_tree.jpg",
    visitors: 2590624,
    established: 1994,
    size: 790636,
    elo: 1500
  },
  {
    name: "Bryce Canyon",
    state: "Utah",
    description: "Crimson-colored hoodoos (spire-shaped rock formations) in a natural amphitheater.",
    image: "bryce_canyon.jpg",
    visitors: 2365110,
    established: 1928,
    size: 35835,
    elo: 1500
  },
  {
    name: "Rocky Mountain",
    state: "Colorado",
    description: "Spectacular mountain environments and alpine lakes.",
    image: "rocky_mountain.jpg",
    visitors: 4137075,
    established: 1915,
    size: 265461,
    elo: 1500
  },
  {
    name: "Arches",
    state: "Utah",
    description: "Over 2,000 natural stone arches, including the famous Delicate Arch.",
    image: "arches.jpg",
    visitors: 1675632,
    established: 1971,
    size: 76679,
    elo: 1500
  },
  {
    name: "Glacier",
    state: "Montana",
    description: "Pristine forests, alpine meadows, rugged mountains, and spectacular lakes.",
    image: "glacier.jpg",
    visitors: 2946681,
    established: 1910,
    size: 1013322,
    elo: 1500
  },
  {
    name: "Shenandoah",
    state: "Virginia",
    description: "Part of the Blue Ridge Mountains along the Skyline Drive.",
    image: "shenandoah.jpg",
    visitors: 1395401,
    established: 1935,
    size: 199173,
    elo: 1500
  },
  {
    name: "Sequoia",
    state: "California",
    description: "Home to the giant sequoia trees, including the General Sherman Tree.",
    image: "sequoia.jpg",
    visitors: 1059548,
    established: 1890,
    size: 404064,
    elo: 1500
  },
  {
    name: "Death Valley",
    state: "California/Nevada",
    description: "Hottest, driest and lowest national park with diverse landscapes.",
    image: "death_valley.jpg",
    visitors: 1111025,
    established: 1994,
    size: 3373063,
    tag: "Lowest Point in North America",
    elo: 1500
  }
];

// Function to initialize parks data in the storage
export function initializeParksData() {
  fetch('/api/rankings')
    .then(response => {
      // If we get empty data or an error, initialize the parks data
      if (!response.ok) {
        // Access the storage directly to initialize parks
        if ("initializeParks" in storage) {
          (storage as any).initializeParks(nationalParksData);
        }
      }
    })
    .catch(() => {
      // If there's an error (likely because the backend isn't ready yet), 
      // we'll let the backend handle initialization
    });
}
