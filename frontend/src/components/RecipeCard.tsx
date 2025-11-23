import { useState } from "react";
import { Trash2, Flame, Calendar, Share2, Globe } from "lucide-react";
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
import { api } from "@/services/api";
import { toast } from "sonner";

interface RecipeCardProps {
  recipe: Recipe;
  onDelete: (id: string) => void;
}

export function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  const [showFull, setShowFull] = useState(false);
  const [isPublic, setIsPublic] = useState(recipe.is_public);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [planDate, setPlanDate] = useState("");
  const [planType, setPlanType] = useState("dinner");

  const previewContent = recipe.content_markdown.slice(0, 200) + "...";

  const handleShare = async () => {
    try {
      const updated = await api.toggleShareRecipe(recipe.id);
      setIsPublic(updated.is_public);
      if (updated.is_public) {
        const url = `${window.location.origin}/shared/${updated.share_token}`;
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      } else {
        toast.success("Recipe is now private");
      }
    } catch (error) {
      toast.error("Failed to update share settings");
    }
  };

  const handleAddToPlan = async () => {
    if (!planDate) {
      toast.error("Please select a date");
      return;
    }
    try {
      await api.addToMealPlan(recipe.id, planDate, planType);
      toast.success("Added to meal plan");
      setIsPlanOpen(false);
    } catch (error) {
      toast.error("Failed to add to meal plan");
    }
  };

  return (
    <Card className="group transition-all hover:shadow-warm">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl">{recipe.title}</CardTitle>
          <div className="flex gap-1">
            <Dialog open={isPlanOpen} onOpenChange={setIsPlanOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  title="Add to Meal Plan"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add to Meal Plan</DialogTitle>
                  <DialogDescription>
                    Schedule "{recipe.title}" for a meal.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Date
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
                      Meal
                    </Label>
                    <Select value={planType} onValueChange={setPlanType}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select meal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddToPlan}>Add to Plan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="opacity-0 transition-opacity group-hover:opacity-100"
              title={isPublic ? "Make Private" : "Share Publicly"}
            >
              {isPublic ? (
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
                  <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{recipe.title}"? This action
                    cannot be undone.
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
