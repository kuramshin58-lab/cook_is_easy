import { z } from "zod";

export const cookingTimeOptions = ["20", "40", "60"] as const;
export type CookingTime = typeof cookingTimeOptions[number];

export const mealTypeOptions = [
  "Breakfast",
  "Main Course",
  "Snack",
  "Salad"
] as const;
export type MealType = typeof mealTypeOptions[number];

export const skillLevelOptions = [
  "Beginner",
  "Intermediate",
  "Expert"
] as const;
export type SkillLevel = typeof skillLevelOptions[number];

export const foodTypeOptions = ["Healthy", "Regular", "Comfort"] as const;
export type FoodType = typeof foodTypeOptions[number];

export const baseIngredientsOptions = [
  "Salt",
  "Black pepper",
  "Sugar",
  "Vegetable oil",
  "Olive oil",
  "Butter",
  "Vinegar",
  "Soy sauce",
  "Flour",
  "Onion",
  "Garlic",
  "Bay leaf",
  "Paprika",
  "Turmeric",
  "Oregano",
  "Dried basil",
  "Thyme",
  "Cinnamon",
  "Ground ginger"
] as const;

export const equipmentOptions = [
  "Frying pan",
  "Pot",
  "Oven",
  "Microwave",
  "Slow cooker",
  "Air fryer",
  "Blender",
  "Mixer",
  "Steamer",
  "Grill"
] as const;

export const cuisinePreferencesOptions = [
  "American",
  "Italian",
  "Asian",
  "Mediterranean",
  "Mexican",
  "French",
  "Indian",
  "Greek"
] as const;

export const dietPreferencesOptions = [
  "Regular",
  "Weight loss",
  "Healthy eating",
  "Vegetarian",
  "Gluten-free",
  "Dairy-free",
  "High protein"
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
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  base_ingredients: z.array(z.string()).default([]),
  equipment: z.array(z.string()).default([]),
  food_preferences: z.array(z.string()).default([])
});

export type RegisterUser = z.infer<typeof registerUserSchema>;

export const loginUserSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter password")
});

export type LoginUser = z.infer<typeof loginUserSchema>;

export const recipeRequestSchema = z.object({
  ingredients: z.array(z.string()).min(1, "Add at least one ingredient"),
  cookingTime: z.enum(cookingTimeOptions),
  mealType: z.enum(mealTypeOptions).optional(),
  skillLevel: z.enum(skillLevelOptions).optional(),
  foodType: z.enum(foodTypeOptions).optional(),
  userPreferences: z.object({
    baseIngredients: z.array(z.string()).optional(),
    equipment: z.array(z.string()).optional(),
    foodPreferences: z.array(z.string()).optional()
  }).optional()
});

export type RecipeRequest = z.infer<typeof recipeRequestSchema>;

// Ingredient categories for weighted scoring
export const ingredientCategoryOptions = ["key", "important", "flavor", "base"] as const;
export type IngredientCategory = typeof ingredientCategoryOptions[number];

// Match types for scoring
export const matchTypeOptions = ["exact", "substitute", "partial", "none"] as const;
export type MatchType = typeof matchTypeOptions[number];

// Legacy simple ingredient schema (for backward compatibility)
export const ingredientSchema = z.object({
  name: z.string(),
  amount: z.string(),
  available: z.boolean().optional()
});

export type Ingredient = z.infer<typeof ingredientSchema>;

// New structured ingredient with category and substitutes
export const structuredIngredientSchema = z.object({
  name: z.string(),
  amount: z.string(),
  category: z.enum(ingredientCategoryOptions).default("important"),
  substitutes: z.array(z.string()).default([]),
  available: z.boolean().optional(),
  matchType: z.enum(matchTypeOptions).optional(),
  matchedWith: z.string().nullable().optional()
});

export type StructuredIngredient = z.infer<typeof structuredIngredientSchema>;

// Match result for detailed ingredient matching info
export const matchResultSchema = z.object({
  ingredient: structuredIngredientSchema,
  matchType: z.enum(matchTypeOptions),
  matchedWith: z.string().nullable(),
  matchSource: z.enum(["main", "base"]).nullable()
});

export type MatchResult = z.infer<typeof matchResultSchema>;

// Match details for API response
export const matchDetailsSchema = z.object({
  exactMatches: z.number(),
  substituteMatches: z.number(),
  missingIngredients: z.array(z.object({
    name: z.string(),
    possibleSubstitutes: z.array(z.string())
  }))
});

export type MatchDetails = z.infer<typeof matchDetailsSchema>;

export const recipeSchema = z.object({
  title: z.string(),
  shortDescription: z.string(),
  description: z.string(),
  cookingTime: z.string(),
  ingredients: z.array(structuredIngredientSchema),
  steps: z.array(z.string()),
  tips: z.string().optional(),
  calories: z.number().optional(),
  protein: z.number().optional(),
  fats: z.number().optional(),
  carbs: z.number().optional(),
  matchPercentage: z.number().optional(),
  isFromDatabase: z.boolean().optional(),
  matchDetails: matchDetailsSchema.optional()
});

export type Recipe = z.infer<typeof recipeSchema>;

export const recipeResponseSchema = z.object({
  recipes: z.array(recipeSchema),
});

export type RecipeResponse = z.infer<typeof recipeResponseSchema>;

export const updateProfileSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  base_ingredients: z.array(z.string()).default([]),
  equipment: z.array(z.string()).default([]),
  food_preferences: z.array(z.string()).default([])
});

export type UpdateProfile = z.infer<typeof updateProfileSchema>;

export const quickAccessIngredients = [
  "Chicken breast",
  "Ground beef",
  "Spaghetti",
  "Rice",
  "Pasta",
  "Tomato paste",
];

export const popularIngredients = [
  // Chicken and poultry
  "Chicken",
  "Chicken breast",
  "Chicken thighs",
  "Chicken wings",
  "Chicken drumsticks",
  "Ground chicken",
  "Turkey",
  "Turkey breast",
  "Duck",
  
  // Beef
  "Beef",
  "Ground beef",
  "Beef tenderloin",
  "Steak",
  "Ribeye",
  "Beef liver",
  
  // Pork
  "Pork",
  "Ground pork",
  "Pork shoulder",
  "Pork chops",
  "Pork ribs",
  "Bacon",
  "Ham",
  "Sausage",
  
  // Lamb
  "Lamb",
  "Ground lamb",
  "Lamb leg",
  
  // Fish
  "Fish",
  "Salmon",
  "Trout",
  "Cod",
  "Tilapia",
  "Tuna",
  "Sea bass",
  "Halibut",
  "Mackerel",
  "Sardines",
  "Fish fillet",
  
  // Seafood
  "Shrimp",
  "Prawns",
  "Squid",
  "Mussels",
  "Octopus",
  "Scallops",
  "Crab",
  "Lobster",
  "Seafood mix",
  
  // Eggs and dairy
  "Eggs",
  "Milk",
  "Heavy cream",
  "Sour cream",
  "Cottage cheese",
  "Yogurt",
  "Greek yogurt",
  "Butter",
  
  // Cheese
  "Cheese",
  "Parmesan",
  "Mozzarella",
  "Cheddar",
  "Feta",
  "Ricotta",
  "Mascarpone",
  "Gorgonzola",
  "Brie",
  "Cream cheese",
  "Goat cheese",
  
  // Vegetables
  "Potato",
  "Carrot",
  "Onion",
  "Red onion",
  "Green onion",
  "Garlic",
  "Tomato",
  "Cherry tomatoes",
  "Sun-dried tomatoes",
  "Cucumber",
  "Cabbage",
  "Bell pepper",
  "Red bell pepper",
  "Yellow bell pepper",
  "Chili pepper",
  "Jalapeno",
  "Zucchini",
  "Eggplant",
  "Broccoli",
  "Cauliflower",
  "Spinach",
  "Pumpkin",
  "Butternut squash",
  "Beets",
  "Radish",
  "Celery",
  "Asparagus",
  "Artichoke",
  "Arugula",
  "Lettuce",
  "Romaine",
  "Kale",
  "Avocado",
  "Corn",
  "Canned corn",
  "Green peas",
  "Green beans",
  "Olives",
  "Capers",
  
  // Mushrooms
  "Mushrooms",
  "Button mushrooms",
  "Portobello",
  "Shiitake",
  "Oyster mushrooms",
  "Porcini",
  "Dried mushrooms",
  
  // Herbs
  "Dill",
  "Parsley",
  "Cilantro",
  "Basil",
  "Fresh basil",
  "Mint",
  "Rosemary",
  "Thyme",
  "Oregano",
  "Tarragon",
  
  // Grains and pasta
  "Rice",
  "Basmati rice",
  "Jasmine rice",
  "Arborio rice",
  "Brown rice",
  "Quinoa",
  "Bulgur",
  "Couscous",
  "Oatmeal",
  "Oats",
  "Pasta",
  "Spaghetti",
  "Penne",
  "Fusilli",
  "Fettuccine",
  "Lasagna sheets",
  "Rice noodles",
  "Egg noodles",
  "Udon",
  
  // Legumes
  "Beans",
  "White beans",
  "Kidney beans",
  "Canned beans",
  "Chickpeas",
  "Lentils",
  "Red lentils",
  "Green lentils",
  "Tofu",
  
  // Bread
  "Bread",
  "White bread",
  "Whole wheat bread",
  "Baguette",
  "Ciabatta",
  "Pita",
  "Tortilla",
  "Breadcrumbs",
  "Puff pastry",
  
  // Sauces and condiments
  "Tomato paste",
  "Ketchup",
  "Mayonnaise",
  "Mustard",
  "Dijon mustard",
  "Soy sauce",
  "Oyster sauce",
  "Fish sauce",
  "Teriyaki",
  "Hot sauce",
  "Worcestershire sauce",
  "Balsamic vinegar",
  "Wine vinegar",
  "Apple cider vinegar",
  "Pesto",
  "Hummus",
  "Tahini",
  "Wasabi",
  
  // Oils
  "Olive oil",
  "Vegetable oil",
  "Sesame oil",
  "Coconut oil",
  
  // Spices
  "Salt",
  "Black pepper",
  "White pepper",
  "Paprika",
  "Smoked paprika",
  "Turmeric",
  "Coriander",
  "Cumin",
  "Curry powder",
  "Garam masala",
  "Cinnamon",
  "Ginger",
  "Fresh ginger",
  "Ground ginger",
  "Nutmeg",
  "Cloves",
  "Cardamom",
  "Bay leaf",
  "Italian herbs",
  "Herbs de Provence",
  
  // Nuts and seeds
  "Walnuts",
  "Almonds",
  "Hazelnuts",
  "Cashews",
  "Peanuts",
  "Pine nuts",
  "Pistachios",
  "Sunflower seeds",
  "Pumpkin seeds",
  "Sesame seeds",
  "Chia seeds",
  "Flax seeds",
  
  // Dried fruits
  "Raisins",
  "Dried apricots",
  "Prunes",
  "Dates",
  "Dried cranberries",
  
  // Fruits
  "Apple",
  "Pear",
  "Banana",
  "Orange",
  "Lemon",
  "Lime",
  "Grapefruit",
  "Grapes",
  "Strawberries",
  "Raspberries",
  "Blueberries",
  "Cherries",
  "Peach",
  "Mango",
  "Pineapple",
  "Kiwi",
  "Pomegranate",
  "Watermelon",
  
  // Baking
  "Flour",
  "Sugar",
  "Powdered sugar",
  "Brown sugar",
  "Honey",
  "Chocolate",
  "Dark chocolate",
  "Milk chocolate",
  "Cocoa powder",
  "Vanilla",
  "Vanilla extract",
  "Baking powder",
  "Baking soda",
  "Yeast",
  "Gelatin",
  "Cornstarch",
  "Condensed milk",
  "Coconut flakes",
  "Coconut milk",
  
  // Canned goods
  "Canned tomatoes",
  "Crushed tomatoes",
  "Canned tuna",
  "Canned beans",
  "Pickles",
  "Sauerkraut",
  
  // Cooking liquids
  "White wine",
  "Red wine",
  "Beer",
  "Chicken broth",
  "Beef broth",
  "Vegetable broth"
];

export interface ReadyRecipe {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  prepTime: string;
  cookingTime: string;
  servings: string;
  ingredients: string;
  steps: string;
  tags: string;
}

export const readyRecipes: ReadyRecipe[] = [];
