package mealplan

import (
	"time"

	"github.com/google/uuid"
)

type MealPlan struct {
	ID          uuid.UUID `json:"id"`
	UserID      uuid.UUID `json:"user_id"`
	RecipeID    uuid.UUID `json:"recipe_id"`
	Date        string    `json:"date"` // YYYY-MM-DD
	MealType    string    `json:"meal_type"`
	CreatedAt   time.Time `json:"created_at"`
	RecipeTitle string    `json:"recipe_title,omitempty"`
}

type CreateMealPlanRequest struct {
	RecipeID uuid.UUID `json:"recipe_id"`
	Date     string    `json:"date"`
	MealType string    `json:"meal_type"`
}
