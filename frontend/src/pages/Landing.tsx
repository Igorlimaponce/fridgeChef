import { Link } from "react-router-dom";
import { ChefHat, Sparkles, BookOpen, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 text-2xl font-bold text-primary">
            <ChefHat className="h-8 w-8" />
            Fridge Chef
          </div>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-primary shadow-warm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl space-y-16 text-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight md:text-6xl">
              Turn Your Ingredients Into
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                {" "}
                Delicious Meals
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Let AI be your personal chef. Input what's in your fridge and get instant,
              creative recipes tailored to your ingredients.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-primary shadow-warm">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Cooking with AI
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="shadow-card transition-all hover:shadow-warm">
              <CardContent className="space-y-3 pt-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold">AI-Powered</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced AI generates creative recipes from your available ingredients
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card transition-all hover:shadow-warm">
              <CardContent className="space-y-3 pt-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                  <Zap className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Instant Results</h3>
                <p className="text-sm text-muted-foreground">
                  Get complete recipes with instructions and calorie estimates in seconds
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card transition-all hover:shadow-warm">
              <CardContent className="space-y-3 pt-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                  <BookOpen className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Save & Organize</h3>
                <p className="text-sm text-muted-foreground">
                  Build your personal recipe collection and access it anytime
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
