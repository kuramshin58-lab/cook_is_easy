import { Heart } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useIsSaved, useToggleSaveRecipe } from "@/hooks/useSavedRecipes";
import type { Recipe } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface SaveHeartButtonProps {
  recipe: {
    title: string;
    id?: string;
  };
  recipeData?: Recipe;
  isFromDatabase: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function SaveHeartButton({
  recipe,
  recipeData,
  isFromDatabase,
  className,
  size = "md"
}: SaveHeartButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: savedData } = useIsSaved(user?.id, recipe.title);
  const { toggle, isLoading } = useToggleSaveRecipe();

  const isSaved = savedData?.isSaved ?? false;

  const sizeClasses = {
    sm: "w-6 h-6 p-1",
    md: "w-8 h-8 p-1.5",
    lg: "w-10 h-10 p-2"
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to save recipes",
        variant: "destructive"
      });
      return;
    }

    try {
      await toggle({
        userId: user.id,
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        recipeData: recipeData,
        isFromDatabase,
        isSaved
      });

      toast({
        title: isSaved ? "Recipe removed" : "Recipe saved",
        description: isSaved
          ? `${recipe.title} removed from favorites`
          : `${recipe.title} added to favorites`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update saved recipe",
        variant: "destructive"
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "rounded-full flex items-center justify-center transition-all",
        "hover:scale-110 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-primary/50",
        isSaved
          ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
          : "bg-white/80 text-muted-foreground hover:bg-white hover:text-red-500",
        isLoading && "opacity-50 cursor-not-allowed",
        sizeClasses[size],
        className
      )}
      aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
    >
      <Heart
        className={cn(
          iconSizes[size],
          "transition-all",
          isSaved && "fill-current"
        )}
      />
    </button>
  );
}
