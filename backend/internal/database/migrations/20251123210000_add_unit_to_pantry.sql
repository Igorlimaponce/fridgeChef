-- +goose Up
ALTER TABLE pantry_items ADD COLUMN IF NOT EXISTS unit VARCHAR(50) DEFAULT '';

-- +goose Down
ALTER TABLE pantry_items DROP COLUMN IF EXISTS unit;
