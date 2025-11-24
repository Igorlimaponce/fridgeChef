import { Link } from "react-router-dom";
import { ChefHat, Sparkles, BookOpen, Zap, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Landing() {
  const { t, language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "pt" : "en");
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 text-2xl font-bold text-primary">
            <ChefHat className="h-8 w-8" />
            {t("appTitle")}
          </div>
          <div className="flex gap-3 items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="gap-2"
            >
              <Languages className="h-4 w-4" />
              {language.toUpperCase()}
            </Button>
            <Link to="/login">
              <Button variant="ghost">{t("loginButton")}</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-primary shadow-warm">{t("registerButton")}</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl space-y-16 text-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight md:text-6xl">
              {t("landingTitlePrefix")}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                {" "}
                {t("landingTitleSuffix")}
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              {t("landingSubtitle")}
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-primary shadow-warm">
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t("startCooking")}
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
                <h3 className="text-lg font-semibold">{t("featureAI")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("featureAIDesc")}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card transition-all hover:shadow-warm">
              <CardContent className="space-y-3 pt-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                  <Zap className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-semibold">{t("featureInstant")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("featureInstantDesc")}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card transition-all hover:shadow-warm">
              <CardContent className="space-y-3 pt-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                  <BookOpen className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold">{t("featureSave")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("featureSaveDesc")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
