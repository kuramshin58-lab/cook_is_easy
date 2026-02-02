import type { Express } from "express";
import { createServer, type Server } from "http";
import { recipeRequestSchema, registerUserSchema, loginUserSchema, updateProfileSchema, recipeSchema, saveRecipeRequestSchema, unsaveRecipeRequestSchema, type MatchResult } from "@shared/schema";
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

  // Get all recipes from database with optional filters
  app.get("/api/recipes/browse", async (req, res) => {
    try {
      const {
        cookingTime,  // "quick" (<=30), "medium" (31-60), "long" (>60)
        mealType,     // "breakfast", "main", "salad", "snack", "dessert"
        mainIngredient, // "chicken", "beef", "pasta", "fish", etc.
        difficulty,   // "easy", "medium", "hard"
        search,       // text search
        limit = "50",
        offset = "0"
      } = req.query;

      let query = supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply cooking time filter
      if (cookingTime === 'quick') {
        query = query.lte('cook_time', 30);
      } else if (cookingTime === 'medium') {
        query = query.gt('cook_time', 30).lte('cook_time', 60);
      } else if (cookingTime === 'long') {
        query = query.gt('cook_time', 60);
      }

      // Apply difficulty filter
      if (difficulty && typeof difficulty === 'string') {
        query = query.ilike('difficulty', difficulty);
      }

      // Apply meal type filter (search in tags)
      if (mealType && typeof mealType === 'string') {
        query = query.contains('tags', [mealType]);
      }

      // Apply text search on title
      if (search && typeof search === 'string') {
        query = query.ilike('title', `%${search}%`);
      }

      // Apply pagination
      const limitNum = Math.min(parseInt(limit as string) || 50, 100);
      const offsetNum = parseInt(offset as string) || 0;
      query = query.range(offsetNum, offsetNum + limitNum - 1);

      const { data: recipes, error, count } = await query;

      if (error) {
        console.error("Error fetching recipes:", error);
        return res.status(500).json({ error: "Failed to fetch recipes" });
      }

      // If mainIngredient filter is set, filter in code
      // (since structured_ingredients is JSONB, complex filtering is easier in JS)
      let filteredRecipes = recipes || [];

      if (mainIngredient && typeof mainIngredient === 'string') {
        const ingredientLower = mainIngredient.toLowerCase();
        filteredRecipes = filteredRecipes.filter(recipe => {
          // Check structured_ingredients first
          if (recipe.structured_ingredients && Array.isArray(recipe.structured_ingredients)) {
            return recipe.structured_ingredients.some((ing: any) =>
              ing.name?.toLowerCase().includes(ingredientLower) &&
              (ing.category === 'key' || ing.category === 'important')
            );
          }
          // Fallback to legacy ingredients array
          if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
            return recipe.ingredients.some((ing: string) =>
              ing.toLowerCase().includes(ingredientLower)
            );
          }
          return false;
        });
      }

      // Get unique main ingredients for filter options
      const mainIngredientsSet = new Set<string>();
      (recipes || []).forEach(recipe => {
        if (recipe.structured_ingredients && Array.isArray(recipe.structured_ingredients)) {
          recipe.structured_ingredients.forEach((ing: any) => {
            if (ing.category === 'key' && ing.name) {
              mainIngredientsSet.add(ing.name.toLowerCase());
            }
          });
        }
      });

      return res.json({
        recipes: filteredRecipes,
        total: filteredRecipes.length,
        filters: {
          mainIngredients: Array.from(mainIngredientsSet).sort()
        }
      });
    } catch (error) {
      console.error("Error in browse recipes:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });

  // Save a recipe
  app.post("/api/recipes/save", async (req, res) => {
    try {
      const validationResult = saveRecipeRequestSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validationResult.error.errors
        });
      }

      const { userId, recipeId, recipeTitle, recipeData, isFromDatabase } = validationResult.data;

      const { data, error } = await supabase
        .from('saved_recipes')
        .upsert({
          user_id: userId,
          recipe_id: recipeId || null,
          recipe_title: recipeTitle,
          recipe_data: recipeData || null,
          is_from_database: isFromDatabase
        }, {
          onConflict: 'user_id,recipe_title'
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving recipe:", error);
        return res.status(500).json({ error: "Failed to save recipe" });
      }

      return res.json({ saved: true, data });
    } catch (error) {
      console.error("Error in save recipe:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });

  // Unsave a recipe
  app.delete("/api/recipes/save", async (req, res) => {
    try {
      const validationResult = unsaveRecipeRequestSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validationResult.error.errors
        });
      }

      const { userId, recipeTitle } = validationResult.data;

      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_title', recipeTitle);

      if (error) {
        console.error("Error unsaving recipe:", error);
        return res.status(500).json({ error: "Failed to unsave recipe" });
      }

      return res.json({ saved: false });
    } catch (error) {
      console.error("Error in unsave recipe:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });

  // Get all saved recipes for a user
  app.get("/api/recipes/saved", async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: "userId is required" });
      }

      const { data: savedRecipes, error } = await supabase
        .from('saved_recipes')
        .select('*')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });

      if (error) {
        console.error("Error fetching saved recipes:", error);
        return res.status(500).json({ error: "Failed to fetch saved recipes" });
      }

      // For database recipes, fetch full recipe data
      const enrichedRecipes = await Promise.all(
        (savedRecipes || []).map(async (saved) => {
          if (saved.is_from_database && saved.recipe_id) {
            const { data: dbRecipe } = await supabase
              .from('recipes')
              .select('*')
              .eq('id', saved.recipe_id)
              .single();

            if (dbRecipe) {
              return { ...saved, db_recipe: dbRecipe };
            }
          }
          return saved;
        })
      );

      return res.json({ recipes: enrichedRecipes });
    } catch (error) {
      console.error("Error in get saved recipes:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });

  // Check if a recipe is saved
  app.get("/api/recipes/saved/check", async (req, res) => {
    try {
      const { userId, title } = req.query;

      if (!userId || typeof userId !== 'string' || !title || typeof title !== 'string') {
        return res.status(400).json({ error: "userId and title are required" });
      }

      const { data, error } = await supabase
        .from('saved_recipes')
        .select('id')
        .eq('user_id', userId)
        .eq('recipe_title', title)
        .maybeSingle();

      if (error) {
        console.error("Error checking saved recipe:", error);
        return res.status(500).json({ error: "Failed to check saved recipe" });
      }

      return res.json({ isSaved: !!data });
    } catch (error) {
      console.error("Error in check saved recipe:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });

  return httpServer;
}
