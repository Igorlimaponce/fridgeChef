import { useState } from "react";
import { X, Plus, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import { toast } from "sonner";
import { GenerateRecipeResponse } from "@/types/api";

interface RecipeGeneratorProps {
  onRecipeGenerated: (recipe: GenerateRecipeResponse, ingredients: string[]) => void;
}

export function RecipeGenerator({ onRecipeGenerated }: RecipeGeneratorProps) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [preferences, setPreferences] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((i) => i !== ingredient));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  };

  const generateRecipe = async () => {
    if (ingredients.length === 0) {
      toast.error("Please add at least one ingredient");
      return;
    }

    setIsGenerating(true);
    try {
      const recipe = await api.generateRecipe({
        ingredients,
        preferences: preferences || undefined,
      });
      onRecipeGenerated(recipe, ingredients);
      toast.success("Recipe generated successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate recipe");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Generate Recipe from Ingredients
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium">Your Ingredients</label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., eggs, tomatoes, cheese..."
              value={currentIngredient}
              onChange={(e) => setCurrentIngredient(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isGenerating}
            />
            <Button
              onClick={addIngredient}
              variant="secondary"
              disabled={isGenerating || !currentIngredient.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 rounded-md border border-border bg-secondary/50 p-3">
              {ingredients.map((ingredient) => (
                <Badge
                  key={ingredient}
                  variant="secondary"
                  className="gap-1 px-3 py-1 text-sm"
                >
                  {ingredient}
                  <button
                    onClick={() => removeIngredient(ingredient)}
                    className="ml-1 hover:text-destructive"
                    disabled={isGenerating}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">
            Preferences (optional)
          </label>
          <Textarea
            placeholder="e.g., quick meal, low-carb, spicy..."
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            disabled={isGenerating}
            rows={3}
          />
        </div>

        <Button
          onClick={generateRecipe}
          className="w-full bg-gradient-primary shadow-warm"
          disabled={isGenerating || ingredients.length === 0}
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              AI Chef is cooking...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Recipe
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
