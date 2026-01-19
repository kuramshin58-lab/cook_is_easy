import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IngredientInput } from "@/components/IngredientInput";
import { FilterButtons } from "@/components/FilterButtons";
import { RecipeList } from "@/components/RecipeList";
import { ChefHat, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { 
  cookingTimeOptions, 
  cookingMethodOptions, 
  foodTypeOptions,
  type CookingTime,
  type CookingMethod,
  type FoodType,
  type Recipe,
  type RecipeRequest
} from "@shared/schema";

export default function Home() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [cookingTime, setCookingTime] = useState<CookingTime>("40");
  const [cookingMethod, setCookingMethod] = useState<CookingMethod | undefined>();
  const [foodType, setFoodType] = useState<FoodType | undefined>();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const generateRecipes = useMutation({
    mutationFn: async (data: RecipeRequest) => {
      const response = await apiRequest("POST", "/api/recipes/generate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setRecipes(data.recipes || []);
      setHasSearched(true);
    },
    onError: () => {
      setHasSearched(true);
    }
  });

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

    generateRecipes.mutate({
      ingredients,
      cookingTime,
      cookingMethod,
      foodType
    });
  };

  const formatCookingTime = (time: CookingTime) => `${time} мин`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <ChefHat className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Приготовим то, что есть в холодильнике
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Введите продукты, которые у вас есть, и получите 5 уникальных рецептов, 
            подобранных специально для вас
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr,1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ваши продукты</CardTitle>
              </CardHeader>
              <CardContent>
                <IngredientInput
                  selectedIngredients={ingredients}
                  onAdd={handleAddIngredient}
                  onRemove={handleRemoveIngredient}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Параметры приготовления</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FilterButtons
                  label="Время на готовку"
                  options={cookingTimeOptions}
                  selected={cookingTime}
                  onSelect={(v) => setCookingTime(v || "40")}
                  formatOption={formatCookingTime}
                />

                <FilterButtons
                  label="Тип приготовления"
                  options={cookingMethodOptions}
                  selected={cookingMethod}
                  onSelect={setCookingMethod}
                />

                <FilterButtons
                  label="Тип еды"
                  options={foodTypeOptions}
                  selected={foodType}
                  onSelect={setFoodType}
                />
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={ingredients.length === 0 || generateRecipes.isPending}
              data-testid="button-generate"
            >
              {generateRecipes.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                  Генерируем рецепты...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Показать рецепты
                </>
              )}
            </Button>
          </div>

          <div className="lg:min-h-[600px]">
            <RecipeList
              recipes={recipes}
              isLoading={generateRecipes.isPending}
              error={generateRecipes.error ? "Произошла ошибка при генерации рецептов. Попробуйте еще раз." : null}
              hasSearched={hasSearched}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
