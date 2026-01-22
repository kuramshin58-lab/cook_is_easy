import { z } from "zod";

export const cookingTimeOptions = ["20", "40", "60"] as const;
export type CookingTime = typeof cookingTimeOptions[number];

export const mealTypeOptions = [
  "Завтрак",
  "Основное блюдо",
  "Перекус",
  "Салат"
] as const;
export type MealType = typeof mealTypeOptions[number];

export const skillLevelOptions = [
  "Новичок",
  "Средний",
  "Мишлен"
] as const;
export type SkillLevel = typeof skillLevelOptions[number];

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
  calories: z.number().optional(),
  protein: z.number().optional(),
  fats: z.number().optional(),
  carbs: z.number().optional(),
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

// Продукты для быстрого доступа на главной странице (не базовые)
export const quickAccessIngredients = [
  "Куриная грудка",
  "Фарш",
  "Спагетти",
  "Рис",
  "Гречка",
  "Томатная паста",
];

export const popularIngredients = [
  // Курица и птица
  "Курица",
  "Куриная грудка",
  "Куриное филе",
  "Куриные бёдра",
  "Куриные крылья",
  "Куриные ножки",
  "Куриный фарш",
  "Индейка",
  "Филе индейки",
  "Утка",
  
  // Говядина
  "Говядина",
  "Говяжий фарш",
  "Говяжья вырезка",
  "Стейк",
  "Рибай",
  "Говяжья печень",
  
  // Свинина
  "Свинина",
  "Свиной фарш",
  "Свиная шея",
  "Свиная корейка",
  "Свиные рёбрышки",
  "Свиная печень",
  
  // Баранина
  "Баранина",
  "Бараний фарш",
  "Баранья нога",
  
  // Рыба
  "Рыба",
  "Лосось",
  "Сёмга",
  "Форель",
  "Треска",
  "Минтай",
  "Скумбрия",
  "Сельдь",
  "Тунец",
  "Дорадо",
  "Сибас",
  "Судак",
  "Карп",
  "Щука",
  "Тилапия",
  "Пангасиус",
  "Рыбное филе",
  
  // Морепродукты
  "Креветки",
  "Тигровые креветки",
  "Королевские креветки",
  "Кальмары",
  "Мидии",
  "Осьминог",
  "Гребешки",
  "Крабовые палочки",
  "Крабовое мясо",
  "Икра красная",
  "Морской коктейль",
  
  // Мясные изделия
  "Бекон",
  "Колбаса",
  "Сосиски",
  "Ветчина",
  "Сало",
  "Буженина",
  "Карбонад",
  "Копчёная курица",
  "Пастрами",
  
  // Яйца и молочные
  "Яйца",
  "Перепелиные яйца",
  "Молоко",
  "Сливки",
  "Сливки 10%",
  "Сливки 20%",
  "Сливки 33%",
  "Сметана",
  "Творог",
  "Творог обезжиренный",
  "Творог 5%",
  "Творог 9%",
  "Кефир",
  "Ряженка",
  "Йогурт",
  "Греческий йогурт",
  "Масло сливочное",
  
  // Сыры
  "Сыр",
  "Пармезан",
  "Моцарелла",
  "Чеддер",
  "Фета",
  "Брынза",
  "Адыгейский сыр",
  "Рикотта",
  "Маскарпоне",
  "Горгонзола",
  "Бри",
  "Камамбер",
  "Сулугуни",
  "Плавленый сыр",
  "Сливочный сыр",
  "Филадельфия",
  
  // Овощи
  "Картофель",
  "Молодой картофель",
  "Морковь",
  "Лук",
  "Лук репчатый",
  "Лук красный",
  "Лук-порей",
  "Зелёный лук",
  "Чеснок",
  "Помидоры",
  "Помидоры черри",
  "Вяленые томаты",
  "Огурцы",
  "Капуста",
  "Капуста белокочанная",
  "Капуста пекинская",
  "Капуста краснокочанная",
  "Брюссельская капуста",
  "Перец болгарский",
  "Перец красный",
  "Перец жёлтый",
  "Перец зелёный",
  "Перец чили",
  "Халапеньо",
  "Кабачки",
  "Цукини",
  "Баклажаны",
  "Брокколи",
  "Цветная капуста",
  "Шпинат",
  "Тыква",
  "Свекла",
  "Редис",
  "Редька",
  "Дайкон",
  "Сельдерей",
  "Стебли сельдерея",
  "Корень сельдерея",
  "Спаржа",
  "Артишок",
  "Руккола",
  "Салат айсберг",
  "Салат романо",
  "Листовой салат",
  "Кресс-салат",
  "Авокадо",
  "Кукуруза",
  "Консервированная кукуруза",
  "Зелёный горошек",
  "Консервированный горошек",
  "Стручковая фасоль",
  "Оливки",
  "Маслины",
  "Каперсы",
  
  // Грибы
  "Грибы",
  "Шампиньоны",
  "Вешенки",
  "Белые грибы",
  "Лисички",
  "Опята",
  "Маслята",
  "Шиитаке",
  "Портобелло",
  "Сушёные грибы",
  "Маринованные грибы",
  
  // Зелень и травы
  "Зелень",
  "Укроп",
  "Петрушка",
  "Кинза",
  "Базилик",
  "Базилик свежий",
  "Мята",
  "Розмарин",
  "Тимьян",
  "Орегано",
  "Эстрагон",
  "Щавель",
  
  // Крупы и макароны
  "Рис",
  "Рис басмати",
  "Рис жасмин",
  "Рис арборио",
  "Рис бурый",
  "Гречка",
  "Булгур",
  "Кускус",
  "Киноа",
  "Перловка",
  "Пшено",
  "Овсянка",
  "Овсяные хлопья",
  "Манка",
  "Макароны",
  "Спагетти",
  "Паста пенне",
  "Паста фузилли",
  "Феттучини",
  "Лазанья листы",
  "Рисовая лапша",
  "Фунчоза",
  "Удон",
  "Яичная лапша",
  
  // Бобовые
  "Фасоль",
  "Фасоль белая",
  "Фасоль красная",
  "Фасоль консервированная",
  "Горох",
  "Нут",
  "Чечевица",
  "Чечевица красная",
  "Чечевица зелёная",
  "Соевые бобы",
  "Тофу",
  
  // Хлеб и выпечка
  "Хлеб",
  "Хлеб белый",
  "Хлеб чёрный",
  "Багет",
  "Чиабатта",
  "Лаваш",
  "Тортилья",
  "Лепёшка",
  "Питта",
  "Панировочные сухари",
  "Слоёное тесто",
  "Дрожжевое тесто",
  
  // Соусы и приправы
  "Томатная паста",
  "Кетчуп",
  "Майонез",
  "Горчица",
  "Горчица дижонская",
  "Соевый соус",
  "Устричный соус",
  "Рыбный соус",
  "Терияки",
  "Табаско",
  "Ворчестерский соус",
  "Бальзамический уксус",
  "Винный уксус",
  "Яблочный уксус",
  "Песто",
  "Хумус",
  "Тахини",
  "Васаби",
  "Аджика",
  "Ткемали",
  "Сацебели",
  "Сметанный соус",
  "Сливочный соус",
  
  // Масла
  "Оливковое масло",
  "Подсолнечное масло",
  "Кунжутное масло",
  "Кокосовое масло",
  "Масло виноградных косточек",
  "Льняное масло",
  
  // Специи
  "Соль",
  "Перец черный",
  "Перец белый",
  "Паприка",
  "Паприка копчёная",
  "Куркума",
  "Кориандр",
  "Зира",
  "Карри",
  "Гарам масала",
  "Корица",
  "Имбирь",
  "Имбирь свежий",
  "Имбирь молотый",
  "Мускатный орех",
  "Гвоздика",
  "Кардамон",
  "Лавровый лист",
  "Хмели-сунели",
  "Прованские травы",
  "Итальянские травы",
  
  // Орехи и семена
  "Орехи",
  "Грецкие орехи",
  "Миндаль",
  "Фундук",
  "Кешью",
  "Арахис",
  "Кедровые орехи",
  "Фисташки",
  "Семечки подсолнечника",
  "Семена тыквы",
  "Кунжут",
  "Семена чиа",
  "Семена льна",
  
  // Сухофрукты
  "Изюм",
  "Курага",
  "Чернослив",
  "Финики",
  "Инжир сушёный",
  "Клюква сушёная",
  
  // Фрукты и ягоды
  "Яблоки",
  "Груши",
  "Бананы",
  "Апельсины",
  "Лимон",
  "Лайм",
  "Грейпфрут",
  "Мандарины",
  "Виноград",
  "Клубника",
  "Малина",
  "Черника",
  "Голубика",
  "Смородина",
  "Вишня",
  "Черешня",
  "Персики",
  "Нектарины",
  "Абрикосы",
  "Сливы",
  "Манго",
  "Ананас",
  "Киви",
  "Гранат",
  "Хурма",
  "Арбуз",
  "Дыня",
  
  // Сладкое и выпечка
  "Мука",
  "Сахар",
  "Сахарная пудра",
  "Коричневый сахар",
  "Мёд",
  "Шоколад",
  "Тёмный шоколад",
  "Молочный шоколад",
  "Какао",
  "Ваниль",
  "Ванильный сахар",
  "Разрыхлитель",
  "Сода",
  "Дрожжи",
  "Желатин",
  "Крахмал",
  "Сгущёнка",
  "Варёная сгущёнка",
  "Кокосовая стружка",
  "Кокосовое молоко",
  
  // Консервы
  "Консервированные томаты",
  "Томаты в собственном соку",
  "Тунец консервированный",
  "Сардины",
  "Шпроты",
  "Консервированная фасоль",
  "Маринованные огурцы",
  "Квашеная капуста",
  
  // Напитки для готовки
  "Белое вино",
  "Красное вино",
  "Пиво",
  "Куриный бульон",
  "Говяжий бульон",
  "Овощной бульон"
];

// Готовые рецепты (статические данные)
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

export const readyRecipes: ReadyRecipe[] = [
  {
    id: 1,
    title: "Cheesy air fryer tortilla quiche",
    description: "This air fryer tortilla quiche is a genius hack for a quick and delicious breakfast or brunch. With eggs, veggies, and cheese baked in tortillas, it's the perfect combo of convenience and flavor.",
    difficulty: "Easy",
    prepTime: "10 min",
    cookingTime: "15 min",
    servings: "2 portions",
    ingredients: "4 eggs, 2 flour tortillas, 100g cheese, 1 bell pepper, handful spinach, salt, pepper",
    steps: "1. Line air fryer basket with tortillas. 2. Whisk eggs with salt and pepper. 3. Add chopped veggies and cheese. 4. Pour into tortillas. 5. Air fry at 180°C for 12-15 min.",
    tags: "breakfast, quick, vegetarian"
  },
  {
    id: 2,
    title: "Creamy white bean dip with herb oil",
    description: "Silky, creamy, and downright addictive, this dip is the perfect companion for crunchy veggies, pita chips, or a simple slice of sourdough. Ready in under 10 minutes!",
    difficulty: "Easy",
    prepTime: "5 min",
    cookingTime: "5 min",
    servings: "4 portions",
    ingredients: "400g cannellini beans, 2 cloves garlic, 3 tbsp olive oil, lemon juice, fresh herbs, salt",
    steps: "1. Blend beans with garlic and lemon. 2. Drizzle with olive oil. 3. Season to taste. 4. Top with herb oil.",
    tags: "appetizer, vegan, quick"
  },
  {
    id: 3,
    title: "Hungarian lecso",
    description: "This recipe is one of the most famous in Hungary, similar to ratatouille. Perfect to serve on a slice of bread for a light dinner!",
    difficulty: "Easy",
    prepTime: "10 min",
    cookingTime: "30 min",
    servings: "2 portions",
    ingredients: "1 onion, 2 cloves garlic, 3 bell peppers, 4 tomatoes, 2 tbsp oil, paprika, salt",
    steps: "1. Sauté onion and garlic. 2. Add sliced peppers. 3. Cook until soft. 4. Add tomatoes and paprika. 5. Simmer 20 min.",
    tags: "hungarian, vegetarian, dinner"
  },
  {
    id: 4,
    title: "French toasted bagel with strawberries",
    description: "Upgrade your French toast with this bagel version that's crispy on the outside, soft on the inside, topped with mascarpone and fresh strawberries.",
    difficulty: "Easy",
    prepTime: "10 min",
    cookingTime: "10 min",
    servings: "2 portions",
    ingredients: "2 bagels, 2 eggs, milk, cinnamon, mascarpone, strawberries, pistachios, honey",
    steps: "1. Slice bagels in half. 2. Dip in egg mixture. 3. Fry until golden. 4. Top with mascarpone, berries, and nuts.",
    tags: "breakfast, sweet, brunch"
  },
  {
    id: 5,
    title: "Red cabbage hash browns",
    description: "These beauties are crispy on the outside, tender on the inside, and absolutely bursting with flavor. Paired with garlic mushrooms and kale.",
    difficulty: "Medium",
    prepTime: "15 min",
    cookingTime: "20 min",
    servings: "2 portions",
    ingredients: "Half red cabbage, 2 eggs, flour, garlic, mushrooms, kale, oil, salt, pepper",
    steps: "1. Shred cabbage finely. 2. Mix with egg and flour. 3. Form patties and fry. 4. Sauté mushrooms and kale. 5. Serve together.",
    tags: "vegetarian, healthy, dinner"
  },
  {
    id: 6,
    title: "Hearty barley risotto with mushrooms",
    description: "Swapping Arborio rice for barley gives this dish a wonderfully nutty flavor and a satisfying, chewy texture that feels even more comforting.",
    difficulty: "Medium",
    prepTime: "10 min",
    cookingTime: "40 min",
    servings: "4 portions",
    ingredients: "200g barley, 300g mushrooms, onion, garlic, vegetable broth, thyme, parmesan, butter",
    steps: "1. Toast barley. 2. Sauté mushrooms separately. 3. Add broth gradually. 4. Stir in mushrooms and thyme. 5. Finish with parmesan.",
    tags: "dinner, comfort food, vegetarian"
  },
  {
    id: 7,
    title: "Paprika chicken thighs with roasted vegetables",
    description: "Everything roasts together on one sheet pan, meaning minimal cleanup and maximum flavor. The chicken thighs get wonderfully crispy!",
    difficulty: "Easy",
    prepTime: "15 min",
    cookingTime: "45 min",
    servings: "4 portions",
    ingredients: "8 chicken thighs, paprika, potatoes, bell peppers, onion, garlic, olive oil, salt",
    steps: "1. Rub chicken with paprika and oil. 2. Chop vegetables. 3. Arrange on baking sheet. 4. Roast at 200°C for 45 min.",
    tags: "dinner, one-pan, chicken"
  },
  {
    id: 8,
    title: "Creamy one-pot French onion pasta",
    description: "Imagine all the flavors of French onion soup but in a comforting, creamy pasta form. The secret is slowly caramelizing the onions.",
    difficulty: "Medium",
    prepTime: "10 min",
    cookingTime: "35 min",
    servings: "4 portions",
    ingredients: "400g pasta, 4 large onions, butter, white wine, gruyère cheese, thyme, beef broth",
    steps: "1. Caramelize onions slowly. 2. Add wine and broth. 3. Cook pasta in the sauce. 4. Stir in cheese. 5. Serve with extra cheese.",
    tags: "pasta, comfort food, french"
  },
  {
    id: 9,
    title: "Whole roasted broccoli with bean hummus",
    description: "Roasting the broccoli whole creates an incredible contrast of textures: crispy, charred florets on the outside and tender stems inside.",
    difficulty: "Medium",
    prepTime: "15 min",
    cookingTime: "30 min",
    servings: "2 portions",
    ingredients: "1 large broccoli, cannellini beans, tahini, garlic, sumac, butter, lemon, herbs",
    steps: "1. Roast whole broccoli at 200°C. 2. Blend beans for hummus. 3. Make sumac butter. 4. Serve broccoli over hummus with butter.",
    tags: "vegetarian, healthy, dinner"
  },
  {
    id: 10,
    title: "Mediterranean cabbage rolls with lentils",
    description: "Cabbage rolls get a Mediterranean makeover! Packed with protein-rich lentils, tender zucchini, and aromatic herbs.",
    difficulty: "Medium",
    prepTime: "25 min",
    cookingTime: "40 min",
    servings: "4 portions",
    ingredients: "1 cabbage, 200g lentils, 2 zucchini, tomato sauce, herbs, onion, garlic, olive oil",
    steps: "1. Blanch cabbage leaves. 2. Cook lentil filling. 3. Roll in cabbage leaves. 4. Bake in tomato sauce for 40 min.",
    tags: "vegetarian, mediterranean, dinner"
  },
  {
    id: 11,
    title: "Pumpkin pie overnight oats",
    description: "Start your morning with the cozy flavors of pumpkin pie – no baking required! Prep the night before for an easy breakfast.",
    difficulty: "Easy",
    prepTime: "10 min",
    cookingTime: "0 min",
    servings: "1 portion",
    ingredients: "50g oats, 100ml milk, 2 tbsp pumpkin puree, maple syrup, cinnamon, ginger, nutmeg, yogurt",
    steps: "1. Mix oats with milk. 2. Add pumpkin and spices. 3. Refrigerate overnight. 4. Top with yogurt and nuts.",
    tags: "breakfast, healthy, meal prep"
  },
  {
    id: 12,
    title: "Juicy Shirazi Salad (Persian Salad)",
    description: "This Persian Shirazi salad is a burst of freshness! Crisp cucumbers, juicy tomatoes, and crunchy onions with a zesty lime dressing.",
    difficulty: "Easy",
    prepTime: "15 min",
    cookingTime: "0 min",
    servings: "4 portions",
    ingredients: "4 cucumbers, 4 tomatoes, 1 onion, fresh mint, lime juice, olive oil, salt",
    steps: "1. Dice all vegetables small. 2. Mix with herbs. 3. Dress with lime and oil. 4. Serve chilled.",
    tags: "salad, persian, vegan"
  },
  {
    id: 13,
    title: "Creamy roasted red pepper soup",
    description: "This roasted red pepper soup is like sunshine in a bowl – vibrant, warming, and utterly delicious! Perfect for meal prep.",
    difficulty: "Easy",
    prepTime: "15 min",
    cookingTime: "30 min",
    servings: "4 portions",
    ingredients: "6 red peppers, onion, garlic, vegetable broth, cream, basil, olive oil",
    steps: "1. Roast peppers until charred. 2. Sauté onion and garlic. 3. Blend with broth. 4. Add cream and serve.",
    tags: "soup, vegetarian, comfort food"
  },
  {
    id: 14,
    title: "Baked eggs in tomato sauce (Shakshuka)",
    description: "Shakshuka is the ultimate comfort food – a one-pan wonder that's perfect for any meal! Eggs poached in rich, spicy tomato sauce.",
    difficulty: "Easy",
    prepTime: "10 min",
    cookingTime: "25 min",
    servings: "2 portions",
    ingredients: "4 eggs, 400g tomatoes, 1 bell pepper, onion, garlic, cumin, paprika, feta cheese",
    steps: "1. Sauté onion and pepper. 2. Add tomatoes and spices. 3. Simmer until thick. 4. Make wells, add eggs. 5. Cover and cook.",
    tags: "breakfast, middle eastern, vegetarian"
  },
  {
    id: 15,
    title: "Crispy coconut tofu with sweet chili sauce",
    description: "If you think tofu is bland, this crispy coconut version will change your mind! Crunchy outside, tender inside.",
    difficulty: "Medium",
    prepTime: "20 min",
    cookingTime: "20 min",
    servings: "2 portions",
    ingredients: "400g tofu, coconut flakes, panko breadcrumbs, flour, eggs, sweet chili sauce",
    steps: "1. Press and cube tofu. 2. Coat in flour, egg, coconut-panko mix. 3. Bake or fry until golden. 4. Serve with sauce.",
    tags: "vegan option, asian, dinner"
  },
  {
    id: 16,
    title: "Spicy Korean gochujang noodles",
    description: "These Korean-inspired noodles are packed with flavor and come together in less than 20 minutes! Spicy, savory, and satisfying.",
    difficulty: "Easy",
    prepTime: "5 min",
    cookingTime: "15 min",
    servings: "2 portions",
    ingredients: "200g noodles, 2 tbsp gochujang, soy sauce, sesame oil, honey, garlic, green onions, sesame seeds",
    steps: "1. Cook noodles. 2. Mix sauce ingredients. 3. Toss noodles with sauce. 4. Top with green onions and sesame.",
    tags: "korean, quick, spicy"
  },
  {
    id: 17,
    title: "Turkish candied pumpkin (Kabak tatlısı)",
    description: "This traditional Turkish dessert turns humble pumpkin into something magical! Slowly cooked with sugar until translucent and sweet.",
    difficulty: "Easy",
    prepTime: "10 min",
    cookingTime: "60 min",
    servings: "6 portions",
    ingredients: "1kg pumpkin, 400g sugar, walnuts, tahini or clotted cream",
    steps: "1. Cut pumpkin into wedges. 2. Cover with sugar overnight. 3. Bake slowly at 150°C. 4. Serve with walnuts and cream.",
    tags: "dessert, turkish, vegan"
  },
  {
    id: 18,
    title: "Crispy potato galette with smoked salmon",
    description: "Fresh from the oven, straight onto your plate! Crispy edges, soft potato inside, topped with crème fraîche and smoked salmon.",
    difficulty: "Medium",
    prepTime: "20 min",
    cookingTime: "40 min",
    servings: "4 portions",
    ingredients: "600g potatoes, butter, crème fraîche, 200g smoked salmon, dill, capers, lemon",
    steps: "1. Slice potatoes thin. 2. Layer in buttered pan. 3. Bake until crispy. 4. Top with cream, salmon, and herbs.",
    tags: "brunch, french, seafood"
  },
  {
    id: 19,
    title: "Carrot salad with crispy Beluga lentils",
    description: "This carrot salad has it all: crunchy carrot ribbons, sweet dried apricots, earthy hazelnuts, and crispy roasted lentils.",
    difficulty: "Medium",
    prepTime: "20 min",
    cookingTime: "25 min",
    servings: "2 portions",
    ingredients: "4 carrots, 150g beluga lentils, dried apricots, hazelnuts, ras el hanout, lemon, parsley, sherry vinegar",
    steps: "1. Roast lentils until crispy. 2. Shave carrots into ribbons. 3. Toast hazelnuts. 4. Combine with dressing and herbs.",
    tags: "salad, healthy, vegan"
  },
  {
    id: 20,
    title: "Fried pumpkin and chorizo pasta",
    description: "Fall season is all about being cozy! Orecchiette pasta hugging fried pumpkin pieces and spicy chorizo – pure comfort.",
    difficulty: "Medium",
    prepTime: "15 min",
    cookingTime: "25 min",
    servings: "4 portions",
    ingredients: "400g orecchiette, 300g pumpkin, 150g chorizo, sage, parmesan, butter, garlic",
    steps: "1. Cube and fry pumpkin. 2. Cook chorizo until crispy. 3. Cook pasta. 4. Combine with sage butter and parmesan.",
    tags: "pasta, autumn, comfort food"
  },
  {
    id: 21,
    title: "Easy tempeh stir-fry with crunchy veggies",
    description: "Quick to make, packed with flavor and full of plant protein! Tempeh is fried until crispy, then coated in a glossy sweet-salty sauce.",
    difficulty: "Easy",
    prepTime: "15 min",
    cookingTime: "15 min",
    servings: "2 portions",
    ingredients: "200g tempeh, broccoli, bell pepper, snap peas, soy sauce, sesame oil, ginger, garlic, honey",
    steps: "1. Cube and fry tempeh. 2. Stir-fry vegetables. 3. Make sauce. 4. Combine and serve over rice.",
    tags: "vegan, asian, healthy"
  },
  {
    id: 22,
    title: "Warm bulgur salad with roasted zucchini",
    description: "Let bulgur salad prove itself to be a really cozy dish! Mediterranean flavors with zucchini, radicchio, and grapes.",
    difficulty: "Medium",
    prepTime: "15 min",
    cookingTime: "20 min",
    servings: "2 portions",
    ingredients: "150g bulgur, 2 zucchini, radicchio, grapes, brown butter, feta, walnuts, herbs",
    steps: "1. Cook bulgur. 2. Roast zucchini. 3. Fry radicchio in brown butter. 4. Combine with grapes, feta, and walnuts.",
    tags: "salad, mediterranean, vegetarian"
  }
];
