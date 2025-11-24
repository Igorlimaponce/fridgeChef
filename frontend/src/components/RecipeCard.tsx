import { useState } from "react";
import { Trash2, Flame, Calendar, Share2, Globe, Loader2, Maximize2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Recipe } from "@/types/api";
import { toast } from "sonner";
import { useToggleShareRecipe, useAddToMealPlan } from "@/hooks/useQueries";
import { useLanguage } from "@/contexts/LanguageContext";

interface RecipeCardProps {
  recipe: Recipe;
  onDelete: (id: string) => void;
}

export function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  const [planDate, setPlanDate] = useState("");
  const [planType, setPlanType] = useState("dinner");
  const { t } = useLanguage();

  const toggleShareMutation = useToggleShareRecipe();
  const addToPlanMutation = useAddToMealPlan();

  const previewContent = recipe.content_markdown.slice(0, 200) + "...";

  const handleShare = () => {
    toggleShareMutation.mutate(recipe.id, {
      onSuccess: (updated) => {
        if (updated.is_public) {
          const url = `${window.location.origin}/shared/${updated.share_token}`;
          navigator.clipboard.writeText(url);
          toast.success(t("shareSuccess"));
        } else {
          toast.success(t("sharePrivate"));
        }
      },
    });
  };

  const handleAddToPlan = () => {
    if (!planDate) {
      toast.error("Please select a date");
      return;
    }
    addToPlanMutation.mutate(
      { recipeId: recipe.id, date: planDate, mealType: planType },
      {
        onSuccess: () => {
          setIsPlanOpen(false);
        },
      }
    );
  };

  const renderMarkdown = (content: string) => {
    return content
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
      .join("");
  };

  return (
    <>
      <Card className="group transition-all hover:shadow-warm flex flex-col h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-xl line-clamp-2">{recipe.title}</CardTitle>
            <div className="flex gap-1 shrink-0">
              <Dialog open={isPlanOpen} onOpenChange={setIsPlanOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    title={t("addToMealPlan")}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("mealPlanTitle")}</DialogTitle>
                    <DialogDescription>
                      {t("scheduleMeal").replace("{recipe}", recipe.title)}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">
                        {t("date")}
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        className="col-span-3"
                        value={planDate}
                        onChange={(e) => setPlanDate(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">
                        {t("meal")}
                      </Label>
                      <Select value={planType} onValueChange={setPlanType}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select meal type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">{t("breakfast")}</SelectItem>
                          <SelectItem value="lunch">{t("lunch")}</SelectItem>
                          <SelectItem value="dinner">{t("dinner")}</SelectItem>
                          <SelectItem value="snack">{t("snack")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddToPlan} disabled={addToPlanMutation.isPending}>
                      {addToPlanMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t("add")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="opacity-0 transition-opacity group-hover:opacity-100"
                title={recipe.is_public ? t("makePrivate") : t("share")}
                disabled={toggleShareMutation.isPending}
              >
                {toggleShareMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : recipe.is_public ? (
                  <Globe className="h-4 w-4 text-blue-500" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
              </Button>
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
                    <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("deleteConfirm").replace("{recipe}", recipe.title)}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(recipe.id)}
                      className="bg-destructive text-destructive-foreground"
                    >
                      {t("delete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-primary" />
              <span>{recipe.calories_estimate} {t("calories")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(recipe.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col">
          <div>
            <h4 className="mb-2 text-sm font-medium">{t("ingredients")}</h4>
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

          <div className="prose prose-sm max-w-none flex-1">
            <div
              className="text-sm text-foreground/80 line-clamp-6"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(previewContent)
              }}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullViewOpen(true)}
            className="w-full mt-auto gap-2"
          >
            <Maximize2 className="h-4 w-4" />
            {t("viewFullRecipe")}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isFullViewOpen} onOpenChange={setIsFullViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{recipe.title}</DialogTitle>
            <div className="flex items-center gap-4 text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-primary" />
                <span>{recipe.calories_estimate} {t("calories")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(recipe.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div>
              <h3 className="mb-3 font-semibold">{t("ingredientsUsed")}</h3>
              <div className="flex flex-wrap gap-2">
                {(recipe.ingredients_used || []).map((ingredient) => (
                  <Badge key={ingredient} variant="secondary">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="prose max-w-none dark:prose-invert">
              <div
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(recipe.content_markdown)
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
