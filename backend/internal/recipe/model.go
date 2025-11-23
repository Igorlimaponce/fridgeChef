package recipe

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Recipe struct {
	ID               uuid.UUID       `json:"id"`
	UserID           uuid.UUID       `json:"user_id"`
	Title            string          `json:"title"`
	IngredientsUsed  json.RawMessage `json:"ingredients_used"`
	ContentMarkdown  string          `json:"content_markdown"`
	CaloriesEstimate int             `json:"calories_estimate"`
	CreatedAt        time.Time       `json:"created_at"`
	IsPublic         bool            `json:"is_public"`
	ShareToken       *string         `json:"share_token,omitempty"`
}

type CreateRecipeRequest struct {
	Title            string   `json:"title"`
	IngredientsUsed  []string `json:"ingredients_used"`
	ContentMarkdown  string   `json:"content_markdown"`
	CaloriesEstimate int      `json:"calories_estimate"`
}

type RecipeFilter struct {
	MaxCalories int
	Ingredient  string
}
