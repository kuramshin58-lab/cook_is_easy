import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { recipeRequestSchema } from "@shared/schema";
import { generateRecipes } from "./openai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/recipes/generate", async (req, res) => {
    try {
      const validationResult = recipeRequestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: validationResult.error.errors 
        });
      }

      const recipes = await generateRecipes(validationResult.data);
      
      return res.json({ recipes });
    } catch (error) {
      console.error("Error generating recipes:", error);
      return res.status(500).json({ 
        error: "Failed to generate recipes" 
      });
    }
  });

  return httpServer;
}
