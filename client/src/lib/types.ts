// This file contains additional type definitions for the client

export interface RankChange {
  current: number;
  previous: number;
  change: number;
}

export interface VoteResult {
  winnerId: number;
  loserId: number;
  pointsExchanged: number;
  timestamp: Date;
}
