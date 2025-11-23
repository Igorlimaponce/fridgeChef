package mealplan

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type MealPlanRepository struct {
	db *sql.DB
}

func NewMealPlanRepository(db *sql.DB) *MealPlanRepository {
	return &MealPlanRepository{db: db}
}

func (r *MealPlanRepository) Create(ctx context.Context, mp *MealPlan) (*MealPlan, error) {
	query := `
		INSERT INTO meal_plans (user_id, recipe_id, date, meal_type)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`
	err := r.db.QueryRowContext(ctx, query, mp.UserID, mp.RecipeID, mp.Date, mp.MealType).Scan(&mp.ID, &mp.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create meal plan: %w", err)
	}
	return mp, nil
}

func (r *MealPlanRepository) List(ctx context.Context, userID uuid.UUID, startDate, endDate string) ([]*MealPlan, error) {
	query := `
		SELECT mp.id, mp.user_id, mp.recipe_id, mp.date, mp.meal_type, mp.created_at, r.title
		FROM meal_plans mp
		JOIN recipes r ON mp.recipe_id = r.id
		WHERE mp.user_id = $1 AND mp.date >= $2 AND mp.date <= $3
		ORDER BY mp.date ASC
	`
	rows, err := r.db.QueryContext(ctx, query, userID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("list meal plans: %w", err)
	}
	defer rows.Close()

	var plans []*MealPlan = []*MealPlan{}
	for rows.Next() {
		var mp MealPlan
		var date time.Time
		if err := rows.Scan(&mp.ID, &mp.UserID, &mp.RecipeID, &date, &mp.MealType, &mp.CreatedAt, &mp.RecipeTitle); err != nil {
			return nil, err
		}
		mp.Date = date.Format("2006-01-02")
		plans = append(plans, &mp)
	}
	return plans, nil
}

func (r *MealPlanRepository) Delete(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	query := `DELETE FROM meal_plans WHERE id = $1 AND user_id = $2`
	result, err := r.db.ExecContext(ctx, query, id, userID)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return fmt.Errorf("meal plan not found")
	}
	return nil
}
