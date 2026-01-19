import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IngredientInput } from "@/components/IngredientInput";
import { FilterButtons } from "@/components/FilterButtons";
import { ChefHat, Sparkles, UtensilsCrossed } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { 
  cookingTimeOptions, 
  cookingMethodOptions, 
  foodTypeOptions,
  type CookingTime,
  type CookingMethod,
  type FoodType,
  type RecipeRequest
} from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [cookingTime, setCookingTime] = useState<CookingTime>("40");
  const [cookingMethod, setCookingMethod] = useState<CookingMethod | undefined>();
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
      cookingMethod,
      foodType,
      userPreferences: user ? {
        baseIngredients: user.base_ingredients,
        equipment: user.equipment,
        foodPreferences: user.food_preferences
      } : undefined
    };

    // Объединяем все продукты пользователя: введённые + базовые из профиля
    const combinedIngredients = user 
      ? [...ingredients, ...user.base_ingredients]
      : ingredients;
    const allUserIngredients = Array.from(new Set(combinedIngredients));
    
    sessionStorage.setItem("recipeRequest", JSON.stringify(request));
    sessionStorage.setItem("userIngredients", JSON.stringify(allUserIngredients));
    setLocation("/recipes");
  };

  const formatCookingTime = (time: CookingTime) => `${time} мин`;

  return (
    <div className="bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <ChefHat className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Приготовим то, что есть в холодильнике
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {user 
              ? `${user.name}, введите продукты и получите персональные рецепты!`
              : "Введите продукты, которые у вас есть, и получите 5 уникальных рецептов"
            }
          </p>
        </header>

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
            disabled={ingredients.length === 0}
            data-testid="button-generate"
          >
            <Sparkles className="h-4 w-4" />
            Показать рецепты
          </Button>

          {ingredients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                Добавьте хотя бы один продукт, чтобы получить рецепты
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
