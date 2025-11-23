# Simple Makefile for a Go project

include .env
export
# Build the application
all: build test

build:
	@echo "Building..."
	
	
	@go build -o main.exe backend/cmd/api/main.go

# Run the application
run:
	@go run backend/cmd/api/main.go
# Create DB container
docker-run:
	@docker compose up --build

# Shutdown DB container
docker-down:
	@docker compose down

# Migrate the database
migrate-up:
	@echo "Running migrations..."
	@echo "Connection string: postgres://$(fridgeChef_DB_USERNAME):***@$(fridgeChef_DB_HOST):$(fridgeChef_DB_PORT)/$(fridgeChef_DB_DATABASE)?sslmode=disable"
	@goose -dir "backend/internal/database/migrations" postgres "postgres://$(fridgeChef_DB_USERNAME):$(fridgeChef_DB_PASSWORD)@$(fridgeChef_DB_HOST):$(fridgeChef_DB_PORT)/$(fridgeChef_DB_DATABASE)?sslmode=disable" up

# Rollback the database
migrate-down:
	@echo "Rolling back migrations..."
	@goose -dir "backend/internal/database/migrations" postgres "postgres://$(fridgeChef_DB_USERNAME):$(fridgeChef_DB_PASSWORD)@$(fridgeChef_DB_HOST):$(fridgeChef_DB_PORT)/$(fridgeChef_DB_DATABASE)?sslmode=disable" down

# Test the application
test:
	@echo "Testing..."
	@go test ./backend/... -v
# Integrations Tests for the application
itest:
	@echo "Running integration tests..."
	@go test ./backend/internal/database -v

# Clean the binary
clean:
	@echo "Cleaning..."
	@rm -f main

# Live Reload
watch:
	@powershell -ExecutionPolicy Bypass -Command "if (Get-Command air -ErrorAction SilentlyContinue) { \
	    air; \
	    Write-Output 'Watching...'; \
	} else { \
	    Write-Output 'Installing air...'; \
	    go install github.com/air-verse/air@latest; \
	    air; \
	    Write-Output 'Watching...'; \
	}"

# Seed initial secrets (run from repo root)
seed-secrets:
	@echo "Seeding initial secrets..."
	@cd backend && go run ./cmd/seed_secrets/main.go


.PHONY: all build run test clean watch docker-run docker-down itest migrate-up migrate-down seed-secrets