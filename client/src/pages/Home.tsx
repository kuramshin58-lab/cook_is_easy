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
  Salad,
  Soup,
  Timer,
  CookingPot
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  cookingTimeOptions,
  mealTypeOptions,
  type CookingTime,
  type MealType,
  type RecipeRequest
} from "@shared/schema";

function Landing() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: ShoppingBag,
      title: "Use What You Have",
      description: "Recipes from ingredients in your fridge",
      emoji: "🥕"
    },
    {
      icon: Heart,
      title: "Personalization",
      description: "Tailored to your taste preferences",
      emoji: "💚"
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "Choose your cooking time",
      emoji: "⏱️"
    },
    {
      icon: Utensils,
      title: "5 Recipes",
      description: "Unique AI-generated recipes",
      emoji: "✨"
    }
  ];

  const benefits = [
    "No more wondering what to cook",
    "Recipes from available ingredients",
    "Personalized to your preferences",
    "Detailed step-by-step instructions",
    "List of missing ingredients"
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-10 w-80 h-80 bg-secondary/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-accent/20 rounded-full blur-2xl" />
      </div>

      <section className="container max-w-4xl mx-auto px-4 py-12 md:py-20 relative">
        <div className="text-center mb-12">
          {/* Animated chef hat with food emojis */}
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-lg">
              <span className="text-5xl">🍳</span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-lg shadow-md animate-bounce">
              ✨
            </div>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-foreground" data-testid="text-landing-title">
            What to cook today?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Enter the ingredients you have, and AI will suggest <span className="text-primary font-semibold">5 unique recipes</span> just for you
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="gap-2 rounded-full px-8 shadow-lg hover:shadow-xl transition-all"
              onClick={() => setLocation("/register")}
              data-testid="button-start-free"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8"
              onClick={() => setLocation("/login")}
              data-testid="button-login-landing"
            >
              I have an account
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-card/50 backdrop-blur-sm py-12 md:py-16 border-y border-border/50 relative">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-center mb-10">
            How It Works
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-md hover:shadow-lg transition-all bg-card/80 backdrop-blur-sm group cursor-default"
              >
                <CardContent className="p-5 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">{feature.emoji}</span>
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

      <section className="py-12 md:py-16 relative">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">
                Benefits
              </h2>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3 group">
                    <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm" data-testid={`text-benefit-${index}`}>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1">
              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl font-serif font-bold text-primary mb-2">5</div>
                  <div className="text-lg font-semibold mb-1">unique recipes</div>
                  <p className="text-sm text-muted-foreground">
                    per request based on your preferences
                  </p>
                  <div className="flex justify-center gap-2 mt-4 text-2xl">
                    <span>🍝</span>
                    <span>🥗</span>
                    <span>🍲</span>
                    <span>🥘</span>
                    <span>🍜</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-12 md:py-16 relative">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <div className="text-4xl mb-4">👨‍🍳</div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">
            Ready to start?
          </h2>
          <p className="text-muted-foreground mb-8">
            Sign up in a minute and get personalized recipes
          </p>
          <Button
            size="lg"
            className="gap-2 rounded-full px-8 shadow-lg hover:shadow-xl transition-all"
            onClick={() => setLocation("/register")}
            data-testid="button-register-bottom"
          >
            <Sparkles className="h-4 w-4" />
            Create Account
          </Button>
        </div>
      </section>
    </div>
  );
}

const cookingTimeLabels: Record<CookingTime, { label: string; emoji: string }> = {
  "20": { label: "20 min", emoji: "⚡" },
  "40": { label: "40 min", emoji: "⏱️" },
  "60": { label: "1 hour", emoji: "🕐" },
};

const mealTypeLabels: Record<MealType, { label: string; emoji: string }> = {
  "Breakfast": { label: "Breakfast", emoji: "🍳" },
  "Main Course": { label: "Main Course", emoji: "🍽️" },
  "Snack": { label: "Snack", emoji: "🥪" },
  "Salad": { label: "Salad", emoji: "🥗" },
};

function RecipeGenerator() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [cookingTime, setCookingTime] = useState<CookingTime>("40");
  const [mealType, setMealType] = useState<MealType | undefined>();

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
      userPreferences: user ? {
        baseIngredients: user.base_ingredients,
        equipment: user.equipment,
        foodPreferences: user.food_preferences
      } : undefined
    };

    const baseIngredients = user?.base_ingredients || [];
    const combinedIngredients = [...ingredients, ...baseIngredients];
    const allUserIngredients = Array.from(new Set(combinedIngredients));

    sessionStorage.setItem("recipeRequest", JSON.stringify(request));
    sessionStorage.setItem("userIngredients", JSON.stringify(allUserIngredients));
    setLocation("/recipes");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-lg mx-auto px-4 py-6 relative">
        {/* Greeting Header */}
        <header className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-md">
            <span className="text-xl font-serif font-bold text-primary">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Hello,</p>
            <p className="font-semibold text-lg">{user?.name || "Guest"}</p>
          </div>
          <div className="ml-auto text-3xl">👋</div>
        </header>

        {/* Title */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2 text-foreground" data-testid="text-generator-title">
            What are we cooking today?
          </h1>
          <p className="text-muted-foreground">
            Add your ingredients and discover delicious recipes
          </p>
        </div>

        {/* Ingredient Input */}
        <Card className="mb-8 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-xl">🥕</span>
              </div>
              <div>
                <p className="font-medium">Your Ingredients</p>
                <p className="text-xs text-muted-foreground">What's in your fridge?</p>
              </div>
            </div>
            <IngredientInput
              selectedIngredients={ingredients}
              onAdd={handleAddIngredient}
              onRemove={handleRemoveIngredient}
            />
          </CardContent>
        </Card>

        {/* Cooking Time */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Timer className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">Cooking Time</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {cookingTimeOptions.map((time) => {
              const config = cookingTimeLabels[time];
              const isSelected = cookingTime === time;
              return (
                <Card
                  key={time}
                  onClick={() => setCookingTime(time)}
                  className={`cursor-pointer transition-all border-2 shadow-sm hover:shadow-md ${
                    isSelected
                      ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5"
                      : "border-transparent bg-card/80 hover:border-muted"
                  }`}
                  data-testid={`button-time-${time}`}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-1">{config.emoji}</div>
                    <span className={`text-sm font-medium ${isSelected ? "text-primary" : ""}`}>
                      {config.label}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Meal Type */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">Meal Type</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {mealTypeOptions.map((type) => {
              const config = mealTypeLabels[type];
              const isSelected = mealType === type;
              return (
                <Card
                  key={type}
                  onClick={() => setMealType(isSelected ? undefined : type)}
                  className={`cursor-pointer transition-all border-2 shadow-sm hover:shadow-md ${
                    isSelected
                      ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5"
                      : "border-transparent bg-card/80 hover:border-muted"
                  }`}
                  data-testid={`button-meal-${type}`}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-1">{config.emoji}</div>
                    <span className={`text-sm font-medium ${isSelected ? "text-primary" : ""}`}>
                      {config.label}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>


        {/* Submit Button */}
        <Button
          size="lg"
          className="w-full gap-2 shadow-lg hover:shadow-xl transition-all rounded-full h-14 text-base"
          onClick={handleSubmit}
          disabled={ingredients.length === 0}
          data-testid="button-generate"
        >
          <Sparkles className="h-5 w-5" />
          Find Recipes
        </Button>

        {ingredients.length === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
            <span>👆</span>
            Add ingredients to search for recipes
          </p>
        )}

        {/* Bottom decorative element */}
        <div className="flex justify-center gap-2 mt-8 text-2xl opacity-50">
          <span>🍅</span>
          <span>🥦</span>
          <span>🧄</span>
          <span>🌶️</span>
          <span>🧅</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center animate-pulse">
          <span className="text-3xl">🍳</span>
        </div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return user ? <RecipeGenerator /> : <Landing />;
}
