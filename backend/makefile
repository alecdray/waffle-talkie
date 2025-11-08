run: build
	go run ./cmd/server/main.go

build:
	go build -v -o ./bin/app ./cmd/server

# run air to detect any go file changes to re-build and re-run the server.
dev:
	go run github.com/air-verse/air@v1.63.0 \
	--build.cmd "go build -v -o ./bin/app ./cmd/server" --build.bin "./bin/app" --build.delay "100" \
	--build.exclude_dir "node_modules" \
	--build.include_ext "go" \
	--build.stop_on_error "false" \
	--misc.clean_on_exit true
