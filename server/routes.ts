import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateBeatPattern } from "./openai";
import { z } from "zod";

// Validation schema for beat generation request
const beatGeneratorParamsSchema = z.object({
  genre: z.enum(['hip-hop', 'trap', 'house', 'techno', 'dnb', 'custom']),
  complexity: z.number().min(0).max(1),
  swing: z.number().min(0).max(1),
  density: z.number().min(0).max(1),
  variation: z.number().min(0).max(1)
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

  const httpServer = createServer(app);

  return httpServer;
}
