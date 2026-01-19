import type { Express } from "express";
import { createServer, type Server } from "http";
import { recipeRequestSchema, registerUserSchema, loginUserSchema } from "@shared/schema";
import { generateRecipes } from "./openai";
import { supabase } from "./supabase";
import bcrypt from "bcryptjs";

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
        return res.status(400).json({ error: "Пользователь с таким email уже существует" });
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
          error: "Ошибка при создании пользователя",
          details: error.message || "Unknown error"
        });
      }

      return res.json({ user: newUser });
    } catch (error) {
      console.error("Error registering user:", error);
      return res.status(500).json({ error: "Ошибка сервера" });
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
        return res.status(401).json({ error: "Неверный email или пароль" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({ error: "Неверный email или пароль" });
      }

      const { password_hash: _, ...userWithoutPassword } = user;
      
      return res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Error logging in:", error);
      return res.status(500).json({ error: "Ошибка сервера" });
    }
  });

  app.put("/api/auth/profile", async (req, res) => {
    try {
      const { userId, base_ingredients, equipment, food_preferences } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          base_ingredients: base_ingredients || [],
          equipment: equipment || [],
          food_preferences: food_preferences || []
        })
        .eq('id', userId)
        .select('id, name, email, base_ingredients, equipment, food_preferences')
        .single();

      if (error) {
        console.error("Supabase update error:", error);
        return res.status(500).json({ error: "Ошибка при обновлении профиля" });
      }

      return res.json({ user: updatedUser });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({ error: "Ошибка сервера" });
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
