import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, Users, ChefHat, ArrowLeft, Timer, Utensils } from "lucide-react";
import { readyRecipes, type ReadyRecipe } from "@shared/schema";

const recipeEmojis = ["🍝", "🥗", "🍲", "🥘", "🍜", "🍳", "🥪", "🍕", "🌮", "🍛"];

function RecipeCard({ recipe, onClick, index }: { recipe: ReadyRecipe; onClick: () => void; index: number }) {
  const emoji = recipeEmojis[index % recipeEmojis.length];

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all border-0 shadow-md bg-card/80 backdrop-blur-sm group"
      onClick={onClick}
      data-testid={`card-recipe-${recipe.id}`}
    >
      <CardContent className="p-4">
        <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl mb-3 flex items-center justify-center group-hover:scale-[1.02] transition-transform">
          <span className="text-5xl">{emoji}</span>
        </div>
        <h3 className="font-semibold text-sm mb-1 line-clamp-2" data-testid={`text-title-${recipe.id}`}>
          {recipe.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {recipe.description.slice(0, 80)}...
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-primary" />
            <span>{recipe.cookingTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-primary" />
            <span>{recipe.servings}</span>
          </div>
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
          <DialogTitle className="font-serif text-2xl">{recipe.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">{recipe.description}</p>

          <div className="flex flex-wrap gap-2">
            {tagsList.map((tag, i) => (
              <Badge key={i} variant="secondary" className="rounded-full px-3">{tag}</Badge>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <div className="text-xs text-muted-foreground">Prep</div>
              <div className="font-semibold text-sm">{recipe.prepTime}</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="text-xs text-muted-foreground">Cook</div>
              <div className="font-semibold text-sm">{recipe.cookingTime}</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="text-xs text-muted-foreground">Servings</div>
              <div className="font-semibold text-sm">{recipe.servings}</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">🥕</span>
              Ingredients
            </h4>
            <ul className="space-y-2">
              {ingredientsList.map((ingredient, i) => (
                <li key={i} className="text-sm flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary" />
                  {ingredient.trim()}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">👨‍🍳</span>
              Instructions
            </h4>
            <ol className="space-y-4">
              {stepsList.map((step, i) => (
                <li key={i} className="flex gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center text-xs font-semibold shadow-sm">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 text-sm leading-relaxed">{step.trim()}</span>
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
    <div className="bg-background min-h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-8 relative">
        <header className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 gap-2 rounded-full"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-4 shadow-lg">
              <span className="text-3xl">📖</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold" data-testid="text-page-title">
              Ready Recipes
            </h1>
            <p className="text-muted-foreground mt-2">
              A collection of tested recipes from around the world
            </p>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-4" data-testid="recipe-grid">
          {readyRecipes.map((recipe, index) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              index={index}
              onClick={() => setSelectedRecipe(recipe)}
            />
          ))}
        </div>

        {readyRecipes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <span className="text-4xl">🍽️</span>
            </div>
            <p className="text-muted-foreground">No recipes yet. Check back soon!</p>
          </div>
        )}

        <RecipeDetailModal
          recipe={selectedRecipe}
          open={selectedRecipe !== null}
          onOpenChange={(open) => !open && setSelectedRecipe(null)}
        />

        {/* Bottom decorative element */}
        <div className="flex justify-center gap-2 mt-12 text-2xl opacity-40">
          <span>🍝</span>
          <span>🥗</span>
          <span>🍲</span>
          <span>🥘</span>
          <span>🍜</span>
        </div>
      </div>
    </div>
  );
}
