import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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

export const recipeRequestSchema = z.object({
  ingredients: z.array(z.string()).min(1, "Добавьте хотя бы один ингредиент"),
  cookingTime: z.enum(cookingTimeOptions),
  cookingMethod: z.enum(cookingMethodOptions).optional(),
  foodType: z.enum(foodTypeOptions).optional(),
});

export type RecipeRequest = z.infer<typeof recipeRequestSchema>;

export const recipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  cookingTime: z.string(),
  ingredients: z.array(z.string()),
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
