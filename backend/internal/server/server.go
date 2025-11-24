package server

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/Igorlimaponce/fridgeChef/backend/internal/chef"
	"github.com/Igorlimaponce/fridgeChef/backend/internal/database"
	"github.com/Igorlimaponce/fridgeChef/backend/internal/filter"
	"github.com/Igorlimaponce/fridgeChef/backend/internal/mealplan"
	"github.com/Igorlimaponce/fridgeChef/backend/internal/pantry"
	"github.com/Igorlimaponce/fridgeChef/backend/internal/recipe"
	"github.com/Igorlimaponce/fridgeChef/backend/internal/user"
	_ "github.com/joho/godotenv/autoload"
)

type Server struct {
	port int

	db database.Service

	userHandler     *user.UserHandler
	chefHandler     *chef.ChefHandler
	recipeHandler   *recipe.RecipeHandler
	mealPlanHandler *mealplan.MealPlanHandler
	pantryHandler   *pantry.PantryHandler
}

func NewServer() *http.Server {
	port, _ := strconv.Atoi(os.Getenv("PORT"))
	if port == 0 {
		port = 8080
	}
	db := database.New()

	// Init User
	userRepo := user.NewUserRepository(db.GetDB())
	userService := user.NewUserService(userRepo)
	profanityFilter := filter.NewProfanityFilter()
	userHandler := user.NewUserHandler(userService, profanityFilter)

	// Init Pantry
	pantryRepo := pantry.NewPantryRepository(db.GetDB())
	pantryService := pantry.NewPantryService(pantryRepo)
	pantryHandler := pantry.NewPantryHandler(pantryService)

	// Init Chef
	chefService := chef.NewChefService(pantryService)
	chefHandler := chef.NewChefHandler(chefService)

	// Init Recipe
	recipeRepo := recipe.NewRecipeRepository(db.GetDB())
	recipeService := recipe.NewRecipeService(recipeRepo)
	recipeHandler := recipe.NewRecipeHandler(recipeService)

	// Init MealPlan
	mealPlanRepo := mealplan.NewMealPlanRepository(db.GetDB())
	mealPlanService := mealplan.NewMealPlanService(mealPlanRepo)
	mealPlanHandler := mealplan.NewMealPlanHandler(mealPlanService)

	NewServer := &Server{
		port:            port,
		db:              db,
		userHandler:     userHandler,
		chefHandler:     chefHandler,
		recipeHandler:   recipeHandler,
		mealPlanHandler: mealPlanHandler,
		pantryHandler:   pantryHandler,
	}

	// Declare Server config
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", NewServer.port),
		Handler:      NewServer.RegisterRoutes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	return server
}
