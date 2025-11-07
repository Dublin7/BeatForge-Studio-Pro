import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Beat Pattern Schema - for AI-generated and user-created patterns
export const beatPatterns = pgTable("beat_patterns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  genre: text("genre").notNull(),
  bpm: integer("bpm").notNull().default(120),
  steps: integer("steps").notNull().default(16),
  // Array of track data: { instrument, notes: [{ step, velocity }] }
  trackData: jsonb("track_data").notNull(),
  parameters: jsonb("parameters"), // complexity, swing, density
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Project Schema - full sequencer projects
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  bpm: integer("bpm").notNull().default(120),
  // Array of tracks with pattern chains and mixer settings
  tracks: jsonb("tracks").notNull(),
  mixerSettings: jsonb("mixer_settings"), // EQ, effects, levels
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBeatPatternSchema = createInsertSchema(beatPatterns).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBeatPattern = z.infer<typeof insertBeatPatternSchema>;
export type BeatPattern = typeof beatPatterns.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Frontend-only types for audio engine
export interface DrumNote {
  step: number;
  velocity: number; // 0-1
}

export interface DrumTrack {
  id: string;
  instrument: string;
  notes: DrumNote[];
  volume: number;
  pan: number;
  solo: boolean;
  mute: boolean;
  color: string;
}

export interface SequencerTrack extends DrumTrack {
  effects: Effect[];
  eq: EQSettings;
}

export interface Effect {
  id: string;
  type: 'reverb' | 'delay' | 'distortion' | 'compression';
  enabled: boolean;
  parameters: Record<string, number>;
}

export interface EQSettings {
  low: number;      // -12 to +12 dB
  mid: number;
  high: number;
  lowPassFreq: number;   // Hz
  highPassFreq: number;  // Hz
}

export interface MixerChannel {
  trackId: string;
  volume: number;    // 0-1
  pan: number;       // -1 to 1
  solo: boolean;
  mute: boolean;
  eq: EQSettings;
  effects: Effect[];
}

export interface BeatGeneratorParams {
  genre: 'hip-hop' | 'trap' | 'house' | 'techno' | 'dnb' | 'custom';
  complexity: number;  // 0-1
  swing: number;       // 0-1
  density: number;     // 0-1
  variation: number;   // 0-1
}

export interface AIBeatResponse {
  pattern: {
    tracks: DrumTrack[];
    bpm: number;
    steps: number;
  };
  metadata: {
    genre: string;
    parameters: BeatGeneratorParams;
  };
}
