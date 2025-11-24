package pantry

import (
	"time"

	"github.com/google/uuid"
)

type PantryItem struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	Name      string    `json:"name"`
	Quantity  string    `json:"quantity"`
	Unit      string    `json:"unit"`
	CreatedAt time.Time `json:"created_at"`
}

type CreatePantryItemRequest struct {
	Name     string `json:"name"`
	Quantity string `json:"quantity"`
	Unit     string `json:"unit"`
}
