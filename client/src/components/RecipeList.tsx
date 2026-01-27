import { useState, useEffect } from "react";
import { RecipePreviewCard } from "./RecipePreviewCard";
import { RecipeDetailModal } from "./RecipeDetailModal";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import type { Recipe } from "@shared/schema";

const loadingPhrases = [
  "Heating up the pan...",
  "Sharpening the knives...",
  "Getting your favorite plate...",
  "Mixing ideas in a bowl...",
  "Checking for spices...",
  "Boiling the water...",
  "Adding a pinch of magic...",
  "Tasting the sauce...",
  "Chopping onions (mentally)...",
  "Putting together your recipe...",
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
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center animate-pulse shadow-lg">
          <span className="text-5xl">👨‍🍳</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2">Preparing your recipes</h3>

      <div className="h-8 flex items-center justify-center">
        <p
          className={`text-muted-foreground transition-opacity duration-300 ${
            fadeIn ? "opacity-100" : "opacity-0"
          }`}
        >
          {loadingPhrases[phraseIndex]}
        </p>
      </div>

      <div className="flex gap-2 mt-6 text-2xl">
        {["🥕", "🧅", "🧄", "🌶️"].map((emoji, i) => (
          <span
            key={i}
            className="animate-bounce"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {emoji}
          </span>
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
      <Card className="border-destructive/30 bg-destructive/5" data-testid="error-message">
        <CardContent className="flex items-center gap-3 py-6">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="font-medium text-sm">Error</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="empty-state-initial">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-secondary/30 flex items-center justify-center mb-4 shadow-md">
          <span className="text-4xl">🍽️</span>
        </div>
        <h3 className="font-semibold mb-1">Add ingredients</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Select the ingredients you have, set your filters, and click "Find Recipes"
        </p>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="empty-state-no-results">
        <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <span className="text-4xl">🤔</span>
        </div>
        <h3 className="font-semibold mb-1">No recipes found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Try adding more ingredients or changing your filters
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4" data-testid="recipe-list">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-lg">✨</span>
          <span>Found <strong className="text-foreground">{recipes.length}</strong> recipes for you</span>
        </div>
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
