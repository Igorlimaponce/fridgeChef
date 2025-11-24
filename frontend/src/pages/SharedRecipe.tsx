import { useParams } from "react-router-dom";
import { Loader2, ChefHat, Flame, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePublicRecipe } from "@/hooks/useQueries";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SharedRecipe() {
  const { token } = useParams();
  const { data: recipe, isLoading, error } = usePublicRecipe(token || "");
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
        <ChefHat className="h-16 w-16 text-muted-foreground/50" />
        <h1 className="text-2xl font-bold">{t("recipeNotFound")}</h1>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : t("recipeNotFoundDesc")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl">{recipe.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Flame className="h-5 w-5 text-primary" />
                <span>{recipe.calories_estimate} {t("calories")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-5 w-5" />
                <span>{new Date(recipe.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-semibold">{t("ingredients")}</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.ingredients_used.map((ingredient) => (
                  <Badge key={ingredient} variant="secondary">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="prose max-w-none dark:prose-invert">
              <div
                dangerouslySetInnerHTML={{
                  __html: recipe.content_markdown
                    .split("\n")
                    .map((line) => {
                      if (line.startsWith("## ")) {
                        return `<h2 class="text-xl font-bold mt-6 mb-3">${line.slice(3)}</h2>`;
                      }
                      if (line.startsWith("- ")) {
                        return `<li class="ml-4">${line.slice(2)}</li>`;
                      }
                      if (line.match(/^\d+\. /)) {
                         return `<div class="flex gap-2 mb-2"><span class="font-bold min-w-[20px]">${line.split(".")[0]}.</span><span>${line.split(".").slice(1).join(".")}</span></div>`;
                      }
                      return `<p class="mb-2">${line}</p>`;
                    })
                    .join(""),
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
