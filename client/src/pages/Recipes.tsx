import { useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RecipeList } from "@/components/RecipeList";
import { ArrowLeft, ChefHat } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Recipe, RecipeRequest } from "@shared/schema";

export default function Recipes() {
  const [, setLocation] = useLocation();

  const storedData = sessionStorage.getItem("recipeRequest");
  const recipeRequest: RecipeRequest | null = storedData ? JSON.parse(storedData) : null;

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
    <div className="bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-8 md:py-12">
        <header className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 gap-2"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад к выбору продуктов
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Ваши рецепты</h1>
              {recipeRequest && (
                <p className="text-muted-foreground text-sm">
                  На основе: {recipeRequest.ingredients.join(", ")}
                </p>
              )}
            </div>
          </div>
        </header>

        <RecipeList
          recipes={recipes}
          isLoading={generateRecipes.isPending}
          error={generateRecipes.error ? "Произошла ошибка при генерации рецептов. Попробуйте еще раз." : null}
          hasSearched={true}
        />

        {!generateRecipes.isPending && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => setLocation("/")}
              data-testid="button-new-search"
            >
              Новый поиск рецептов
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
