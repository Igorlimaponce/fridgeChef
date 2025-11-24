import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { RecipeFilter, GenerateRecipeRequest } from "@/types/api";
import { toast } from "sonner";

// Recipes
export function useRecipes(filter?: RecipeFilter) {
  return useQuery({
    queryKey: ["recipes", filter],
    queryFn: () => api.getRecipes(filter),
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast.success("Recipe deleted");
    },
    onError: () => {
      toast.error("Failed to delete recipe");
    },
  });
}

export function useToggleShareRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.toggleShareRecipe,
    onSuccess: (updatedRecipe) => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      // We don't show toast here because the UI handles the copy to clipboard logic which is specific
    },
    onError: () => {
      toast.error("Failed to update share settings");
    },
  });
}

export function useGenerateRecipe() {
  return useMutation({
    mutationFn: api.generateRecipe,
    onError: () => {
      toast.error("Failed to generate recipe");
    },
  });
}

export function useSaveRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.saveRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast.success("Recipe saved successfully!");
    },
    onError: () => {
      toast.error("Failed to save recipe");
    },
  });
}

export function usePublicRecipe(token: string) {
  return useQuery({
    queryKey: ["public-recipe", token],
    queryFn: () => api.getPublicRecipe(token),
    enabled: !!token,
    retry: false,
  });
}

// Pantry
export function usePantry() {
  return useQuery({
    queryKey: ["pantry"],
    queryFn: api.getPantryItems,
  });
}

export function useAddPantryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, quantity, unit }: { name: string; quantity: string; unit: string }) =>
      api.addPantryItem(name, quantity, unit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pantry"] });
      toast.success("Item added to pantry");
    },
    onError: () => {
      toast.error("Failed to add item");
    },
  });
}

export function useDeletePantryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deletePantryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pantry"] });
      toast.success("Item removed from pantry");
    },
    onError: () => {
      toast.error("Failed to remove item");
    },
  });
}

// Meal Plan
export function useMealPlan(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["meal-plan", startDate, endDate],
    queryFn: () => api.getMealPlan(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

export function useAddToMealPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      recipeId,
      date,
      mealType,
    }: {
      recipeId: string;
      date: string;
      mealType: string;
    }) => api.addToMealPlan(recipeId, date, mealType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-plan"] });
      toast.success("Added to meal plan");
    },
    onError: () => {
      toast.error("Failed to add to meal plan");
    },
  });
}

export function useDeleteMealPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-plan"] });
      toast.success("Removed from meal plan");
    },
    onError: () => {
      toast.error("Failed to remove from meal plan");
    },
  });
}
