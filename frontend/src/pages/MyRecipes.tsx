import { useState } from "react";
import { Layout } from "@/components/Layout";
import { RecipeCard } from "@/components/RecipeCard";
import { Loader2, ChefHat, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRecipes, useDeleteRecipe } from "@/hooks/useQueries";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MyRecipes() {
  const [filterIngredient, setFilterIngredient] = useState("");
  const [filterCalories, setFilterCalories] = useState("");
  const [activeFilter, setActiveFilter] = useState<{
    ingredient?: string;
    max_calories?: number;
  }>({});
  const { t } = useLanguage();

  const { data: recipes = [], isLoading } = useRecipes(activeFilter);
  const deleteRecipeMutation = useDeleteRecipe();

  const handleFilter = () => {
    setActiveFilter({
      ingredient: filterIngredient || undefined,
      max_calories: filterCalories ? parseInt(filterCalories) : undefined,
    });
  };

  const handleDelete = (id: string) => {
    deleteRecipeMutation.mutate(id);
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
          <h1 className="text-4xl font-bold">{t("mySavedRecipes")}</h1>
          <p className="text-lg text-muted-foreground">
            {t("mySavedRecipesSubtitle")}
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-end bg-card p-4 rounded-lg border shadow-sm">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="ingredient">{t("ingredient")}</Label>
            <Input
              id="ingredient"
              value={filterIngredient}
              onChange={(e) => setFilterIngredient(e.target.value)}
              placeholder="e.g. Chicken"
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="calories">{t("maxCalories")}</Label>
            <Input
              id="calories"
              type="number"
              value={filterCalories}
              onChange={(e) => setFilterCalories(e.target.value)}
              placeholder="e.g. 500"
            />
          </div>
          <Button onClick={handleFilter}>
            <Search className="mr-2 h-4 w-4" /> {t("filter")}
          </Button>
        </div>

        {recipes.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
            <ChefHat className="h-16 w-16 text-muted-foreground/50" />
            <div>
              <h2 className="text-xl font-semibold">{t("noRecipesFound")}</h2>
              <p className="text-muted-foreground">
                {t("noRecipesFoundDesc")}
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
