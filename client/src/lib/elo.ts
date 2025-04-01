/**
 * Calculate new ELO ratings based on match result
 * 
 * @param winnerRating Current ELO rating of the winner
 * @param loserRating Current ELO rating of the loser
 * @param kFactor K-factor determines the maximum change in rating (default: 32)
 * @returns Object containing new ratings for both players
 */
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
