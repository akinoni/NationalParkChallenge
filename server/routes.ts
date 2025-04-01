import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertVoteSchema } from "@shared/schema";
import { fetchWikipediaParks } from "@shared/fetch-wiki-parks";
import { db } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize parks data from Wikipedia when server starts
  try {
    console.log("Initializing parks data from Wikipedia...");
    
    // Force clear existing database entries to prevent duplicates
    if ('initializeDbWithParks' in storage) {
      console.log("Cleaning existing database entries...");
      await (storage as any).cleanupDatabase();
    }
    
    // Fetch parks data from Wikipedia
    const parksData = await fetchWikipediaParks();
    
    if (parksData.length > 0) {
      // Initialize with parks if we got data from Wikipedia
      console.log(`Found ${parksData.length} parks from Wikipedia, initializing database...`);
      
      // Check if we're using DatabaseStorage (which has an initializeDbWithParks method)
      if ('initializeDbWithParks' in storage) {
        await (storage as any).initializeDbWithParks(parksData);
      } 
      // Fallback to in-memory storage if DatabaseStorage not available
      else if ('initializeParks' in storage) {
        (storage as any).initializeParks(parksData);
      }
      
      console.log(`Successfully initialized ${parksData.length} parks from Wikipedia`);
    } else {
      throw new Error("No parks data returned from Wikipedia");
    }
  } catch (error) {
    console.error("Error initializing parks data:", error);
    
    // Initialize with default data if Wikipedia fetch fails
    const defaultParksData = [
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
      },
      {
        name: "Grand Canyon",
        state: "Arizona",
        description: "Immense canyon carved by the Colorado River, revealing billions of years of geological history.",
        image: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Grand_Canyon_view_from_Pima_Point_2010.jpg",
        visitors: 4532677,
        established: 1919,
        size: 1201647,
        elo: 1500
      },
      {
        name: "Zion",
        state: "Utah",
        description: "Steep red cliffs, emerald pools, and waterfalls in a desert landscape.",
        image: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Angels_Landing.jpg",
        visitors: 4320033,
        established: 1919,
        size: 146597,
        elo: 1500
      },
      {
        name: "Great Smoky Mountains",
        state: "Tennessee/North Carolina",
        description: "Ancient mountains with diverse forests, wildflowers, and abundant wildlife.",
        image: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Foothills_Parkway_View.jpg",
        visitors: 11421200,
        established: 1934,
        size: 522427,
        tag: "Most Visited", 
        elo: 1500
      }
    ];
    
    console.log(`Initializing with ${defaultParksData.length} default parks...`);
    
    // Check if we're using DatabaseStorage (which has an initializeDbWithParks method)
    if ('initializeDbWithParks' in storage) {
      await (storage as any).initializeDbWithParks(defaultParksData);
    } 
    // Fallback to in-memory storage if DatabaseStorage not available
    else if ('initializeParks' in storage) {
      (storage as any).initializeParks(defaultParksData);
    }
    
    console.log(`Initialized with default parks data`);
  }
  // Get a random matchup of two parks
  app.get("/api/matchup", async (req, res) => {
    try {
      const matchup = await storage.getRandomMatchup();
      res.json(matchup);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Unknown error occurred" });
      }
    }
  });

  // Get park rankings
  app.get("/api/rankings", async (req, res) => {
    try {
      const parks = await storage.getAllParks();
      res.json(parks);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Unknown error occurred" });
      }
    }
  });

  // Get recent votes
  app.get("/api/votes/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const recentVotes = await storage.getRecentVotes(limit);
      res.json(recentVotes);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Unknown error occurred" });
      }
    }
  });

  // Get vote count
  app.get("/api/votes/count", async (req, res) => {
    try {
      const count = await storage.getVoteCount();
      res.json({ count });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Unknown error occurred" });
      }
    }
  });

  // Submit a vote
  app.post("/api/vote", async (req, res) => {
    try {
      const voteData = insertVoteSchema.parse(req.body);
      const newVote = await storage.createVote(voteData);
      res.status(201).json(newVote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid vote data", errors: error.errors });
      } else if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Unknown error occurred" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
