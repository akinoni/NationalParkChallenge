import { parks, type Park, type InsertPark, votes, type Vote, type InsertVote, type ParkWithVoteInfo } from "@shared/schema";
import { calculateElo } from "../shared/parks-data";

export interface IStorage {
  // Park operations
  getAllParks(): Promise<Park[]>;
  getParkById(id: number): Promise<Park | undefined>;
  getRandomMatchup(): Promise<[Park, Park]>;
  updateParkElo(id: number, newElo: number): Promise<Park>;
  updateParkRanks(): Promise<void>;
  
  // Vote operations
  createVote(vote: InsertVote): Promise<Vote>;
  getRecentVotes(limit: number): Promise<ParkWithVoteInfo[]>;
  getVoteCount(): Promise<number>;
}

export class MemStorage implements IStorage {
  private parks: Map<number, Park>;
  private votes: Vote[];
  private voteId: number;

  constructor() {
    this.parks = new Map();
    this.votes = [];
    this.voteId = 1;
  }

  async getAllParks(): Promise<Park[]> {
    return Array.from(this.parks.values()).sort((a, b) => b.elo - a.elo);
  }

  async getParkById(id: number): Promise<Park | undefined> {
    return this.parks.get(id);
  }

  async getRandomMatchup(): Promise<[Park, Park]> {
    const allParks = Array.from(this.parks.values());
    
    // Ensure we have at least 2 parks to create a matchup
    if (allParks.length < 2) {
      throw new Error("Not enough parks to create a matchup");
    }
    
    // Get two random distinct parks
    const index1 = Math.floor(Math.random() * allParks.length);
    let index2 = Math.floor(Math.random() * (allParks.length - 1));
    if (index2 >= index1) index2++;
    
    return [allParks[index1], allParks[index2]];
  }

  async updateParkElo(id: number, newElo: number): Promise<Park> {
    const park = this.parks.get(id);
    if (!park) {
      throw new Error(`Park with id ${id} not found`);
    }
    
    const updatedPark = { ...park, elo: newElo };
    this.parks.set(id, updatedPark);
    
    return updatedPark;
  }

  async updateParkRanks(): Promise<void> {
    const sortedParks = Array.from(this.parks.values()).sort((a, b) => b.elo - a.elo);
    
    for (let i = 0; i < sortedParks.length; i++) {
      const park = sortedParks[i];
      const previousRank = park.currentRank;
      const currentRank = i + 1;
      
      this.parks.set(park.id, {
        ...park,
        previousRank,
        currentRank
      });
    }
  }

  async createVote(vote: InsertVote): Promise<Vote> {
    const newVote: Vote = {
      ...vote,
      id: this.voteId++,
      createdAt: new Date()
    };
    
    this.votes.push(newVote);
    
    // Calculate and update ELO ratings
    const winner = this.parks.get(vote.winnerParkId);
    const loser = this.parks.get(vote.loserParkId);
    
    if (!winner || !loser) {
      throw new Error("Winner or loser park not found");
    }
    
    const { winnerNewElo, loserNewElo } = calculateElo(winner.elo, loser.elo);
    
    await this.updateParkElo(winner.id, winnerNewElo);
    await this.updateParkElo(loser.id, loserNewElo);
    await this.updateParkRanks();
    
    return newVote;
  }

  async getRecentVotes(limit: number): Promise<ParkWithVoteInfo[]> {
    const recentVotes = [...this.votes]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    
    return Promise.all(recentVotes.map(async vote => {
      const winner = this.parks.get(vote.winnerParkId);
      const loser = this.parks.get(vote.loserParkId);
      
      if (!winner || !loser) {
        throw new Error("Winner or loser park not found for vote");
      }
      
      const timeSince = this.getTimeSince(vote.createdAt);
      
      return {
        ...winner,
        winnerImage: winner.image,
        loserImage: loser.image,
        loserName: loser.name,
        timeSince,
        points: vote.points
      };
    }));
  }

  async getVoteCount(): Promise<number> {
    return this.votes.length;
  }

  private getTimeSince(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000; // years
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000; // months
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400; // days
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600; // hours
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60; // minutes
    if (interval > 1) return Math.floor(interval) + " mins ago";
    
    return Math.floor(seconds) + " secs ago";
  }

  // Method to initialize parks data
  initializeParks(parksData: InsertPark[]): void {
    parksData.forEach((park, index) => {
      const newPark: Park = {
        ...park,
        id: index + 1,
        elo: 1500,
        currentRank: index + 1,
        previousRank: index + 1
      };
      this.parks.set(newPark.id, newPark);
    });
  }
}

export const storage = new MemStorage();
