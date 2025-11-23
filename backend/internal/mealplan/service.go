package mealplan

import (
	"context"

	"github.com/google/uuid"
)

type MealPlanService struct {
	repo *MealPlanRepository
}

func NewMealPlanService(repo *MealPlanRepository) *MealPlanService {
	return &MealPlanService{repo: repo}
}

func (s *MealPlanService) Create(ctx context.Context, userID uuid.UUID, req CreateMealPlanRequest) (*MealPlan, error) {
	mp := &MealPlan{
		UserID:   userID,
		RecipeID: req.RecipeID,
		Date:     req.Date,
		MealType: req.MealType,
	}
	return s.repo.Create(ctx, mp)
}

func (s *MealPlanService) List(ctx context.Context, userID uuid.UUID, startDate, endDate string) ([]*MealPlan, error) {
	return s.repo.List(ctx, userID, startDate, endDate)
}

func (s *MealPlanService) Delete(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	return s.repo.Delete(ctx, id, userID)
}
