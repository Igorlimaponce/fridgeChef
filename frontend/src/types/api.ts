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
