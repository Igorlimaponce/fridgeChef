import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyRecipes from "./pages/MyRecipes";
import Pantry from "./pages/Pantry";
import MealPlan from "./pages/MealPlan";
import SharedRecipe from "./pages/SharedRecipe";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-recipes"
                element={
                  <ProtectedRoute>
                    <MyRecipes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pantry"
                element={
                  <ProtectedRoute>
                    <Pantry />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meal-plan"
                element={
                  <ProtectedRoute>
                    <MealPlan />
                  </ProtectedRoute>
                }
              />
              <Route path="/shared/:token" element={<SharedRecipe />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
