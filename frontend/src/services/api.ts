import {
  AuthResponse,
  BackendAuthResponse,
  LoginRequest,
  RegisterRequest,
  GenerateRecipeRequest,
  GenerateRecipeResponse,
  SaveRecipeRequest,
  Recipe,
} from "@/types/api";

const BASE_URL = "http://localhost:8080/api/v1";
const USE_MOCK = false; // Toggle this to switch between mock and real API

// Mock data for development
const mockRecipes: Recipe[] = [
  {
    id: "1",
    user_id: "mock-user",
    title: "Classic Carbonara",
    ingredients_used: ["pasta", "eggs", "bacon", "parmesan"],
    content_markdown: `## Ingredients
- 400g spaghetti
- 200g bacon, diced
- 4 large eggs
- 100g parmesan, grated

## Instructions
1. Cook pasta in salted boiling water
2. Fry bacon until crispy
3. Whisk eggs and parmesan together
4. Drain pasta, mix with bacon
5. Remove from heat, stir in egg mixture quickly
6. Serve immediately with extra parmesan`,
    calories_estimate: 650,
    created_at: new Date().toISOString(),
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function mockApiCall<T>(data: T, delayMs = 800): Promise<T> {
  await delay(delayMs);
  return data;
}

// API Service
export const api = {
  // Authentication
  async register(data: RegisterRequest): Promise<AuthResponse> {
    if (USE_MOCK) {
      return mockApiCall({
        token: "mock-jwt-token-" + Date.now(),
        user: {
          id: "mock-user-id",
          email: data.email,
          username: data.username,
          created_at: new Date().toISOString(),
        },
      });
    }

    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    const backendResp: BackendAuthResponse = await response.json();
    return {
      token: backendResp.AccessToken,
      user: {
        id: backendResp.id,
        username: backendResp.username,
        email: data.email, // Backend response doesn't include email currently, so we use the one from request
      },
    };
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    if (USE_MOCK) {
      return mockApiCall({
        token: "mock-jwt-token-" + Date.now(),
        user: {
          id: "mock-user-id",
          email: data.email,
          username: "Chef User",
          created_at: new Date().toISOString(),
        },
      });
    }

    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const backendResp: BackendAuthResponse = await response.json();
    return {
      token: backendResp.AccessToken,
      user: {
        id: backendResp.id,
        username: backendResp.username,
        email: data.email,
      },
    };
  },

  // AI Recipe Generation
  async generateRecipe(
    data: GenerateRecipeRequest
  ): Promise<GenerateRecipeResponse> {
    if (USE_MOCK) {
      return mockApiCall(
        {
          title: `Delicious ${data.ingredients[0]} Dish`,
          content: `## Ingredients
${data.ingredients.map((ing) => `- ${ing}`).join("\n")}

## Instructions
1. Prepare all ingredients
2. Combine ${data.ingredients.slice(0, 2).join(" and ")} in a bowl
3. Cook over medium heat for 15 minutes
4. Season to taste
5. Serve hot and enjoy!

${data.preferences ? `*Note: ${data.preferences}*` : ""}`,
          calories: Math.floor(Math.random() * 400) + 300,
        },
        2000
      ); // Longer delay to simulate AI processing
    }

    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/chef/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Recipe generation failed");
    }

    return response.json();
  },

  // Recipe Management
  async saveRecipe(data: SaveRecipeRequest): Promise<Recipe> {
    if (USE_MOCK) {
      const newRecipe: Recipe = {
        id: "recipe-" + Date.now(),
        user_id: "mock-user-id",
        ...data,
        created_at: new Date().toISOString(),
      };
      mockRecipes.unshift(newRecipe);
      return mockApiCall(newRecipe);
    }

    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to save recipe");
    }

    return response.json();
  },

  async getRecipes(): Promise<Recipe[]> {
    if (USE_MOCK) {
      return mockApiCall([...mockRecipes]);
    }

    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/recipes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch recipes");
    }

    const data = await response.json();
    return data || [];
  },

  async deleteRecipe(id: string): Promise<void> {
    if (USE_MOCK) {
      const index = mockRecipes.findIndex((r) => r.id === id);
      if (index > -1) mockRecipes.splice(index, 1);
      return mockApiCall(undefined);
    }

    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/recipes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete recipe");
    }
  },
};
