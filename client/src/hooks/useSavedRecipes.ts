import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Recipe, SavedRecipeRow } from "@shared/schema";

interface SaveRecipeParams {
  userId: string;
  recipeId?: string;
  recipeTitle: string;
  recipeData?: Recipe;
  isFromDatabase: boolean;
}

interface UnsaveRecipeParams {
  userId: string;
  recipeTitle: string;
}

// Fetch all saved recipes for a user
export function useSavedRecipes(userId: string | undefined) {
  return useQuery<{ recipes: SavedRecipeRow[] }>({
    queryKey: ['saved-recipes', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID');
      const res = await fetch(`/api/recipes/saved?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch saved recipes');
      return res.json();
    },
    enabled: !!userId
  });
}

// Check if a specific recipe is saved
export function useIsSaved(userId: string | undefined, recipeTitle: string | undefined) {
  return useQuery<{ isSaved: boolean }>({
    queryKey: ['saved-recipe-check', userId, recipeTitle],
    queryFn: async () => {
      if (!userId || !recipeTitle) throw new Error('Missing params');
      const res = await fetch(`/api/recipes/saved/check?userId=${userId}&title=${encodeURIComponent(recipeTitle)}`);
      if (!res.ok) throw new Error('Failed to check saved recipe');
      return res.json();
    },
    enabled: !!userId && !!recipeTitle
  });
}

// Save a recipe mutation
export function useSaveRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SaveRecipeParams) => {
      const res = await fetch('/api/recipes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!res.ok) throw new Error('Failed to save recipe');
      return res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate saved recipes list
      queryClient.invalidateQueries({ queryKey: ['saved-recipes', variables.userId] });
      // Update the check query
      queryClient.setQueryData(['saved-recipe-check', variables.userId, variables.recipeTitle], { isSaved: true });
    }
  });
}

// Unsave a recipe mutation
export function useUnsaveRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UnsaveRecipeParams) => {
      const res = await fetch('/api/recipes/save', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!res.ok) throw new Error('Failed to unsave recipe');
      return res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate saved recipes list
      queryClient.invalidateQueries({ queryKey: ['saved-recipes', variables.userId] });
      // Update the check query
      queryClient.setQueryData(['saved-recipe-check', variables.userId, variables.recipeTitle], { isSaved: false });
    }
  });
}

// Combined hook for toggling save state
export function useToggleSaveRecipe() {
  const saveRecipe = useSaveRecipe();
  const unsaveRecipe = useUnsaveRecipe();

  return {
    toggle: async (params: SaveRecipeParams & { isSaved: boolean }) => {
      if (params.isSaved) {
        await unsaveRecipe.mutateAsync({
          userId: params.userId,
          recipeTitle: params.recipeTitle
        });
      } else {
        await saveRecipe.mutateAsync(params);
      }
    },
    isLoading: saveRecipe.isPending || unsaveRecipe.isPending
  };
}
