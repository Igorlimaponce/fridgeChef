import { useState } from "react";
import { Save, Loader2, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import { toast } from "sonner";
import { GenerateRecipeResponse } from "@/types/api";

interface RecipeDisplayProps {
  recipe: GenerateRecipeResponse;
  ingredients: string[];
  onSaved?: () => void;
}

export function RecipeDisplay({ recipe, ingredients, onSaved }: RecipeDisplayProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.saveRecipe({
        title: recipe.title,
        content_markdown: recipe.content,
        ingredients_used: ingredients,
        calories_estimate: recipe.calories,
      });
      toast.success("Recipe saved to your collection!");
      onSaved?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save recipe");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl">{recipe.title}</CardTitle>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Flame className="h-4 w-4 text-primary" />
              <span className="font-medium">{recipe.calories} calories</span>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-accent shadow-warm"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Recipe
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="mb-3 font-semibold">Ingredients Used</h3>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ingredient) => (
              <Badge key={ingredient} variant="secondary">
                {ingredient}
              </Badge>
            ))}
          </div>
        </div>

        <div className="prose prose-sm max-w-none">
          <div
            className="space-y-4 text-foreground"
            dangerouslySetInnerHTML={{
              __html: recipe.content
                .split("\n")
                .map((line) => {
                  if (line.startsWith("## ")) {
                    return `<h3 class="text-lg font-semibold mt-4 mb-2">${line.slice(3)}</h3>`;
                  }
                  if (line.startsWith("- ")) {
                    return `<li class="ml-4">${line.slice(2)}</li>`;
                  }
                  if (line.match(/^\d+\./)) {
                    return `<li class="ml-4">${line}</li>`;
                  }
                  if (line.trim() === "") {
                    return "<br/>";
                  }
                  return `<p>${line}</p>`;
                })
                .join(""),
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
