package pantry

import (
	"context"

	"github.com/google/uuid"
)

type PantryService struct {
	repo *PantryRepository
}

func NewPantryService(repo *PantryRepository) *PantryService {
	return &PantryService{repo: repo}
}

func (s *PantryService) Create(ctx context.Context, userID uuid.UUID, req CreatePantryItemRequest) (*PantryItem, error) {
	item := &PantryItem{
		UserID:   userID,
		Name:     req.Name,
		Quantity: req.Quantity,
	}
	return s.repo.Create(ctx, item)
}

func (s *PantryService) List(ctx context.Context, userID uuid.UUID) ([]*PantryItem, error) {
	return s.repo.List(ctx, userID)
}

func (s *PantryService) Delete(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	return s.repo.Delete(ctx, id, userID)
}
