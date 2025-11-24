package pantry

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
)

type PantryRepository struct {
	db *sql.DB
}

func NewPantryRepository(db *sql.DB) *PantryRepository {
	return &PantryRepository{db: db}
}

func (r *PantryRepository) Create(ctx context.Context, item *PantryItem) (*PantryItem, error) {
	query := `
		INSERT INTO pantry_items (user_id, name, quantity, unit)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`
	err := r.db.QueryRowContext(ctx, query, item.UserID, item.Name, item.Quantity, item.Unit).Scan(&item.ID, &item.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create pantry item: %w", err)
	}
	return item, nil
}

func (r *PantryRepository) List(ctx context.Context, userID uuid.UUID) ([]*PantryItem, error) {
	query := `SELECT id, user_id, name, quantity, unit, created_at FROM pantry_items WHERE user_id = $1 ORDER BY name ASC`
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("list pantry items: %w", err)
	}
	defer rows.Close()

	var items []*PantryItem = []*PantryItem{}
	for rows.Next() {
		var item PantryItem
		var unit sql.NullString
		if err := rows.Scan(&item.ID, &item.UserID, &item.Name, &item.Quantity, &unit, &item.CreatedAt); err != nil {
			return nil, err
		}
		item.Unit = unit.String
		items = append(items, &item)
	}
	return items, nil
}

func (r *PantryRepository) Delete(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	query := `DELETE FROM pantry_items WHERE id = $1 AND user_id = $2`
	result, err := r.db.ExecContext(ctx, query, id, userID)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return fmt.Errorf("pantry item not found")
	}
	return nil
}
