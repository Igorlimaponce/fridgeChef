import { useState } from "react";
import { Trash2, Flame, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Recipe } from "@/types/api";

interface RecipeCardProps {
  recipe: Recipe;
  onDelete: (id: string) => void;
}

export function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  const [showFull, setShowFull] = useState(false);

  const previewContent = recipe.content_markdown.slice(0, 200) + "...";

  return (
    <Card className="group transition-all hover:shadow-warm">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl">{recipe.title}</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{recipe.title}"? This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(recipe.id)}
                  className="bg-destructive text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-primary" />
            <span>{recipe.calories_estimate} cal</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(recipe.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-medium">Ingredients</h4>
          <div className="flex flex-wrap gap-2">
            {(recipe.ingredients_used || []).slice(0, 5).map((ingredient) => (
              <Badge key={ingredient} variant="secondary" className="text-xs">
                {ingredient}
              </Badge>
            ))}
            {(recipe.ingredients_used || []).length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{(recipe.ingredients_used || []).length - 5} more
              </Badge>
            )}
          </div>
        </div>

        <div className="prose prose-sm max-w-none">
          <div
            className="text-sm text-foreground/80"
            dangerouslySetInnerHTML={{
              __html: (showFull ? recipe.content_markdown : previewContent)
                .split("\n")
                .slice(0, 8)
                .map((line) => {
                  if (line.startsWith("## ")) {
                    return `<h4 class="font-semibold mt-2 mb-1">${line.slice(3)}</h4>`;
                  }
                  if (line.startsWith("- ")) {
                    return `<li class="ml-4 text-xs">${line.slice(2)}</li>`;
                  }
                  return `<p class="text-xs">${line}</p>`;
                })
                .join(""),
            }}
          />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFull(!showFull)}
          className="w-full"
        >
          {showFull ? "Show Less" : "View Full Recipe"}
        </Button>
      </CardContent>
    </Card>
  );
}
