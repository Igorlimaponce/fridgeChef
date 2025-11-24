import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { usePantry, useAddPantryItem, useDeletePantryItem } from "@/hooks/useQueries";
import { IngredientSelector } from "@/components/IngredientSelector";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Pantry() {
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("unit");
  const { t } = useLanguage();

  const { data: items = [], isLoading } = usePantry();
  const addItemMutation = useAddPantryItem();
  const deleteItemMutation = useDeletePantryItem();

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newItemName) return;

    addItemMutation.mutate(
      { name: newItemName, quantity: newItemQuantity, unit: newItemUnit },
      {
        onSuccess: () => {
          setNewItemName("");
          setNewItemQuantity("");
          setNewItemUnit("unit");
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteItemMutation.mutate(id);
  };

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
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">{t("pantryTitle")}</h1>
          <p className="text-lg text-muted-foreground">
            {t("pantrySubtitle")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("addItem")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <IngredientSelector 
                  onSelect={(val) => {
                    setNewItemName(val);
                  }} 
                />
                {newItemName && (
                  <div className="text-sm text-muted-foreground">
                    Selected: <span className="font-medium text-foreground">{newItemName}</span>
                  </div>
                )}
              </div>
              <div className="w-24">
                <Input
                  placeholder={t("quantity")}
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                />
              </div>
              <div className="w-24">
                <Select value={newItemUnit} onValueChange={setNewItemUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unit">Unit</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="l">L</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="tbsp">tbsp</SelectItem>
                    <SelectItem value="tsp">tsp</SelectItem>
                    <SelectItem value="cup">cup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => handleAdd()} 
                disabled={addItemMutation.isPending || !newItemName}
              >
                {addItemMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {t("add")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} {item.unit !== "unit" ? item.unit : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item.id)}
                  className="text-destructive hover:text-destructive/90"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-8">
              {t("notFound")}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
