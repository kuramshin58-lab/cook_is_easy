import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, Users, ChefHat, ArrowLeft } from "lucide-react";
import { readyRecipes, type ReadyRecipe } from "@shared/schema";

function RecipeCard({ recipe, onClick }: { recipe: ReadyRecipe; onClick: () => void }) {
  return (
    <Card 
      className="cursor-pointer hover-elevate transition-all"
      onClick={onClick}
      data-testid={`card-recipe-${recipe.id}`}
    >
      <CardContent className="p-4">
        <div className="aspect-[4/3] bg-muted rounded-md mb-3 flex items-center justify-center">
          <ChefHat className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <h3 className="font-semibold text-sm mb-1 line-clamp-2" data-testid={`text-title-${recipe.id}`}>
          {recipe.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {recipe.description.slice(0, 80)}...
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{recipe.cookingTime}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function RecipeDetailModal({ 
  recipe, 
  open, 
  onOpenChange 
}: { 
  recipe: ReadyRecipe | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  if (!recipe) return null;

  const ingredientsList = recipe.ingredients.split(", ");
  const stepsList = recipe.steps.split(/\d+\.\s/).filter(Boolean);
  const tagsList = recipe.tags.split(", ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{recipe.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-muted-foreground">{recipe.description}</p>
          
          <div className="flex flex-wrap gap-2">
            {tagsList.map((tag, i) => (
              <Badge key={i} variant="secondary">{tag}</Badge>
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Подготовка</div>
              <div className="font-semibold">{recipe.prepTime}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Готовка</div>
              <div className="font-semibold">{recipe.cookingTime}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Порций</div>
              <div className="font-semibold">{recipe.servings}</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Ингредиенты
            </h4>
            <ul className="space-y-1">
              {ingredientsList.map((ingredient, i) => (
                <li key={i} className="text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {ingredient.trim()}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Шаги приготовления</h4>
            <ol className="space-y-3">
              {stepsList.map((step, i) => (
                <li key={i} className="text-sm flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step.trim()}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ReadyRecipes() {
  const [, setLocation] = useLocation();
  const [selectedRecipe, setSelectedRecipe] = useState<ReadyRecipe | null>(null);

  return (
    <div className="bg-background min-h-screen">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <header className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 gap-2"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>
          
          <h1 className="text-2xl md:text-3xl font-bold text-center" data-testid="text-page-title">
            Готовые рецепты
          </h1>
          <p className="text-muted-foreground text-center mt-2">
            Подборка проверенных рецептов со всего мира
          </p>
        </header>

        <div className="grid grid-cols-2 gap-4" data-testid="recipe-grid">
          {readyRecipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              onClick={() => setSelectedRecipe(recipe)}
            />
          ))}
        </div>
        
        <RecipeDetailModal
          recipe={selectedRecipe}
          open={selectedRecipe !== null}
          onOpenChange={(open) => !open && setSelectedRecipe(null)}
        />
      </div>
    </div>
  );
}
