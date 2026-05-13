.PHONY: help run build test sqlc migrate-up migrate-down migrate-status fmt lint tidy embed-backfill

DB ?= postgres://dropdat:dropdat@localhost:5432/dropdat?sslmode=disable
MIGRATIONS := internal/db/migrations

help:
	@echo "make run            - run dev server (loads .env)"
	@echo "make build          - build binary into bin/dropdat"
	@echo "make test           - run go tests"
	@echo "make sqlc           - regenerate sqlc query code"
	@echo "make migrate-up     - apply migrations (uses DB env)"
	@echo "make migrate-down   - rollback one migration"
	@echo "make migrate-status - show migration status"
	@echo "make tidy           - go mod tidy"

run:
	@set -a; [ -f .env ] && . ./.env; set +a; \
	  go run ./cmd/dropdat

build:
	@mkdir -p bin
	go build -o bin/dropdat ./cmd/dropdat

test:
	go test ./... -race -count=1

sqlc:
	sqlc generate

migrate-up:
	goose -dir $(MIGRATIONS) postgres "$(DB)" up

migrate-down:
	goose -dir $(MIGRATIONS) postgres "$(DB)" down

migrate-status:
	goose -dir $(MIGRATIONS) postgres "$(DB)" status

fmt:
	gofmt -s -w .

tidy:
	go mod tidy

embed-backfill:
	@set -a; [ -f .env ] && . ./.env; set +a; \
	  DATABASE_URL=$(DB) go run ./cmd/embed-backfill
