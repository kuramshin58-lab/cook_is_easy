import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User, ChefHat, Utensils, Heart, X, Plus, Save, Loader2 } from "lucide-react";
import { 
  baseIngredientsOptions, 
  equipmentOptions, 
  cuisinePreferencesOptions, 
  dietPreferencesOptions 
} from "@shared/schema";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [baseIngredients, setBaseIngredients] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [foodPreferences, setFoodPreferences] = useState<string[]>([]);
  
  const [customIngredient, setCustomIngredient] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }
    setBaseIngredients(user.base_ingredients || []);
    setEquipment(user.equipment || []);
    setFoodPreferences(user.food_preferences || []);
  }, [user, setLocation]);

  useEffect(() => {
    if (!user) return;
    const ingredientsChanged = JSON.stringify(baseIngredients) !== JSON.stringify(user.base_ingredients || []);
    const equipmentChanged = JSON.stringify(equipment) !== JSON.stringify(user.equipment || []);
    const preferencesChanged = JSON.stringify(foodPreferences) !== JSON.stringify(user.food_preferences || []);
    setHasChanges(ingredientsChanged || equipmentChanged || preferencesChanged);
  }, [baseIngredients, equipment, foodPreferences, user]);

  if (!user) {
    return null;
  }

  const toggleItem = (item: string, list: string[], setList: (items: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const removeItem = (item: string, list: string[], setList: (items: string[]) => void) => {
    setList(list.filter(i => i !== item));
  };

  const addCustomIngredient = () => {
    const trimmed = customIngredient.trim();
    if (trimmed && !baseIngredients.includes(trimmed)) {
      setBaseIngredients([...baseIngredients, trimmed]);
      setCustomIngredient("");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          base_ingredients: baseIngredients,
          equipment,
          food_preferences: foodPreferences
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      setUser(data.user);
      
      toast({
        title: "Saved",
        description: "Your profile has been updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold" data-testid="text-profile-title">My Profile</h1>
        {hasChanges && (
          <Button onClick={handleSave} disabled={isSaving} data-testid="button-save-profile">
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Name</label>
              <p className="text-lg font-medium" data-testid="text-user-name">{user.name}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <p className="text-lg font-medium" data-testid="text-user-email">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Pantry Staples
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ingredients you always have at home. These will be considered when suggesting recipes.
            </p>
            
            <div className="flex flex-wrap gap-2" data-testid="list-base-ingredients">
              {baseIngredients.map((item) => (
                <Badge 
                  key={item} 
                  variant="secondary" 
                  className="gap-1 pr-1"
                  data-testid={`badge-ingredient-${item}`}
                >
                  {item}
                  <button
                    onClick={() => removeItem(item, baseIngredients, setBaseIngredients)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                    data-testid={`button-remove-ingredient-${item}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add custom ingredient..."
                value={customIngredient}
                onChange={(e) => setCustomIngredient(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomIngredient()}
                data-testid="input-custom-ingredient"
              />
              <Button 
                size="icon" 
                variant="outline" 
                onClick={addCustomIngredient}
                disabled={!customIngredient.trim()}
                data-testid="button-add-custom-ingredient"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Popular pantry staples:</p>
              <div className="flex flex-wrap gap-2">
                {baseIngredientsOptions.map((item) => (
                  <Badge
                    key={item}
                    variant={baseIngredients.includes(item) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleItem(item, baseIngredients, setBaseIngredients)}
                    data-testid={`badge-option-ingredient-${item}`}
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Cooking Equipment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              What cooking tools you have. Recipes will be suggested based on this equipment.
            </p>
            
            <div className="flex flex-wrap gap-2" data-testid="list-equipment">
              {equipmentOptions.map((item) => (
                <Badge
                  key={item}
                  variant={equipment.includes(item) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleItem(item, equipment, setEquipment)}
                  data-testid={`badge-equipment-${item}`}
                >
                  {item}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Food Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-3">Favorite cuisines:</p>
              <div className="flex flex-wrap gap-2" data-testid="list-cuisine-preferences">
                {cuisinePreferencesOptions.map((item) => (
                  <Badge
                    key={item}
                    variant={foodPreferences.includes(item) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleItem(item, foodPreferences, setFoodPreferences)}
                    data-testid={`badge-cuisine-${item}`}
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">Diet type:</p>
              <div className="flex flex-wrap gap-2" data-testid="list-diet-preferences">
                {dietPreferencesOptions.map((item) => (
                  <Badge
                    key={item}
                    variant={foodPreferences.includes(item) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleItem(item, foodPreferences, setFoodPreferences)}
                    data-testid={`badge-diet-${item}`}
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
