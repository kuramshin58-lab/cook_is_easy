import { RecipeCard } from "./RecipeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UtensilsCrossed, AlertCircle } from "lucide-react";
import type { Recipe } from "@shared/schema";

interface RecipeListProps {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}

function RecipeSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-6 w-16" />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecipeList({ recipes, isLoading, error, hasSearched }: RecipeListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="loading-recipes">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
          <span className="text-sm">Генерируем рецепты для вас...</span>
        </div>
        {[1, 2, 3].map((i) => (
          <RecipeSkeleton key={i} />
        ))}
      </div>
    );
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
    <div className="space-y-6" data-testid="recipe-list">
      <p className="text-sm text-muted-foreground">
        Найдено рецептов: {recipes.length}
      </p>
      {recipes.map((recipe, index) => (
        <RecipeCard key={index} recipe={recipe} index={index} />
      ))}
    </div>
  );
}
