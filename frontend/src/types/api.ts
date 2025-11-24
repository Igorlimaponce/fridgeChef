// Type definitions matching backend PostgreSQL schema

export interface User {
  id: string;
  email: string;
  username: string;
  created_at?: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  ingredients_used: string[];
  content_markdown: string;
  calories_estimate: number;
  created_at: string;
  is_public?: boolean;
  share_token?: string;
}

export interface PantryItem {
  id: string;
  user_id: string;
  name: string;
  quantity: string;
  unit?: string;
  created_at: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  recipe_id: string;
  date: string;
  meal_type: string;
  recipe_title?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface BackendAuthResponse {
  AccessToken: string;
  id: string;
  username: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GenerateRecipeRequest {
  ingredients: string[];
  preferences?: string;
  language?: string;
}

export interface GenerateRecipeResponse {
  title: string;
  content: string;
  calories: number;
}

export interface SaveRecipeRequest {
  title: string;
  content_markdown: string;
  ingredients_used: string[];
  calories_estimate: number;
}

export interface RecipeFilter {
  ingredient?: string;
  max_calories?: number;
}
