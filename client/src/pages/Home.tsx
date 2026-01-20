import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IngredientInput } from "@/components/IngredientInput";
import { 
  ChefHat, 
  Sparkles, 
  Clock, 
  Heart, 
  Utensils, 
  ShoppingBag, 
  ArrowRight, 
  Check,
  Flame,
  Salad,
  Soup,
  Timer,
  CookingPot,
  Microwave,
  Search
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { 
  cookingTimeOptions, 
  mealTypeOptions, 
  skillLevelOptions,
  foodTypeOptions,
  type CookingTime,
  type MealType,
  type SkillLevel,
  type FoodType,
  type RecipeRequest
} from "@shared/schema";

function Landing() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: ShoppingBag,
      title: "Из того, что есть",
      description: "Рецепты из продуктов в холодильнике"
    },
    {
      icon: Heart,
      title: "Персонализация",
      description: "Учитываем ваши вкусы и предпочтения"
    },
    {
      icon: Clock,
      title: "Экономия времени",
      description: "Выбирайте время готовки"
    },
    {
      icon: Utensils,
      title: "5 рецептов",
      description: "Уникальные рецепты от AI"
    }
  ];

  const benefits = [
    "Не нужно думать, что приготовить",
    "Рецепты из имеющихся продуктов",
    "Персонализация под ваши вкусы",
    "Подробные пошаговые инструкции",
    "Список недостающих ингредиентов"
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="container max-w-4xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <ChefHat className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-landing-title">
            Что приготовить сегодня?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Введите продукты, которые у вас есть, и AI подберёт 5 уникальных рецептов
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => setLocation("/register")}
              data-testid="button-start-free"
            >
              Начать бесплатно
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setLocation("/login")}
              data-testid="button-login-landing"
            >
              У меня есть аккаунт
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-12 md:py-16">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Как это работает
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-md hover-elevate cursor-default">
                <CardContent className="p-5 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1" data-testid={`text-feature-title-${index}`}>
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Преимущества
              </h2>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm" data-testid={`text-benefit-${index}`}>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1">
              <Card className="bg-primary/5 border-primary/20 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl font-bold text-primary mb-2">5</div>
                  <div className="text-lg font-medium mb-1">уникальных рецептов</div>
                  <p className="text-sm text-muted-foreground">
                    за каждый запрос с учётом ваших предпочтений
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary/5 py-12 md:py-16">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Готовы начать?
          </h2>
          <p className="text-muted-foreground mb-8">
            Зарегистрируйтесь за минуту и получите персональные рецепты
          </p>
          <Button 
            size="lg" 
            className="gap-2"
            onClick={() => setLocation("/register")}
            data-testid="button-register-bottom"
          >
            <Sparkles className="h-4 w-4" />
            Создать аккаунт
          </Button>
        </div>
      </section>
    </div>
  );
}

const cookingTimeLabels: Record<CookingTime, { label: string; icon: typeof Timer }> = {
  "20": { label: "20 мин", icon: Timer },
  "40": { label: "40 мин", icon: Timer },
  "60": { label: "1 час", icon: Clock },
};

const mealTypeLabels: Record<MealType, { label: string; icon: typeof Flame }> = {
  "Завтрак": { label: "Завтрак", icon: Soup },
  "Основное блюдо": { label: "Основное блюдо", icon: CookingPot },
  "Перекус": { label: "Перекус", icon: Utensils },
  "Салат": { label: "Салат", icon: Salad },
};

const skillLevelLabels: Record<SkillLevel, { label: string; color: string }> = {
  "Новичок": { label: "Новичок", color: "bg-green-100 text-green-700 border-green-200" },
  "Средний": { label: "Средний", color: "bg-blue-100 text-blue-700 border-blue-200" },
  "Мишлен": { label: "Мишлен", color: "bg-purple-100 text-purple-700 border-purple-200" },
};

const foodTypeLabels: Record<FoodType, { label: string; color: string }> = {
  "ПП": { label: "ПП", color: "bg-green-100 text-green-700 border-green-200" },
  "Обычная": { label: "Обычная", color: "bg-blue-100 text-blue-700 border-blue-200" },
  "Жирная": { label: "Жирная", color: "bg-orange-100 text-orange-700 border-orange-200" },
};

function RecipeGenerator() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [cookingTime, setCookingTime] = useState<CookingTime>("40");
  const [mealType, setMealType] = useState<MealType | undefined>();
  const [skillLevel, setSkillLevel] = useState<SkillLevel | undefined>();
  const [foodType, setFoodType] = useState<FoodType | undefined>();

  const handleAddIngredient = (ingredient: string) => {
    if (!ingredients.includes(ingredient)) {
      setIngredients([...ingredients, ingredient]);
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const handleSubmit = () => {
    if (ingredients.length === 0) return;

    const request: RecipeRequest = {
      ingredients,
      cookingTime,
      mealType,
      skillLevel,
      foodType,
      userPreferences: user ? {
        baseIngredients: user.base_ingredients,
        equipment: user.equipment,
        foodPreferences: user.food_preferences
      } : undefined
    };

    const combinedIngredients = user 
      ? [...ingredients, ...user.base_ingredients]
      : ingredients;
    const allUserIngredients = Array.from(new Set(combinedIngredients));
    
    sessionStorage.setItem("recipeRequest", JSON.stringify(request));
    sessionStorage.setItem("userIngredients", JSON.stringify(allUserIngredients));
    setLocation("/recipes");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto px-4 py-6">
        <header className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-semibold text-primary">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Привет,</p>
            <p className="font-semibold">{user?.name || "Гость"}</p>
          </div>
        </header>

        <h1 className="text-2xl md:text-3xl font-bold mb-6" data-testid="text-generator-title">
          Что готовим сегодня?
        </h1>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <div className="pl-12">
            <IngredientInput
              selectedIngredients={ingredients}
              onAdd={handleAddIngredient}
              onRemove={handleRemoveIngredient}
            />
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-muted-foreground mb-3">Время готовки</p>
          <div className="grid grid-cols-3 gap-3">
            {cookingTimeOptions.map((time) => {
              const config = cookingTimeLabels[time];
              const isSelected = cookingTime === time;
              return (
                <Card 
                  key={time}
                  onClick={() => setCookingTime(time)}
                  className={`cursor-pointer transition-all border-2 shadow-sm hover-elevate ${
                    isSelected 
                      ? "border-primary bg-primary/5" 
                      : "border-transparent hover:border-muted"
                  }`}
                  data-testid={`button-time-${time}`}
                >
                  <CardContent className="p-4 text-center">
                    <config.icon className={`h-6 w-6 mx-auto mb-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${isSelected ? "text-primary" : ""}`}>
                      {config.label}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-muted-foreground mb-3">Тип блюда</p>
          <div className="grid grid-cols-2 gap-3">
            {mealTypeOptions.map((type) => {
              const config = mealTypeLabels[type];
              const isSelected = mealType === type;
              return (
                <Card 
                  key={type}
                  onClick={() => setMealType(isSelected ? undefined : type)}
                  className={`cursor-pointer transition-all border-2 shadow-sm hover-elevate ${
                    isSelected 
                      ? "border-primary bg-primary/5" 
                      : "border-transparent hover:border-muted"
                  }`}
                  data-testid={`button-meal-${type}`}
                >
                  <CardContent className="p-4 text-center">
                    <config.icon className={`h-6 w-6 mx-auto mb-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${isSelected ? "text-primary" : ""}`}>
                      {config.label}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-muted-foreground mb-3">Уровень готовки</p>
          <div className="flex flex-wrap gap-2">
            {skillLevelOptions.map((level) => {
              const config = skillLevelLabels[level];
              const isSelected = skillLevel === level;
              return (
                <Badge
                  key={level}
                  variant="outline"
                  onClick={() => setSkillLevel(isSelected ? undefined : level)}
                  className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                    isSelected 
                      ? config.color + " border"
                      : "bg-background hover:bg-muted"
                  }`}
                  data-testid={`button-skill-${level}`}
                >
                  {config.label}
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground mb-3">Стиль питания</p>
          <div className="flex flex-wrap gap-2">
            {foodTypeOptions.map((type) => {
              const config = foodTypeLabels[type];
              const isSelected = foodType === type;
              return (
                <Badge
                  key={type}
                  variant="outline"
                  onClick={() => setFoodType(isSelected ? undefined : type)}
                  className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                    isSelected 
                      ? config.color + " border"
                      : "bg-background hover:bg-muted"
                  }`}
                  data-testid={`button-type-${type}`}
                >
                  {config.label}
                </Badge>
              );
            })}
          </div>
        </div>

        <Button
          size="lg"
          className="w-full gap-2 shadow-lg"
          onClick={handleSubmit}
          disabled={ingredients.length === 0}
          data-testid="button-generate"
        >
          <Sparkles className="h-5 w-5" />
          Показать рецепты
        </Button>

        {ingredients.length === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Добавьте продукты для поиска рецептов
          </p>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <RecipeGenerator /> : <Landing />;
}
