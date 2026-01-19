import OpenAI from "openai";
import { recipeResponseSchema, type RecipeRequest, type Recipe } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateRecipes(request: RecipeRequest): Promise<Recipe[]> {
  const { ingredients, cookingTime, cookingMethod, foodType, userPreferences } = request;

  const ingredientsList = ingredients.join(", ");
  
  let prompt = `Ты опытный шеф-повар. Создай 5 уникальных рецептов блюд, используя следующие ингредиенты: ${ingredientsList}.

Требования:
- Время приготовления каждого блюда должно быть не более ${cookingTime} минут`;

  if (cookingMethod) {
    prompt += `\n- Способ приготовления: ${cookingMethod}`;
  }

  if (foodType) {
    if (foodType === "ПП") {
      prompt += `\n- Блюда должны быть диетическими, низкокалорийными, полезными для здоровья`;
    } else if (foodType === "Жирная") {
      prompt += `\n- Блюда могут быть сытными, калорийными, с использованием масла и жирных продуктов`;
    } else {
      prompt += `\n- Обычные повседневные блюда`;
    }
  }

  if (userPreferences) {
    if (userPreferences.baseIngredients && userPreferences.baseIngredients.length > 0) {
      prompt += `\n\nУ пользователя всегда есть базовые продукты: ${userPreferences.baseIngredients.join(", ")}. Можешь использовать их в рецептах.`;
    }
    
    if (userPreferences.equipment && userPreferences.equipment.length > 0) {
      prompt += `\n\nДоступное оборудование для готовки: ${userPreferences.equipment.join(", ")}. Учитывай это при составлении рецептов.`;
    }
    
    if (userPreferences.foodPreferences && userPreferences.foodPreferences.length > 0) {
      prompt += `\n\nПредпочтения пользователя в еде: ${userPreferences.foodPreferences.join(", ")}. Постарайся учесть эти предпочтения.`;
    }
  }

  prompt += `

Ответ должен быть в формате JSON:
{
  "recipes": [
    {
      "title": "Название блюда",
      "description": "Краткое описание блюда (1-2 предложения)",
      "cookingTime": "X мин",
      "ingredients": ["ингредиент 1 с количеством", "ингредиент 2 с количеством"],
      "steps": ["Шаг 1", "Шаг 2", "Шаг 3"],
      "tips": "Полезный совет по приготовлению (опционально)"
    }
  ]
}

Важно:
- Используй указанные ингредиенты и базовые продукты пользователя
- Каждый рецепт должен быть уникальным
- Шаги должны быть понятными и подробными
- Укажи точное время приготовления в минутах`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Ты профессиональный шеф-повар, который создает вкусные и практичные рецепты. Отвечай только в формате JSON."
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
