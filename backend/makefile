.PHONY: help setup build run dev test clean sqlc

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

setup: ## Initial project setup (create .env, directories, install deps)
	@./scripts/setup.sh

build: ## Build the server binary
	go build -v -o ./bin/server ./cmd/server

run: build ## Build and run the server
	./bin/server

dev: ## Run with hot reload (using air)
	go run github.com/air-verse/air@v1.63.0 \
	--build.cmd "go build -v -o ./bin/server ./cmd/server" --build.bin "./bin/server" --build.delay "100" \
	--build.exclude_dir "node_modules" \
	--build.include_ext "go" \
	--build.stop_on_error "false" \
	--misc.clean_on_exit true

test: ## Run tests
	go test -v ./...

sqlc: ## Regenerate sqlc code from schema
	sqlc generate

clean: ## Remove build artifacts and temporary files
	rm -rf ./bin
	rm -rf ./tmp
