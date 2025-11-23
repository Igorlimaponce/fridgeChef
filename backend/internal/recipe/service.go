package recipe

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
)

type RecipeService struct {
	repo *RecipeRepository
}

func NewRecipeService(repo *RecipeRepository) *RecipeService {
	return &RecipeService{repo: repo}
}

func (s *RecipeService) CreateRecipe(ctx context.Context, userID uuid.UUID, req CreateRecipeRequest) (*Recipe, error) {
	ingredientsJSON, err := json.Marshal(req.IngredientsUsed)
	if err != nil {
		return nil, err
	}

	recipe := &Recipe{
		UserID:           userID,
		Title:            req.Title,
		IngredientsUsed:  ingredientsJSON,
		ContentMarkdown:  req.ContentMarkdown,
		CaloriesEstimate: req.CaloriesEstimate,
	}

	return s.repo.CreateRecipe(ctx, recipe)
}

func (s *RecipeService) ListRecipes(ctx context.Context, userID uuid.UUID, filter RecipeFilter) ([]*Recipe, error) {
	return s.repo.ListRecipes(ctx, userID, filter)
}

func (s *RecipeService) DeleteRecipe(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	return s.repo.DeleteRecipe(ctx, id, userID)
}

func (s *RecipeService) ToggleShare(ctx context.Context, id uuid.UUID, userID uuid.UUID) (*Recipe, error) {
	recipe, err := s.repo.GetRecipeByID(ctx, id, userID)
	if err != nil {
		return nil, err
	}
	if recipe == nil {
		return nil, fmt.Errorf("recipe not found")
	}

	recipe.IsPublic = !recipe.IsPublic
	if recipe.IsPublic && recipe.ShareToken == nil {
		b := make([]byte, 16)
		if _, err := rand.Read(b); err != nil {
			return nil, err
		}
		token := hex.EncodeToString(b)
		recipe.ShareToken = &token
	} else if !recipe.IsPublic {
		recipe.ShareToken = nil
	}

	if err := s.repo.UpdateRecipe(ctx, recipe); err != nil {
		return nil, err
	}
	return recipe, nil
}

func (s *RecipeService) GetPublicRecipe(ctx context.Context, token string) (*Recipe, error) {
	return s.repo.GetRecipeByToken(ctx, token)
}
