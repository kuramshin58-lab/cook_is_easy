import type { Express } from "express";
import { createServer, type Server } from "http";
import { recipeRequestSchema, registerUserSchema, loginUserSchema, updateProfileSchema, recipeSchema, type MatchResult } from "@shared/schema";
import { generateRecipes, adaptRecipe } from "./openai";
import { searchRecipesInDatabase } from "./recipeSearch";
import { calculateWeightedScore } from "./weightedScoring";
import { supabase } from "./supabase";
import bcrypt from "bcryptjs";
import { z } from "zod";

const adaptRecipeRequestSchema = z.object({
  recipe: recipeSchema,
  userIngredients: z.array(z.string())
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validationResult = registerUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: validationResult.error.errors 
        });
      }

      const { name, email, password, base_ingredients, equipment, food_preferences } = validationResult.data;

      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({ error: "A user with this email already exists" });
      }

      const password_hash = await bcrypt.hash(password, 10);

      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          name,
          email,
          password_hash,
          base_ingredients,
          equipment,
          food_preferences
        })
        .select('id, name, email, base_ingredients, equipment, food_preferences')
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        return res.status(500).json({ 
          error: "Error creating user",
          details: error.message || "Unknown error"
        });
      }

      return res.json({ user: newUser });
    } catch (error) {
      console.error("Error registering user:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validationResult = loginUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: validationResult.error.errors 
        });
      }

      const { email, password } = validationResult.data;

      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, password_hash, base_ingredients, equipment, food_preferences')
        .eq('email', email)
        .single();

      if (error || !user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const { password_hash: _, ...userWithoutPassword } = user;
      
      return res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Error logging in:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });

  app.put("/api/auth/profile", async (req, res) => {
    try {
      const validationResult = updateProfileSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: validationResult.error.errors 
        });
      }

      const { userId, base_ingredients, equipment, food_preferences } = validationResult.data;

      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          base_ingredients,
          equipment,
          food_preferences
        })
        .eq('id', userId)
        .select('id, name, email, base_ingredients, equipment, food_preferences')
        .single();

      if (error) {
        console.error("Supabase update error:", error);
        return res.status(500).json({ error: "Error updating profile" });
      }

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({ user: updatedUser });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/recipes/generate", async (req, res) => {
    try {
      const validationResult = recipeRequestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: validationResult.error.errors 
        });
      }

      const request = validationResult.data;
      
      console.log("\n=== HYBRID RECIPE SEARCH ===");
      console.log("1. Searching database...");
      
      const { recipes: dbRecipes, foundEnough } = await searchRecipesInDatabase(request, 5);
      
      console.log(`   Found in database: ${dbRecipes.length} recipes`);
      
      if (foundEnough) {
        console.log("   Enough results from database, ChatGPT not needed");
        console.log("================================\n");
        return res.json({ recipes: dbRecipes, source: "database" });
      }
      
      console.log("2. Not enough recipes in database, requesting ChatGPT...");
      
      const rawAiRecipes = await generateRecipes(request);
      
      // Apply weighted scoring to AI recipes too
      const mainIngredients = request.ingredients;
      const baseIngredients = request.userPreferences?.baseIngredients || [];
      
      const aiRecipes = rawAiRecipes.map(recipe => {
        // Calculate weighted score for AI-generated recipe
        const scoreResult = calculateWeightedScore(
          recipe.ingredients,
          mainIngredients,
          baseIngredients
        );
        
        // Update ingredients with match info
        const ingredientsWithMatches = scoreResult.matches.map((m: MatchResult) => ({
          ...m.ingredient,
          available: m.matchType !== 'none',
          matchType: m.matchType,
          matchedWith: m.matchedWith
        }));
        
        return {
          ...recipe,
          ingredients: ingredientsWithMatches,
          matchPercentage: scoreResult.score,
          matchDetails: scoreResult.matchDetails,
          isFromDatabase: false
        };
      });
      
      const allRecipes = [...dbRecipes, ...aiRecipes].slice(0, 5);
      
      console.log(`   Total: ${dbRecipes.length} from database + ${aiRecipes.length} from AI`);
      console.log("================================\n");
      
      return res.json({ 
        recipes: allRecipes, 
        source: dbRecipes.length > 0 ? "hybrid" : "ai" 
      });
    } catch (error) {
      console.error("Error generating recipes:", error);
      return res.status(500).json({ 
        error: "Failed to generate recipes" 
      });
    }
  });

  app.post("/api/recipes/adapt", async (req, res) => {
    try {
      const validationResult = adaptRecipeRequestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: validationResult.error.errors 
        });
      }

      const { recipe, userIngredients } = validationResult.data;
      
      console.log("\n=== RECIPE ADAPTATION ===");
      console.log("Original recipe:", recipe.title);
      console.log("User ingredients:", userIngredients.length);
      
      const adaptedRecipe = await adaptRecipe(recipe, userIngredients);
      
      console.log("Substitutions made:", adaptedRecipe.substitutions.length);
      console.log("==========================\n");
      
      return res.json({ recipe: adaptedRecipe });
    } catch (error) {
      console.error("Error adapting recipe:", error);
      return res.status(500).json({ 
        error: "Failed to adapt recipe" 
      });
    }
  });

  return httpServer;
}
