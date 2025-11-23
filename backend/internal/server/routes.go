package server

import (
	"encoding/json"
	"log"
	"net/http"

	appMiddleware "github.com/Igorlimaponce/fridgeChef/backend/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func (s *Server) RegisterRoutes() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/", s.HelloWorldHandler)

	r.Get("/health", s.healthHandler)

	r.Route("/api/v1", func(r chi.Router) {
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", s.userHandler.CreateUser)
			r.Post("/login", s.userHandler.Login)
			r.Post("/logout", s.userHandler.Logout)
		})

		r.Route("/chef", func(r chi.Router) {
			r.Use(appMiddleware.JWTAuth)
			r.Post("/generate", s.chefHandler.GenerateRecipe)
		})

		r.Route("/recipes", func(r chi.Router) {
			r.Use(appMiddleware.JWTAuth)
			r.Post("/", s.recipeHandler.CreateRecipe)
			r.Get("/", s.recipeHandler.ListRecipes)
			r.Delete("/{id}", s.recipeHandler.DeleteRecipe)
			r.Post("/{id}/share", s.recipeHandler.ToggleShare)
		})

		r.Get("/recipes/share/{token}", s.recipeHandler.GetPublicRecipe)

		r.Route("/meal-plans", func(r chi.Router) {
			r.Use(appMiddleware.JWTAuth)
			r.Post("/", s.mealPlanHandler.Create)
			r.Get("/", s.mealPlanHandler.List)
			r.Delete("/{id}", s.mealPlanHandler.Delete)
		})

		r.Route("/pantry", func(r chi.Router) {
			r.Use(appMiddleware.JWTAuth)
			r.Post("/", s.pantryHandler.Create)
			r.Get("/", s.pantryHandler.List)
			r.Delete("/{id}", s.pantryHandler.Delete)
		})
	})

	return r
}

func (s *Server) HelloWorldHandler(w http.ResponseWriter, r *http.Request) {
	resp := make(map[string]string)
	resp["message"] = "Hello World"

	jsonResp, err := json.Marshal(resp)
	if err != nil {
		log.Fatalf("error handling JSON marshal. Err: %v", err)
	}

	_, _ = w.Write(jsonResp)
}

func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	jsonResp, _ := json.Marshal(s.db.Health())
	_, _ = w.Write(jsonResp)
}
