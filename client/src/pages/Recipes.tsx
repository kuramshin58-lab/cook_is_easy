import { useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RecipeList } from "@/components/RecipeList";
import { ArrowLeft, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Recipe, RecipeRequest } from "@shared/schema";

export default function Recipes() {
  const [, setLocation] = useLocation();

  const storedData = sessionStorage.getItem("recipeRequest");
  const storedIngredients = sessionStorage.getItem("userIngredients");

  const recipeRequest: RecipeRequest | null = storedData ? JSON.parse(storedData) : null;
  const userIngredients: string[] = storedIngredients ? JSON.parse(storedIngredients) : [];

  const generateRecipes = useMutation({
    mutationFn: async (data: RecipeRequest) => {
      const response = await apiRequest("POST", "/api/recipes/generate", data);
      return response.json();
    },
  });

  useEffect(() => {
    if (!recipeRequest) {
      setLocation("/");
      return;
    }

    generateRecipes.mutate(recipeRequest);
  }, []);

  const recipes: Recipe[] = generateRecipes.data?.recipes || [];

  return (
    <div className="bg-background min-h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-accent/10 rounded-full blur-2xl" />
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-8 md:py-12 relative">
        <header className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 gap-2 rounded-full"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to ingredient selection
          </Button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-md">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold">Your Recipes</h1>
              {recipeRequest && (
                <p className="text-muted-foreground text-sm mt-1">
                  Based on: <span className="text-foreground font-medium">{recipeRequest.ingredients.join(", ")}</span>
                </p>
              )}
            </div>
          </div>
        </header>

        {generateRecipes.isPending && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 animate-pulse shadow-lg">
              <span className="text-4xl">👨‍🍳</span>
            </div>
            <p className="font-semibold text-lg mb-2">Finding the best recipes...</p>
            <p className="text-muted-foreground text-sm">AI is searching for recipes that match your ingredients</p>
            <div className="flex justify-center gap-2 mt-4 text-2xl">
              <span className="animate-bounce" style={{ animationDelay: "0ms" }}>🥕</span>
              <span className="animate-bounce" style={{ animationDelay: "100ms" }}>🧅</span>
              <span className="animate-bounce" style={{ animationDelay: "200ms" }}>🧄</span>
              <span className="animate-bounce" style={{ animationDelay: "300ms" }}>🌶️</span>
            </div>
          </div>
        )}

        {!generateRecipes.isPending && (
          <RecipeList
            recipes={recipes}
            userIngredients={userIngredients}
            isLoading={false}
            error={generateRecipes.error ? "An error occurred while generating recipes. Please try again." : null}
            hasSearched={true}
          />
        )}

        {!generateRecipes.isPending && recipes.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              className="rounded-full px-6"
              onClick={() => setLocation("/")}
              data-testid="button-new-search"
            >
              <span className="mr-2">🔄</span>
              New Recipe Search
            </Button>
          </div>
        )}

        {!generateRecipes.isPending && recipes.length === 0 && !generateRecipes.error && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <span className="text-4xl">🤔</span>
            </div>
            <p className="font-semibold text-lg mb-2">No recipes found</p>
            <p className="text-muted-foreground text-sm mb-4">Try adding more ingredients or adjusting your preferences</p>
            <Button
              onClick={() => setLocation("/")}
              className="rounded-full"
              data-testid="button-try-again"
            >
              Try Different Ingredients
            </Button>
          </div>
        )}

        {generateRecipes.error && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
              <span className="text-4xl">😔</span>
            </div>
            <p className="font-semibold text-lg mb-2">Something went wrong</p>
            <p className="text-muted-foreground text-sm mb-4">An error occurred while generating recipes. Please try again.</p>
            <Button
              onClick={() => setLocation("/")}
              className="rounded-full"
            >
              Go Back
            </Button>
          </div>
        )}

        {/* Bottom decorative element */}
        {!generateRecipes.isPending && recipes.length > 0 && (
          <div className="flex justify-center gap-2 mt-8 text-2xl opacity-40">
            <span>🍝</span>
            <span>🥗</span>
            <span>🍲</span>
            <span>🥘</span>
            <span>🍜</span>
          </div>
        )}
      </div>
    </div>
  );
}
