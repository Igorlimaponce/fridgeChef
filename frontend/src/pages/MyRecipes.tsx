import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { RecipeCard } from "@/components/RecipeCard";
import { Loader2, ChefHat } from "lucide-react";
import { api } from "@/services/api";
import { Recipe } from "@/types/api";
import { toast } from "sonner";

export default function MyRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const data = await api.getRecipes();
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

  if (isLoading) {
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

        {recipes.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
            <ChefHat className="h-16 w-16 text-muted-foreground/50" />
            <div>
              <h2 className="text-xl font-semibold">No recipes yet</h2>
              <p className="text-muted-foreground">
                Generate your first recipe on the dashboard
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
