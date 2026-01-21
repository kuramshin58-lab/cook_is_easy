import { useState, useEffect } from "react";
import { RecipePreviewCard } from "./RecipePreviewCard";
import { RecipeDetailModal } from "./RecipeDetailModal";
import { Card, CardContent } from "@/components/ui/card";
import { UtensilsCrossed, AlertCircle, ChefHat } from "lucide-react";
import type { Recipe } from "@shared/schema";

const loadingPhrases = [
  "Разогреваем сковородку…",
  "Точим ножи…",
  "Достаём любимую тарелку…",
  "Смешиваем идеи в миске…",
  "Проверяем, что есть специи…",
  "Ставим воду закипать…",
  "Отмеряем «щепотку магии»…",
  "Пробуем соус на вкус…",
  "Хрустим луком (мысленно)…",
  "Финально собираем рецепт…",
];

interface RecipeListProps {
  recipes: Recipe[];
  userIngredients: string[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}

function CookingLoadingAnimation() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
        setFadeIn(true);
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="loading-recipes">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <ChefHat className="h-12 w-12 text-primary" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mb-2">Готовим ваши рецепты</h3>
      
      <div className="h-8 flex items-center justify-center">
        <p 
          className={`text-muted-foreground transition-opacity duration-300 ${
            fadeIn ? "opacity-100" : "opacity-0"
          }`}
        >
          {loadingPhrases[phraseIndex]}
        </p>
      </div>
      
      <div className="flex gap-1.5 mt-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export function RecipeList({ recipes, userIngredients, isLoading, error, hasSearched }: RecipeListProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  if (isLoading) {
    return <CookingLoadingAnimation />;
  }

  if (error) {
    return (
      <Card className="border-destructive/50" data-testid="error-message">
        <CardContent className="flex items-center gap-3 py-6">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="empty-state-initial">
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
          <UtensilsCrossed className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-medium mb-1">Добавьте продукты</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Выберите ингредиенты, которые у вас есть, настройте фильтры и нажмите "Показать рецепты"
        </p>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="empty-state-no-results">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium mb-1">Рецепты не найдены</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Попробуйте добавить больше продуктов или изменить фильтры
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4" data-testid="recipe-list">
        <p className="text-sm text-muted-foreground">
          Найдено рецептов: {recipes.length}
        </p>
        {recipes.map((recipe, index) => (
          <RecipePreviewCard 
            key={index} 
            recipe={recipe} 
            index={index}
            userIngredients={userIngredients}
            onClick={() => setSelectedRecipe(recipe)}
          />
        ))}
      </div>
      
      <RecipeDetailModal
        recipe={selectedRecipe}
        userIngredients={userIngredients}
        open={selectedRecipe !== null}
        onOpenChange={(open) => !open && setSelectedRecipe(null)}
      />
    </>
  );
}
