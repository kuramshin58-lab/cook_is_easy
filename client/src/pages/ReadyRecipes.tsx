import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Clock, Users, ArrowLeft, Timer, Search, Filter, X, Loader2 } from "lucide-react";
import { SaveHeartButton } from "@/components/SaveHeartButton";

interface DbRecipe {
  id: string;
  title: string;
  description: string;
  structured_ingredients?: Array<{
    name: string;
    amount: string;
    category: string;
    substitutes?: string[];
  }>;
  ingredients: string[];
  difficulty: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  instructions: string | string[];
  calories: number;
  protein?: number;
  fats?: number;
  carbs?: number;
  tags: string[];
  source_url?: string;
}

interface BrowseResponse {
  recipes: DbRecipe[];
  total: number;
  filters: {
    mainIngredients: string[];
  };
}

const recipeEmojis = ["🍝", "🥗", "🍲", "🥘", "🍜", "🍳", "🥪", "🍕", "🌮", "🍛"];

const cookingTimeOptions = [
  { value: "", label: "All times" },
  { value: "quick", label: "Quick (≤30 min)" },
  { value: "medium", label: "Medium (30-60 min)" },
  { value: "long", label: "Long (60+ min)" },
];

const mealTypeOptions = [
  { value: "", label: "All meals" },
  { value: "breakfast", label: "Breakfast" },
  { value: "main", label: "Main Course" },
  { value: "salad", label: "Salad" },
  { value: "side", label: "Side Dish" },
  { value: "dessert", label: "Dessert" },
];

const difficultyOptions = [
  { value: "", label: "All levels" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const mainIngredientOptions = [
  { value: "", label: "All ingredients" },
  { value: "chicken", label: "🐔 Chicken" },
  { value: "beef", label: "🥩 Beef" },
  { value: "pork", label: "🐷 Pork" },
  { value: "fish", label: "🐟 Fish" },
  { value: "shrimp", label: "🦐 Shrimp" },
  { value: "pasta", label: "🍝 Pasta" },
  { value: "rice", label: "🍚 Rice" },
  { value: "tofu", label: "🧈 Tofu" },
  { value: "eggs", label: "🥚 Eggs" },
];

function RecipeCard({ recipe, onClick, index }: { recipe: DbRecipe; onClick: () => void; index: number }) {
  const emoji = recipeEmojis[index % recipeEmojis.length];
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all border-0 shadow-md bg-card/80 backdrop-blur-sm group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl mb-3 flex items-center justify-center group-hover:scale-[1.02] transition-transform">
          <span className="text-5xl">{emoji}</span>
          <SaveHeartButton
            recipe={{ title: recipe.title, id: recipe.id }}
            isFromDatabase={true}
            size="sm"
            className="absolute top-2 right-2 shadow-sm"
          />
        </div>
        <h3 className="font-semibold text-sm mb-1 line-clamp-2">
          {recipe.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {recipe.description?.slice(0, 80)}...
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-primary" />
            <span>{totalTime || recipe.cook_time} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-primary" />
            <span>{recipe.servings}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {recipe.tags?.slice(0, 2).map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs px-2 py-0">
              {tag}
            </Badge>
          ))}
          {recipe.difficulty && (
            <Badge
              variant="outline"
              className={`text-xs px-2 py-0 ${
                recipe.difficulty.toLowerCase() === 'easy' ? 'border-green-500 text-green-600' :
                recipe.difficulty.toLowerCase() === 'medium' ? 'border-yellow-500 text-yellow-600' :
                'border-red-500 text-red-600'
              }`}
            >
              {recipe.difficulty}
            </Badge>
          )}
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
  recipe: DbRecipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!recipe) return null;

  // Parse ingredients
  const ingredientsList = recipe.structured_ingredients
    ? recipe.structured_ingredients.map(ing => `${ing.amount} ${ing.name}`.trim())
    : (recipe.ingredients || []);

  // Parse instructions
  const stepsList = Array.isArray(recipe.instructions)
    ? recipe.instructions
    : recipe.instructions?.split(/\d+\.\s/).filter(Boolean) || [];

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between gap-4">
          <DialogTitle className="font-serif text-2xl flex-1">{recipe.title}</DialogTitle>
          <SaveHeartButton
            recipe={{ title: recipe.title, id: recipe.id }}
            isFromDatabase={true}
            size="md"
            className="shadow-sm shrink-0"
          />
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">{recipe.description}</p>

          <div className="flex flex-wrap gap-2">
            {recipe.tags?.map((tag, i) => (
              <Badge key={i} variant="secondary" className="rounded-full px-3">{tag}</Badge>
            ))}
            {recipe.difficulty && (
              <Badge variant="outline" className="rounded-full px-3">{recipe.difficulty}</Badge>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <div className="text-xs text-muted-foreground">Prep</div>
              <div className="font-semibold text-sm">{recipe.prep_time} min</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="text-xs text-muted-foreground">Cook</div>
              <div className="font-semibold text-sm">{recipe.cook_time} min</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="text-xs text-muted-foreground">Servings</div>
              <div className="font-semibold text-sm">{recipe.servings}</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-lg">🔥</span>
              </div>
              <div className="text-xs text-muted-foreground">Calories</div>
              <div className="font-semibold text-sm">{recipe.calories || '—'}</div>
            </div>
          </div>

          {/* Nutrition info */}
          {(recipe.protein || recipe.fats || recipe.carbs) && (
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              {recipe.protein && <span>Protein: {recipe.protein}g</span>}
              {recipe.fats && <span>Fats: {recipe.fats}g</span>}
              {recipe.carbs && <span>Carbs: {recipe.carbs}g</span>}
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">🥕</span>
              Ingredients ({ingredientsList.length})
            </h4>
            <ul className="space-y-2">
              {ingredientsList.map((ingredient, i) => (
                <li key={i} className="text-sm flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary" />
                  {typeof ingredient === 'string' ? ingredient.trim() : ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">👨‍🍳</span>
              Instructions ({stepsList.length} steps)
            </h4>
            <ol className="space-y-4">
              {stepsList.map((step, i) => (
                <li key={i} className="flex gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center text-xs font-semibold shadow-sm">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 text-sm leading-relaxed">{typeof step === 'string' ? step.trim() : step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FilterButton({
  label,
  value,
  options,
  onChange,
  icon
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-card border border-border rounded-full px-4 py-2 pr-8 text-sm font-medium cursor-pointer hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

export default function ReadyRecipes() {
  const [, setLocation] = useLocation();
  const [selectedRecipe, setSelectedRecipe] = useState<DbRecipe | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [mealType, setMealType] = useState("");
  const [mainIngredient, setMainIngredient] = useState("");
  const [difficulty, setDifficulty] = useState("");

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch recipes
  const { data, isLoading, error } = useQuery<BrowseResponse>({
    queryKey: ['browse-recipes', debouncedSearch, cookingTime, mealType, mainIngredient, difficulty],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (cookingTime) params.append('cookingTime', cookingTime);
      if (mealType) params.append('mealType', mealType);
      if (mainIngredient) params.append('mainIngredient', mainIngredient);
      if (difficulty) params.append('difficulty', difficulty);

      const res = await fetch(`/api/recipes/browse?${params}`);
      if (!res.ok) throw new Error('Failed to fetch recipes');
      return res.json();
    }
  });

  const recipes = data?.recipes || [];
  const hasFilters = search || cookingTime || mealType || mainIngredient || difficulty;

  const clearFilters = () => {
    setSearch("");
    setCookingTime("");
    setMealType("");
    setMainIngredient("");
    setDifficulty("");
  };

  return (
    <div className="bg-background min-h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-5xl mx-auto px-4 py-8 relative">
        <header className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 gap-2 rounded-full"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-4 shadow-lg">
              <span className="text-3xl">📖</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold">
              Recipe Collection
            </h1>
            <p className="text-muted-foreground mt-2">
              Browse {data?.total || 0} recipes from our database
            </p>
          </div>

          {/* Search & Filters */}
          <div className="space-y-4">
            {/* Search bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-10 rounded-full border-2"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <FilterButton
                label="Time"
                value={cookingTime}
                options={cookingTimeOptions}
                onChange={setCookingTime}
              />
              <FilterButton
                label="Meal"
                value={mealType}
                options={mealTypeOptions}
                onChange={setMealType}
              />
              <FilterButton
                label="Ingredient"
                value={mainIngredient}
                options={mainIngredientOptions}
                onChange={setMainIngredient}
              />
              <FilterButton
                label="Difficulty"
                value={difficulty}
                options={difficultyOptions}
                onChange={setDifficulty}
              />

              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="rounded-full gap-1 text-muted-foreground"
                >
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-red-100 flex items-center justify-center mb-4">
              <span className="text-4xl">😕</span>
            </div>
            <p className="text-muted-foreground">Failed to load recipes. Please try again.</p>
          </div>
        )}

        {/* Recipe grid */}
        {!isLoading && !error && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {recipes.map((recipe, index) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  index={index}
                  onClick={() => setSelectedRecipe(recipe)}
                />
              ))}
            </div>

            {recipes.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                  <span className="text-4xl">🍽️</span>
                </div>
                <p className="text-muted-foreground">
                  {hasFilters
                    ? "No recipes found with these filters. Try adjusting your search."
                    : "No recipes yet. Check back soon!"}
                </p>
                {hasFilters && (
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Clear all filters
                  </Button>
                )}
              </div>
            )}
          </>
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
