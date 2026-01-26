import OpenAI from "openai";
import { z } from "zod";
import { recipeResponseSchema, structuredIngredientSchema, type RecipeRequest, type Recipe } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const substitutionSchema = z.object({
  original: z.string(),
  replacement: z.string()
});

const adaptedRecipeResponseSchema = z.object({
  title: z.string(),
  shortDescription: z.string(),
  description: z.string(),
  cookingTime: z.string(),
  calories: z.number().optional().default(0),
  protein: z.number().optional().default(0),
  fats: z.number().optional().default(0),
  carbs: z.number().optional().default(0),
  ingredients: z.array(structuredIngredientSchema),
  steps: z.array(z.string()),
  tips: z.string().optional(),
  substitutions: z.array(substitutionSchema).default([])
});

export type AdaptedRecipe = z.infer<typeof adaptedRecipeResponseSchema>;

export async function adaptRecipe(recipe: Recipe, userIngredients: string[]): Promise<AdaptedRecipe> {
  const prompt = `You are an experienced chef. The user wants to cook this recipe but doesn't have all ingredients.

ORIGINAL RECIPE:
Title: ${recipe.title}
Ingredients: ${recipe.ingredients.map(i => `${i.name} (${i.amount})`).join(", ")}
Steps: ${recipe.steps.join(" | ")}

USER HAS THESE INGREDIENTS: ${userIngredients.join(", ")}

Your task:
1. Identify which recipe ingredients the user is MISSING
2. For each missing ingredient, find a suitable substitute from what the user HAS
3. If no good substitute exists for a critical ingredient, mark it in substitutions as "replacement": "NOT AVAILABLE"
4. Adapt the cooking steps if the substitution requires different cooking technique

Respond ONLY in this JSON format:
{
  "title": "Recipe title (same or slightly modified)",
  "shortDescription": "Brief description in 5-7 words",
  "description": "Full description (2-3 sentences)",
  "cookingTime": "${recipe.cookingTime}",
  "calories": ${recipe.calories || 300},
  "protein": ${recipe.protein || 20},
  "fats": ${recipe.fats || 10},
  "carbs": ${recipe.carbs || 30},
  "ingredients": [
    {
      "name": "Ingredient name",
      "amount": "quantity",
      "category": "key|important|flavor|base",
      "substitutes": ["Alternative 1", "Alternative 2"]
    }
  ],
  "steps": ["Step 1", "Step 2"],
  "tips": "Any tips for this adapted version",
  "substitutions": [
    {"original": "Original ingredient", "replacement": "What it was replaced with"}
  ]
}

Ingredient categories:
- "key": Main protein or dish base
- "important": Significant additions (cheese, eggs, vegetables, sauces)
- "flavor": Spices, herbs, aromatics
- "base": Basic pantry staples (salt, pepper, oil)

Rules:
- Only include substitutions for ingredients that were actually changed
- If no changes needed (user has everything), return empty substitutions array
- Keep the recipe realistic and tasty
- Adjust quantities if needed for substitutes`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an experienced chef who adapts recipes based on available ingredients. Respond only in JSON format."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    max_tokens: 2048
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse OpenAI response:", content);
    throw new Error("Invalid JSON response from AI");
  }
  
  const validationResult = adaptedRecipeResponseSchema.safeParse(parsed);
  
  if (!validationResult.success) {
    console.error("Invalid adapted recipe structure:", validationResult.error);
    throw new Error("Invalid recipe format from AI");
  }
  
  return validationResult.data;
}

export async function generateRecipes(request: RecipeRequest): Promise<Recipe[]> {
  const { ingredients, cookingTime, mealType, skillLevel, foodType, userPreferences } = request;

  const ingredientsList = ingredients.join(", ");
  
  let prompt = `You are an experienced chef and food editor. Your task is to create 5 interesting and diverse recipes that are tasty and achievable at home, using the following ingredients: ${ingredientsList}.

Requirements:
- Cooking time for each dish must be no more than ${cookingTime} minutes`;

  if (mealType) {
    prompt += `\n- Meal type: ${mealType}`;
  }

  if (skillLevel) {
    if (skillLevel === "Beginner") {
      prompt += `\n- Skill level: simple recipes for beginners, minimal ingredients and steps, basic techniques`;
    } else if (skillLevel === "Intermediate") {
      prompt += `\n- Skill level: intermediate, can use more complex techniques and more ingredients`;
    } else if (skillLevel === "Expert") {
      prompt += `\n- Skill level: advanced (restaurant quality), sophisticated dishes, complex techniques, presentation`;
    }
  }

  if (foodType) {
    if (foodType === "Healthy") {
      prompt += `\n- Dishes should be healthy, low-calorie, good for health`;
    } else if (foodType === "Comfort") {
      prompt += `\n- Dishes can be hearty, calorie-rich, using oil and fatty products`;
    } else {
      prompt += `\n- Regular everyday dishes`;
    }
  }

  if (userPreferences) {
    if (userPreferences.baseIngredients && userPreferences.baseIngredients.length > 0) {
      prompt += `\n\nUser always has these pantry staples: ${userPreferences.baseIngredients.join(", ")}. You can use them in recipes.`;
    }
    
    if (userPreferences.equipment && userPreferences.equipment.length > 0) {
      prompt += `\n\nAvailable cooking equipment: ${userPreferences.equipment.join(", ")}. Consider this when creating recipes.`;
    }
    
    if (userPreferences.foodPreferences && userPreferences.foodPreferences.length > 0) {
      prompt += `\n\nUser's food preferences: ${userPreferences.foodPreferences.join(", ")}. Try to incorporate these preferences.`;
    }
  }

  prompt += `

Response must be in JSON format:
{
  "recipes": [
    {
      "title": "Dish name",
      "shortDescription": "Very brief description in 5-7 words (for preview card)",
      "description": "Full description of the dish (2-3 sentences)",
      "cookingTime": "X min",
      "calories": 350,
      "protein": 25,
      "fats": 15,
      "carbs": 30,
      "ingredients": [
        {
          "name": "Ingredient name",
          "amount": "quantity (e.g., 200g or 2 pcs)",
          "category": "key|important|flavor|base",
          "substitutes": ["Alternative 1", "Alternative 2"]
        }
      ],
      "steps": ["Step 1", "Step 2", "Step 3"],
      "tips": "Helpful cooking tip (optional)"
    }
  ]
}

Ingredient categories (choose the most appropriate):
- "key": Main protein or dish base (chicken, beef, pasta, rice, fish, tofu)
- "important": Significant additions (cheese, eggs, vegetables, sauces, bacon)
- "flavor": Spices, herbs, aromatics (garlic, ginger, basil, cumin, lemon)
- "base": Basic pantry staples (salt, pepper, oil, sugar, water, flour)

Quality rules (very important):

1. Don't suggest bland options like "just chicken breast + rice" without an original twist.

2. All 5 recipes must be noticeably different in format, taste, and cooking method. Don't repeat the same template (e.g., 5 variations of "fry and serve").

3. Each recipe should have one clear key idea that distinguishes it from a standard home dish. Mention it briefly in description or tips.

4. Use only realistic additional ingredients (max 5 "non-basic" per recipe). If adding something unusual, suggest a simple substitute in tips.

5. Cooking time must be realistic and fit within the specified limit.

6. Steps should be understandable for someone without experience: short, specific, without professional jargon (or with explanation).

7. Always include calories and macros (protein, fats, carbs) per serving in numeric format.

8. Recipes must be real and based on known dishes/approaches (meatballs, casserole, pancakes, bowl, salad, soup, pasta, frittata, etc.). Don't invent "author's" dishes or non-existent names. Names should sound like real dishes from a kitchen/home cooking.

Technical format requirements:
- In the "name" field of ingredients, specify only the product name (without quantity)
- In the "amount" field, specify the quantity (grams, pieces, tablespoons, etc.)
- Use the specified ingredients and user's pantry staples`;

  console.log("\n=== CHATGPT REQUEST ===");
  console.log("Prompt:", prompt);
  console.log("========================\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an experienced chef and food editor. You create interesting, diverse, and achievable home recipes. Respond only in JSON format."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    max_tokens: 4096
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  const parsed = JSON.parse(content);
  const validationResult = recipeResponseSchema.safeParse(parsed);
  
  if (!validationResult.success) {
    console.error("Invalid response structure from OpenAI:", validationResult.error);
    throw new Error("Invalid recipe response format from AI");
  }
  
  return validationResult.data.recipes;
}
