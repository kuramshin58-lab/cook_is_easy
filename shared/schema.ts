import { z } from "zod";

export const cookingTimeOptions = ["20", "40", "60"] as const;
export type CookingTime = typeof cookingTimeOptions[number];

export const cookingMethodOptions = [
  "Варка",
  "Жарка",
  "Запекание",
  "Тушение",
  "На пару",
  "Гриль",
  "Без готовки"
] as const;
export type CookingMethod = typeof cookingMethodOptions[number];

export const foodTypeOptions = ["ПП", "Обычная", "Жирная"] as const;
export type FoodType = typeof foodTypeOptions[number];

export const baseIngredientsOptions = [
  "Соль",
  "Перец черный",
  "Сахар",
  "Масло подсолнечное",
  "Масло оливковое",
  "Масло сливочное",
  "Уксус",
  "Соевый соус",
  "Мука",
  "Лук",
  "Чеснок",
  "Лавровый лист",
  "Паприка",
  "Куркума",
  "Орегано",
  "Базилик сушеный",
  "Тимьян",
  "Корица",
  "Имбирь молотый"
] as const;

export const equipmentOptions = [
  "Сковорода",
  "Кастрюля",
  "Духовка",
  "Микроволновка",
  "Мультиварка",
  "Аэрогриль",
  "Блендер",
  "Миксер",
  "Пароварка",
  "Гриль"
] as const;

export const cuisinePreferencesOptions = [
  "Русская кухня",
  "Итальянская кухня",
  "Азиатская кухня",
  "Средиземноморская кухня",
  "Американская кухня",
  "Французская кухня",
  "Грузинская кухня",
  "Мексиканская кухня"
] as const;

export const dietPreferencesOptions = [
  "Обычное питание",
  "Для похудения",
  "Правильное питание",
  "Вегетарианское",
  "Без глютена",
  "Без лактозы",
  "Высокобелковое"
] as const;

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  password_hash: z.string(),
  base_ingredients: z.array(z.string()).default([]),
  equipment: z.array(z.string()).default([]),
  food_preferences: z.array(z.string()).default([]),
  created_at: z.string().optional()
});

export type User = z.infer<typeof userSchema>;

export const registerUserSchema = z.object({
  name: z.string().min(2, "Имя должно быть не менее 2 символов"),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
  base_ingredients: z.array(z.string()).default([]),
  equipment: z.array(z.string()).default([]),
  food_preferences: z.array(z.string()).default([])
});

export type RegisterUser = z.infer<typeof registerUserSchema>;

export const loginUserSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль")
});

export type LoginUser = z.infer<typeof loginUserSchema>;

export const recipeRequestSchema = z.object({
  ingredients: z.array(z.string()).min(1, "Добавьте хотя бы один ингредиент"),
  cookingTime: z.enum(cookingTimeOptions),
  cookingMethod: z.enum(cookingMethodOptions).optional(),
  foodType: z.enum(foodTypeOptions).optional(),
  userPreferences: z.object({
    baseIngredients: z.array(z.string()).optional(),
    equipment: z.array(z.string()).optional(),
    foodPreferences: z.array(z.string()).optional()
  }).optional()
});

export type RecipeRequest = z.infer<typeof recipeRequestSchema>;

export const ingredientSchema = z.object({
  name: z.string(),
  amount: z.string()
});

export type Ingredient = z.infer<typeof ingredientSchema>;

export const recipeSchema = z.object({
  title: z.string(),
  shortDescription: z.string(),
  description: z.string(),
  cookingTime: z.string(),
  ingredients: z.array(ingredientSchema),
  steps: z.array(z.string()),
  tips: z.string().optional(),
});

export type Recipe = z.infer<typeof recipeSchema>;

export const recipeResponseSchema = z.object({
  recipes: z.array(recipeSchema),
});

export type RecipeResponse = z.infer<typeof recipeResponseSchema>;

export const popularIngredients = [
  "Курица",
  "Говядина",
  "Свинина",
  "Рыба",
  "Яйца",
  "Молоко",
  "Сыр",
  "Творог",
  "Сметана",
  "Масло сливочное",
  "Картофель",
  "Морковь",
  "Лук",
  "Чеснок",
  "Помидоры",
  "Огурцы",
  "Капуста",
  "Перец болгарский",
  "Кабачки",
  "Баклажаны",
  "Грибы",
  "Рис",
  "Гречка",
  "Макароны",
  "Хлеб",
  "Мука",
  "Сахар",
  "Соль",
  "Перец черный",
  "Лимон",
  "Зелень",
  "Укроп",
  "Петрушка",
  "Базилик",
  "Томатная паста",
  "Майонез",
  "Горчица",
  "Соевый соус",
  "Оливковое масло",
  "Подсолнечное масло",
  "Фасоль",
  "Горох",
  "Чечевица",
  "Креветки",
  "Кальмары",
  "Бекон",
  "Колбаса",
  "Ветчина",
  "Авокадо",
  "Брокколи",
  "Цветная капуста",
  "Шпинат",
  "Тыква",
  "Свекла",
  "Редис",
  "Сельдерей",
  "Имбирь",
  "Мёд",
  "Орехи",
  "Изюм",
  "Яблоки",
  "Бананы",
  "Апельсины"
];
