import { useState } from "react";
import { Layout } from "@/components/Layout";
import { RecipeGenerator } from "@/components/RecipeGenerator";
import { RecipeDisplay } from "@/components/RecipeDisplay";
import { GenerateRecipeResponse } from "@/types/api";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Dashboard() {
  const [generatedRecipe, setGeneratedRecipe] = useState<{
    recipe: GenerateRecipeResponse;
    ingredients: string[];
  } | null>(null);
  const { t } = useLanguage();

  const handleRecipeGenerated = (recipe: GenerateRecipeResponse, ingredients: string[]) => {
    setGeneratedRecipe({ recipe, ingredients });
  };

  const handleRecipeSaved = () => {
    // Could add navigation or refresh logic here
  };

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">{t("aiRecipeGenerator")}</h1>
          <p className="text-lg text-muted-foreground">
            {t("aiRecipeGeneratorSubtitle")}
          </p>
        </div>

        <RecipeGenerator onRecipeGenerated={handleRecipeGenerated} />

        {generatedRecipe && (
          <RecipeDisplay
            recipe={generatedRecipe.recipe}
            ingredients={generatedRecipe.ingredients}
            onSaved={handleRecipeSaved}
          />
        )}
      </div>
    </Layout>
  );
}
