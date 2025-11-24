import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfWeek, addDays, endOfWeek } from "date-fns";
import { Trash2, Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMealPlan, useDeleteMealPlan, useRecipes, useAddToMealPlan } from "@/hooks/useQueries";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MealPlanPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{date: string, type: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useLanguage();

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });

  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");

  const { data: plans = [], isLoading } = useMealPlan(startStr, endStr);
  const { data: recipes = [] } = useRecipes();
  const deletePlanMutation = useDeleteMealPlan();
  const addToMealPlanMutation = useAddToMealPlan();

  const handleDelete = (id: string) => {
    deletePlanMutation.mutate(id);
  };

  const openAddModal = (date: string, type: string) => {
    setSelectedSlot({ date, type });
    setSearchTerm("");
    setIsAddModalOpen(true);
  };

  const handleAddRecipe = (recipeId: string) => {
    if (!selectedSlot) return;
    addToMealPlanMutation.mutate({
      recipeId,
      date: selectedSlot.date,
      mealType: selectedSlot.type
    }, {
      onSuccess: () => setIsAddModalOpen(false)
    });
  };

  const filteredRecipes = recipes.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

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
      <div className="mx-auto max-w-full px-4 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">{t("mealPlanHeader")}</h1>
            <p className="text-lg text-muted-foreground">
              {t("mealPlanSubtitle")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCurrentDate(addDays(currentDate, -7))}>{t("previousWeek")}</Button>
            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>{t("today")}</Button>
            <Button variant="outline" onClick={() => setCurrentDate(addDays(currentDate, 7))}>{t("nextWeek")}</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((day) => (
            <div key={day.toString()} className="space-y-4">
              <div className="text-center p-2 bg-muted rounded-lg font-medium sticky top-0 z-10">
                {format(day, "EEE, MMM d")}
              </div>
              <div className="space-y-2">
                {mealTypes.map((type) => {
                  const dayPlans = plans.filter(
                    (p) => p.date === format(day, "yyyy-MM-dd") && p.meal_type === type
                  );
                  return (
                    <Card key={type} className="min-h-[160px] flex flex-col shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs uppercase text-muted-foreground font-bold">
                          {t(type as any)}
                        </CardTitle>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 hover:bg-primary/10 hover:text-primary"
                          onClick={() => openAddModal(format(day, "yyyy-MM-dd"), type)}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-3 pt-0 space-y-2 flex-1">
                        {dayPlans.map((plan) => (
                          <div key={plan.id} className="bg-accent/50 p-2 rounded text-sm relative group border border-transparent hover:border-border transition-colors">
                            <div className="pr-6 font-medium line-clamp-2" title={plan.recipe_title}>
                              {plan.recipe_title || "Recipe"}
                            </div>
                            <button
                              onClick={() => handleDelete(plan.id)}
                              className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 rounded p-0.5"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {dayPlans.length === 0 && (
                          <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                             <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs text-muted-foreground h-6"
                                onClick={() => openAddModal(format(day, "yyyy-MM-dd"), type)}
                              >
                                <Plus className="h-3 w-3 mr-1" /> {t("add")}
                              </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{t("addToMealPlan")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder={t("searchRecipes")} 
                        className="pl-8" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                    {filteredRecipes.map(recipe => (
                        <div 
                            key={recipe.id} 
                            className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors flex justify-between items-center"
                            onClick={() => handleAddRecipe(recipe.id)}
                        >
                            <div>
                                <div className="font-medium">{recipe.title}</div>
                                <div className="text-xs text-muted-foreground">{recipe.calories_estimate} {t("calories")}</div>
                            </div>
                            <Plus className="h-4 w-4 text-muted-foreground" />
                        </div>
                    ))}
                    {filteredRecipes.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                            {t("noRecipesFound")}
                        </div>
                    )}
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
