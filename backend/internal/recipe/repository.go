package recipe

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
)

type RecipeRepository struct {
	db *sql.DB
}

func NewRecipeRepository(db *sql.DB) *RecipeRepository {
	return &RecipeRepository{db: db}
}

func (r *RecipeRepository) CreateRecipe(ctx context.Context, recipe *Recipe) (*Recipe, error) {
	query := `
		INSERT INTO recipes (user_id, title, ingredients_used, content_markdown, calories_estimate)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at
	`

	err := r.db.QueryRowContext(ctx, query,
		recipe.UserID,
		recipe.Title,
		recipe.IngredientsUsed,
		recipe.ContentMarkdown,
		recipe.CaloriesEstimate,
	).Scan(&recipe.ID, &recipe.CreatedAt)

	if err != nil {
		return nil, fmt.Errorf("create recipe: %w", err)
	}

	return recipe, nil
}

func (r *RecipeRepository) ListRecipes(ctx context.Context, userID uuid.UUID, filter RecipeFilter) ([]*Recipe, error) {
	query := `
		SELECT id, user_id, title, ingredients_used, content_markdown, calories_estimate, created_at, is_public, share_token
		FROM recipes
		WHERE user_id = $1
	`
	args := []interface{}{userID}
	argCount := 1

	if filter.MaxCalories > 0 {
		argCount++
		query += fmt.Sprintf(" AND calories_estimate <= $%d", argCount)
		args = append(args, filter.MaxCalories)
	}

	if filter.Ingredient != "" {
		argCount++
		// Assuming ingredients_used is JSONB. We construct a JSON array string for containment check.
		query += fmt.Sprintf(" AND ingredients_used @> $%d::jsonb", argCount)
		jsonArg := fmt.Sprintf(`["%s"]`, filter.Ingredient)
		args = append(args, jsonArg)
	}

	query += " ORDER BY created_at DESC"

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list recipes: %w", err)
	}
	defer rows.Close()

	var recipes []*Recipe = []*Recipe{}
	for rows.Next() {
		var recipe Recipe
		if err := rows.Scan(
			&recipe.ID,
			&recipe.UserID,
			&recipe.Title,
			&recipe.IngredientsUsed,
			&recipe.ContentMarkdown,
			&recipe.CaloriesEstimate,
			&recipe.CreatedAt,
			&recipe.IsPublic,
			&recipe.ShareToken,
		); err != nil {
			return nil, fmt.Errorf("scan recipe: %w", err)
		}
		recipes = append(recipes, &recipe)
	}

	return recipes, nil
}

func (r *RecipeRepository) UpdateRecipe(ctx context.Context, recipe *Recipe) error {
	query := `
		UPDATE recipes
		SET is_public = $1, share_token = $2
		WHERE id = $3 AND user_id = $4
	`
	_, err := r.db.ExecContext(ctx, query, recipe.IsPublic, recipe.ShareToken, recipe.ID, recipe.UserID)
	if err != nil {
		return fmt.Errorf("update recipe: %w", err)
	}
	return nil
}

func (r *RecipeRepository) GetRecipeByToken(ctx context.Context, token string) (*Recipe, error) {
	query := `
		SELECT id, user_id, title, ingredients_used, content_markdown, calories_estimate, created_at, is_public, share_token
		FROM recipes
		WHERE share_token = $1 AND is_public = true
	`
	var recipe Recipe
	err := r.db.QueryRowContext(ctx, query, token).Scan(
		&recipe.ID,
		&recipe.UserID,
		&recipe.Title,
		&recipe.IngredientsUsed,
		&recipe.ContentMarkdown,
		&recipe.CaloriesEstimate,
		&recipe.CreatedAt,
		&recipe.IsPublic,
		&recipe.ShareToken,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get recipe by token: %w", err)
	}
	return &recipe, nil
}

func (r *RecipeRepository) GetRecipeByID(ctx context.Context, id uuid.UUID, userID uuid.UUID) (*Recipe, error) {
	query := `
		SELECT id, user_id, title, ingredients_used, content_markdown, calories_estimate, created_at, is_public, share_token
		FROM recipes
		WHERE id = $1 AND user_id = $2
	`
	var recipe Recipe
	err := r.db.QueryRowContext(ctx, query, id, userID).Scan(
		&recipe.ID,
		&recipe.UserID,
		&recipe.Title,
		&recipe.IngredientsUsed,
		&recipe.ContentMarkdown,
		&recipe.CaloriesEstimate,
		&recipe.CreatedAt,
		&recipe.IsPublic,
		&recipe.ShareToken,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get recipe by id: %w", err)
	}
	return &recipe, nil
}

func (r *RecipeRepository) DeleteRecipe(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	query := `DELETE FROM recipes WHERE id = $1 AND user_id = $2`
	result, err := r.db.ExecContext(ctx, query, id, userID)
	if err != nil {
		return fmt.Errorf("delete recipe: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("rows affected: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("recipe not found or unauthorized")
	}

	return nil
}
