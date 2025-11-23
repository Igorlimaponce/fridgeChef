import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/api";
import { MealPlan } from "@/types/api";
import { toast } from "sonner";
import { format, startOfWeek, addDays, endOfWeek } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MealPlanPage() {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });

  useEffect(() => {
    loadMealPlan();
  }, [currentDate]);

  const loadMealPlan = async () => {
    try {
      const startStr = format(startDate, "yyyy-MM-dd");
      const endStr = format(endDate, "yyyy-MM-dd");
      const data = await api.getMealPlan(startStr, endStr);
      setPlans(data);
    } catch (error) {
      toast.error("Failed to load meal plan");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteMealPlan(id);
      setPlans(plans.filter((p) => p.id !== id));
      toast.success("Removed from meal plan");
    } catch (error) {
      toast.error("Failed to remove");
    }
  };

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Meal Plan</h1>
            <p className="text-lg text-muted-foreground">
              Plan your week ahead.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCurrentDate(addDays(currentDate, -7))}>Previous Week</Button>
            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
            <Button variant="outline" onClick={() => setCurrentDate(addDays(currentDate, 7))}>Next Week</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((day) => (
            <div key={day.toString()} className="space-y-4">
              <div className="text-center p-2 bg-muted rounded-lg font-medium">
                {format(day, "EEE, MMM d")}
              </div>
              <div className="space-y-2">
                {mealTypes.map((type) => {
                  const dayPlans = plans.filter(
                    (p) => p.date === format(day, "yyyy-MM-dd") && p.meal_type === type
                  );
                  return (
                    <Card key={type} className="min-h-[100px]">
                      <CardHeader className="p-3 pb-0">
                        <CardTitle className="text-xs uppercase text-muted-foreground font-bold">
                          {type}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 space-y-2">
                        {dayPlans.map((plan) => (
                          <div key={plan.id} className="bg-accent/50 p-2 rounded text-sm relative group">
                            <div className="pr-6 truncate" title={plan.recipe_title}>
                              {plan.recipe_title || "Recipe"}
                            </div>
                            <button
                              onClick={() => handleDelete(plan.id)}
                              className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
