import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/api";
import { PantryItem } from "@/types/api";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export default function Pantry() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPantry();
  }, []);

  const loadPantry = async () => {
    try {
      const data = await api.getPantryItems();
      setItems(data);
    } catch (error) {
      toast.error("Failed to load pantry items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;

    try {
      const item = await api.addPantryItem(newItemName, newItemQuantity);
      setItems([...items, item]);
      setNewItemName("");
      setNewItemQuantity("");
      toast.success("Item added");
    } catch (error) {
      toast.error("Failed to add item");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deletePantryItem(id);
      setItems(items.filter((i) => i.id !== id));
      toast.success("Item removed");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">My Pantry</h1>
          <p className="text-lg text-muted-foreground">
            Keep track of what you have at home.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="flex gap-4">
              <Input
                placeholder="Item name (e.g., Rice)"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Quantity (optional)"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
                className="w-32"
              />
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" /> Add
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.quantity && (
                    <p className="text-sm text-muted-foreground">
                      {item.quantity}
                    </p>
                  )}
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
          {items.length === 0 && !isLoading && (
            <div className="col-span-full text-center text-muted-foreground py-8">
              Your pantry is empty. Add some items!
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
