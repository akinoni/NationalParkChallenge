import { parks, votes, type Park, type InsertPark, type Vote, type InsertVote, type ParkWithVoteInfo } from "@shared/schema";
import { calculateElo } from "../shared/parks-data";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

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
  
  // Only for MemStorage (not in DB implementation)
  initializeParks?(parksData: InsertPark[]): void;
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
    
    if (allParks.length < 2) {
      throw new Error("Not enough parks to create a matchup");
    }
    
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

  initializeParks(parksData: InsertPark[]): void {
    parksData.forEach((park, index) => {
      const newPark: Park = {
        ...park,
        id: index + 1,
        elo: 1500,
        currentRank: index + 1,
        previousRank: index + 1,
        tag: park.tag || null // Ensure tag is string | null, not undefined
      };
      this.parks.set(newPark.id, newPark);
    });
  }
}

// Database implementation for persistent storage
export class DatabaseStorage implements IStorage {
  constructor() {
    console.log("Initializing DatabaseStorage");
  }
  
  // Helper function to calculate time since a date
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
  
  async getAllParks(): Promise<Park[]> {
    // Retrieve all parks, sorted by ELO rating
    return db.select().from(parks).orderBy(desc(parks.elo));
  }
  
  async getParkById(id: number): Promise<Park | undefined> {
    // Retrieve a specific park by ID
    const [park] = await db.select().from(parks).where(eq(parks.id, id));
    return park;
  }
  
  async getRandomMatchup(): Promise<[Park, Park]> {
    // Get count of parks
    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(parks);
    const parkCount = countResult?.count || 0;
    
    if (parkCount < 2) {
      throw new Error("Not enough parks to create a matchup");
    }
    
    // Generate two random IDs (need to adjust as park IDs might not be sequential)
    const allParks = await this.getAllParks();
    
    // Get two random distinct parks
    const index1 = Math.floor(Math.random() * allParks.length);
    let index2 = Math.floor(Math.random() * (allParks.length - 1));
    if (index2 >= index1) index2++;
    
    return [allParks[index1], allParks[index2]];
  }
  
  async updateParkElo(id: number, newElo: number): Promise<Park> {
    // Update a park's ELO rating
    const [updatedPark] = await db
      .update(parks)
      .set({ elo: newElo })
      .where(eq(parks.id, id))
      .returning();
      
    if (!updatedPark) {
      throw new Error(`Park with id ${id} not found`);
    }
    
    return updatedPark;
  }
  
  async updateParkRanks(): Promise<void> {
    // Get all parks sorted by ELO
    const sortedParks = await db.select().from(parks).orderBy(desc(parks.elo));
    
    // Update each park's rank
    for (let i = 0; i < sortedParks.length; i++) {
      const park = sortedParks[i];
      const previousRank = park.currentRank;
      const currentRank = i + 1;
      
      await db
        .update(parks)
        .set({
          previousRank,
          currentRank
        })
        .where(eq(parks.id, park.id));
    }
  }
  
  async createVote(vote: InsertVote): Promise<Vote> {
    // Create a new vote
    const [newVote] = await db
      .insert(votes)
      .values(vote)
      .returning();
      
    // Get the winner and loser parks
    const [winner] = await db.select().from(parks).where(eq(parks.id, vote.winnerParkId));
    const [loser] = await db.select().from(parks).where(eq(parks.id, vote.loserParkId));
    
    if (!winner || !loser) {
      throw new Error("Winner or loser park not found");
    }
    
    // Calculate new ELO ratings
    const { winnerNewElo, loserNewElo } = calculateElo(winner.elo, loser.elo);
    
    // Update ELO ratings
    await this.updateParkElo(winner.id, winnerNewElo);
    await this.updateParkElo(loser.id, loserNewElo);
    
    // Update ranks
    await this.updateParkRanks();
    
    return newVote;
  }
  
  async getRecentVotes(limit: number): Promise<ParkWithVoteInfo[]> {
    // Get recent votes
    const recentVotes = await db
      .select()
      .from(votes)
      .orderBy(desc(votes.createdAt))
      .limit(limit);
      
    // Get detailed info for each vote
    const result: ParkWithVoteInfo[] = [];
    
    for (const vote of recentVotes) {
      const [winner] = await db.select().from(parks).where(eq(parks.id, vote.winnerParkId));
      const [loser] = await db.select().from(parks).where(eq(parks.id, vote.loserParkId));
      
      if (winner && loser) {
        const timeSince = this.getTimeSince(vote.createdAt);
        
        result.push({
          ...winner,
          winnerImage: winner.image,
          loserImage: loser.image,
          loserName: loser.name,
          timeSince,
          points: vote.points
        });
      }
    }
    
    return result;
  }
  
  async getVoteCount(): Promise<number> {
    // Get total vote count
    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(votes);
    return countResult?.count || 0;
  }

  // Method to cleanup the database before re-initialization
  async cleanupDatabase(): Promise<void> {
    try {
      // Delete all parks and votes
      await db.delete(votes);
      await db.delete(parks);
      console.log("Database cleanup successful");
    } catch (error) {
      console.error("Error cleaning up database:", error);
    }
  }
  
  // Method to initialize database with parks data
  async initializeDbWithParks(parksData: InsertPark[]): Promise<void> {
    // Only proceed if we have parks data to insert
    if (parksData.length === 0) {
      console.warn("No parks data to initialize database with");
      return;
    }
    
    console.log(`Initializing database with ${parksData.length} parks`);
    
    // Insert all parks
    for (let i = 0; i < parksData.length; i++) {
      const park = parksData[i];
      try {
        await db.insert(parks).values({
          ...park,
          elo: 1500,
          currentRank: i + 1,
          previousRank: i + 1,
          tag: park.tag || null // Ensure tag is string | null, not undefined
        });
        console.log(`Inserted park: ${park.name}`);
      } catch (error) {
        console.error(`Error inserting park ${park.name}:`, error);
      }
    }
    
    console.log("Parks data initialization complete");
  }
}

// Export a DatabaseStorage instance
export const storage = new DatabaseStorage();
