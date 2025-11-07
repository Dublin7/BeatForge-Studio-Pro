import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateBeatPattern, generateTextToSpeech } from "./openai";
import { z } from "zod";
import { insertBeatPatternSchema, insertProjectSchema } from "@shared/schema";

// Validation schema for beat generation request
const beatGeneratorParamsSchema = z.object({
  genre: z.enum(['hip-hop', 'trap', 'house', 'techno', 'dnb', 'custom']),
  complexity: z.number().min(0).max(1),
  swing: z.number().min(0).max(1),
  density: z.number().min(0).max(1),
  variation: z.number().min(0).max(1)
});

// Validation schema for text-to-speech request
const textToSpeechSchema = z.object({
  text: z.string().min(1).max(4096),
  voice: z.enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']).optional().default('alloy')
});

export async function registerRoutes(app: Express): Promise<Server> {
  // AI Beat Generation endpoint
  app.post("/api/beats/generate", async (req, res) => {
    try {
      // Validate request body
      const params = beatGeneratorParamsSchema.parse(req.body);

      // Generate beat pattern using OpenAI
      const result = await generateBeatPattern(params);

      res.json(result);
    } catch (error) {
      console.error('Beat generation error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: 'Invalid parameters',
          details: error.errors 
        });
      } else {
        res.status(500).json({ 
          error: 'Failed to generate beat pattern',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  // Text-to-Speech endpoint
  app.post("/api/text-to-speech", async (req, res) => {
    try {
      // Validate request body
      const params = textToSpeechSchema.parse(req.body);

      // Generate speech using OpenAI TTS
      const audioBuffer = await generateTextToSpeech(params.text, params.voice);

      res.setHeader('Content-Type', 'audio/mpeg');
      res.send(audioBuffer);
    } catch (error) {
      console.error('Text-to-speech error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: 'Invalid parameters',
          details: error.errors 
        });
      } else {
        res.status(500).json({ 
          error: 'Failed to generate speech',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  // Beat Pattern CRUD endpoints
  app.get("/api/patterns", async (req, res) => {
    try {
      const patterns = await storage.getAllBeatPatterns();
      res.json(patterns);
    } catch (error) {
      console.error('Failed to fetch patterns:', error);
      res.status(500).json({ error: 'Failed to fetch patterns' });
    }
  });

  app.get("/api/patterns/:id", async (req, res) => {
    try {
      const pattern = await storage.getBeatPattern(req.params.id);
      if (!pattern) {
        return res.status(404).json({ error: 'Pattern not found' });
      }
      res.json(pattern);
    } catch (error) {
      console.error('Failed to fetch pattern:', error);
      res.status(500).json({ error: 'Failed to fetch pattern' });
    }
  });

  app.post("/api/patterns", async (req, res) => {
    try {
      const patternData = insertBeatPatternSchema.parse(req.body);
      const pattern = await storage.createBeatPattern(patternData);
      res.status(201).json(pattern);
    } catch (error) {
      console.error('Failed to create pattern:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid pattern data', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create pattern' });
      }
    }
  });

  app.delete("/api/patterns/:id", async (req, res) => {
    try {
      await storage.deleteBeatPattern(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Failed to delete pattern:', error);
      res.status(500).json({ error: 'Failed to delete pattern' });
    }
  });

  // Project CRUD endpoints
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      console.error('Failed to create project:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid project data', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create project' });
      }
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const updates = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, updates);
      res.json(project);
    } catch (error) {
      console.error('Failed to update project:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid project data', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to update project' });
      }
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Failed to delete project:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
