import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const parks = pgTable("parks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  state: text("state").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  visitors: integer("visitors").notNull(),
  established: integer("established").notNull(),
  size: integer("size").notNull(),
  tag: text("tag"),
  elo: integer("elo").notNull().default(1500),
  previousRank: integer("previous_rank").notNull().default(0),
  currentRank: integer("current_rank").notNull().default(0),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  winnerParkId: integer("winner_park_id").notNull(),
  loserParkId: integer("loser_park_id").notNull(),
  points: integer("points").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertParkSchema = createInsertSchema(parks).omit({
  id: true,
  previousRank: true,
  currentRank: true
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true
});

export type InsertPark = z.infer<typeof insertParkSchema>;
export type Park = typeof parks.$inferSelect;

export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;

export type ParkWithVoteInfo = Park & {
  winnerImage?: string;
  loserImage?: string;
  loserName?: string;
  timeSince?: string;
  rankChange?: number;
  points?: number;
};
