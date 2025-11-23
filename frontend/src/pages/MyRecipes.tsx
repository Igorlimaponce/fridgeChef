import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { RecipeCard } from "@/components/RecipeCard";
import { Loader2, ChefHat, Search } from "lucide-react";
import { api } from "@/services/api";
import { Recipe } from "@/types/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function MyRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterIngredient, setFilterIngredient] = useState("");
  const [filterCalories, setFilterCalories] = useState("");

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setIsLoading(true);
      const data = await api.getRecipes({
        ingredient: filterIngredient,
        max_calories: filterCalories ? parseInt(filterCalories) : undefined,
      });
      setRecipes(data || []);
    } catch (error) {
      toast.error("Failed to load recipes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteRecipe(id);
      setRecipes(recipes.filter((r) => r.id !== id));
      toast.success("Recipe deleted");
    } catch (error) {
      toast.error("Failed to delete recipe");
    }
  };

  if (isLoading && recipes.length === 0) {
    return (
      <Layout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">My Saved Recipes</h1>
          <p className="text-lg text-muted-foreground">
            Your personal collection of AI-generated recipes
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-end bg-card p-4 rounded-lg border shadow-sm">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="ingredient">Ingredient</Label>
            <Input
              id="ingredient"
              value={filterIngredient}
              onChange={(e) => setFilterIngredient(e.target.value)}
              placeholder="e.g. Chicken"
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="calories">Max Calories</Label>
            <Input
              id="calories"
              type="number"
              value={filterCalories}
              onChange={(e) => setFilterCalories(e.target.value)}
              placeholder="e.g. 500"
            />
          </div>
          <Button onClick={loadRecipes}>
            <Search className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>

        {recipes.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
            <ChefHat className="h-16 w-16 text-muted-foreground/50" />
            <div>
              <h2 className="text-xl font-semibold">No recipes found</h2>
              <p className="text-muted-foreground">
                Try adjusting your filters or generate a new recipe.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
