import { useState } from "react";
import { X, Plus, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { GenerateRecipeResponse } from "@/types/api";
import { useGenerateRecipe } from "@/hooks/useQueries";
import { IngredientSelector } from "@/components/IngredientSelector";
import { useLanguage } from "@/contexts/LanguageContext";

interface RecipeGeneratorProps {
  onRecipeGenerated: (recipe: GenerateRecipeResponse, ingredients: string[]) => void;
}

export function RecipeGenerator({ onRecipeGenerated }: RecipeGeneratorProps) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [preferences, setPreferences] = useState("");
  const { t, language } = useLanguage();

  const generateRecipeMutation = useGenerateRecipe();

  const addIngredient = (ingredient: string) => {
    if (ingredient.trim() && !ingredients.includes(ingredient.trim())) {
      setIngredients([...ingredients, ingredient.trim()]);
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((i) => i !== ingredient));
  };

  const generateRecipe = () => {
    if (ingredients.length === 0) {
      toast.error(t("addIngredientError"));
      return;
    }

    generateRecipeMutation.mutate(
      {
        ingredients,
        preferences: preferences || undefined,
        language,
      },
      {
        onSuccess: (recipe) => {
          onRecipeGenerated(recipe, ingredients);
          toast.success(t("recipeGeneratedSuccess"));
        },
      }
    );
  };

  const isGenerating = generateRecipeMutation.isPending;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {t("recipeGeneratorTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium">{t("yourIngredients")}</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <IngredientSelector 
                onSelect={addIngredient} 
                disabled={isGenerating}
              />
            </div>
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
            {t("preferences")}
          </label>
          <Textarea
            placeholder={t("preferencesPlaceholder")}
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
              {t("generating")}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              {t("generateRecipe")}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
