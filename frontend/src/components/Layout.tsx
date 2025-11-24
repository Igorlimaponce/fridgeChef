import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChefHat, LogOut, BookOpen, Home, ShoppingBasket, Calendar, Languages } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "pt" : "en");
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to={isAuthenticated ? "/dashboard" : "/"}
              className="flex items-center gap-2 text-2xl font-bold text-primary"
            >
              <ChefHat className="h-8 w-8" />
              {t("appTitle")}
            </Link>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="gap-2"
              >
                <Languages className="h-4 w-4" />
                {language.toUpperCase()}
              </Button>

              {isAuthenticated && (
                <>
                  <Link to="/dashboard">
                    <Button
                      variant={location.pathname === "/dashboard" ? "default" : "ghost"}
                      size="sm"
                    >
                      <Home className="mr-2 h-4 w-4" />
                      {t("dashboard")}
                    </Button>
                  </Link>
                  <Link to="/pantry">
                    <Button
                      variant={location.pathname === "/pantry" ? "default" : "ghost"}
                      size="sm"
                    >
                      <ShoppingBasket className="mr-2 h-4 w-4" />
                      {t("pantry")}
                    </Button>
                  </Link>
                  <Link to="/meal-plan">
                    <Button
                      variant={location.pathname === "/meal-plan" ? "default" : "ghost"}
                      size="sm"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {t("mealPlan")}
                    </Button>
                  </Link>
                  <Link to="/my-recipes">
                    <Button
                      variant={location.pathname === "/my-recipes" ? "default" : "ghost"}
                      size="sm"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      {t("myRecipes")}
                    </Button>
                  </Link>
                  <div className="flex items-center gap-3 border-l border-border pl-4">
                    <span className="text-sm text-muted-foreground">
                      {user?.username}
                    </span>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
