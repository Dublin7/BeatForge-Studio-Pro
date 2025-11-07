import { 
  beatPatterns, 
  projects,
  type BeatPattern, 
  type InsertBeatPattern,
  type Project,
  type InsertProject
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Beat Patterns
  getBeatPattern(id: string): Promise<BeatPattern | undefined>;
  getAllBeatPatterns(): Promise<BeatPattern[]>;
  createBeatPattern(pattern: InsertBeatPattern): Promise<BeatPattern>;
  deleteBeatPattern(id: string): Promise<void>;
  
  // Projects
  getProject(id: string): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getBeatPattern(id: string): Promise<BeatPattern | undefined> {
    const [pattern] = await db.select().from(beatPatterns).where(eq(beatPatterns.id, id));
    return pattern || undefined;
  }

  async getAllBeatPatterns(): Promise<BeatPattern[]> {
    return db.select().from(beatPatterns).orderBy(desc(beatPatterns.createdAt));
  }

  async createBeatPattern(insertPattern: InsertBeatPattern): Promise<BeatPattern> {
    const [pattern] = await db
      .insert(beatPatterns)
      .values(insertPattern)
      .returning();
    return pattern;
  }

  async deleteBeatPattern(id: string): Promise<void> {
    await db.delete(beatPatterns).where(eq(beatPatterns.id, id));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getAllProjects(): Promise<Project[]> {
    return db.select().from(projects).orderBy(desc(projects.updatedAt));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }
}

export const storage = new DatabaseStorage();
