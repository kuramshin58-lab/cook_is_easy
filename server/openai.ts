import OpenAI from "openai";
import { recipeResponseSchema, type RecipeRequest, type Recipe } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateRecipes(request: RecipeRequest): Promise<Recipe[]> {
  const { ingredients, cookingTime, mealType, skillLevel, foodType, userPreferences } = request;

  const ingredientsList = ingredients.join(", ");
  
  let prompt = `Ты опытный шеф-повар и фуд-редактор. Твоя задача — придумать 5 реально интересных и разнообразных рецептов под запрос пользователя, чтобы это было вкусно и выполнимо дома, используя следующие ингредиенты: ${ingredientsList}.

Требования:
- Время приготовления каждого блюда должно быть не более ${cookingTime} минут`;

  if (mealType) {
    prompt += `\n- Тип блюда: ${mealType}`;
  }

  if (skillLevel) {
    if (skillLevel === "Новичок") {
      prompt += `\n- Уровень сложности: простые рецепты для начинающих, минимум ингредиентов и шагов, базовые техники`;
    } else if (skillLevel === "Средний") {
      prompt += `\n- Уровень сложности: средний, можно использовать более сложные техники и больше ингредиентов`;
    } else if (skillLevel === "Мишлен") {
      prompt += `\n- Уровень сложности: высокий (ресторанный уровень), изысканные блюда, сложные техники, презентация`;
    }
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
      "shortDescription": "Очень краткое описание в 5-7 слов (для карточки превью)",
      "description": "Полное описание блюда (2-3 предложения)",
      "cookingTime": "X мин",
      "calories": 350,
      "protein": 25,
      "fats": 15,
      "carbs": 30,
      "ingredients": [
        {"name": "Название продукта", "amount": "количество (например, 200 г или 2 шт)"}
      ],
      "steps": ["Шаг 1", "Шаг 2", "Шаг 3"],
      "tips": "Полезный совет по приготовлению (опционально)"
    }
  ]
}

Правила качества (очень важно):

1. Не предлагай банальные варианты вроде "просто куриная грудка + гречка" без оригинальной идеи.

2. Все 5 рецептов должны быть заметно разными по формату, вкусу и методу готовки. Не повторяй один и тот же шаблон (например, 5 вариаций "жарим и подаём").

3. В каждом рецепте должна быть одна чёткая ключевая идея, которая отличает его от стандартного домашнего блюда. Укажи её короткой фразой в description или tips.

4. Используй только реалистичные дополнительные ингредиенты (максимум 5 "небазовых" на рецепт). Если добавляешь что-то нестандартное — предлагай простую замену в tips.

5. Время приготовления должно быть реальным и укладываться в указанный лимит.

6. Шаги должны быть понятными для человека без опыта: короткие, конкретные, без профессионального жаргона (или с пояснением).

7. Обязательно укажи калорийность (calories) и БЖУ (protein, fats, carbs) на порцию в числовом формате.

8. Рецепты должны быть реальными и основанными на известных блюдах/подходах (котлеты, тефтели, запеканка, оладьи, боул, салат, суп, паста, фриттата и т.д.). Не выдумывай "авторские" блюда и несуществующие названия. Названия должны звучать как реальные блюда из кухни/домашней готовки.

Технические требования к формату:
- В поле "name" ингредиента указывай только название продукта (без количества)
- В поле "amount" указывай количество (граммы, штуки, ложки и т.д.)
- Используй указанные ингредиенты и базовые продукты пользователя`;

  console.log("\n=== ЗАПРОС В CHATGPT ===");
  console.log("Промпт:", prompt);
  console.log("========================\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Ты опытный шеф-повар и фуд-редактор. Создаёшь интересные, разнообразные и выполнимые дома рецепты. Отвечай только в формате JSON."
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
