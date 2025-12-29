# Waffle Talkie Backend

Go backend server for Waffle Talkie voice messaging app.

## Tech Stack

- **Language**: Go
- **Database**: SQLite with sqlc for type-safe queries
- **Auth**: JWT tokens (30-day expiration) with bcrypt hashed device IDs

## Prerequisites

- [Go](https://golang.org/dl/) 1.21+
- [Task](https://taskfile.dev/installation/) - Task runner
- [sqlc](https://docs.sqlc.dev/en/latest/overview/install.html) - SQL code generator (optional, for schema changes)
- [goose](https://github.com/pressly/goose) - Database migration tool (optional, for migrations)

## Quick Start

1. **Run setup** (creates .env, directories, installs deps):
```bash
task setup
```

2. **Edit `.env`** with your settings:

Copy `.env.example` to `.env` and customize:
```bash
cp .env.example .env
```

Key environment variables:
- `ENV` - Environment (local, development, production)
- `PORT` - Server port (default: 8080)
- `DATABASE_PATH` - SQLite database file path
- `JWT_SECRET` - JWT secret (for local dev only)
- `JWT_SECRET_FILE` - Path to JWT secret file (for deployments)
- `AUDIO_DIRECTORY` - Directory for storing audio files

3. **Build and run**:
```bash
task app:run
```

## Development

```bash
task              # Show all available commands
task setup        # Initial project setup (first time only)
task app:build    # Build the server binary
task app:run      # Build and run the server
task app:dev      # Run with hot reload (using air)
task app:test     # Run tests
task db:generate  # Regenerate sqlc code from schema
task clean        # Remove build artifacts
task docker:build # Build Docker image
```

## Project Structure

```
backend/
├── cmd/server/          # Application entrypoint
├── internal/
│   ├── auth/           # Authentication handlers, JWT, bcrypt hashing
│   ├── audio/          # Audio message upload/download/receipts
│   ├── config/         # Environment configuration
│   ├── database/       # Database init, migrations, sqlc queries
│   ├── server/         # HTTP server setup and routing
│   └── users/          # User management handlers
├── scripts/            # Setup and utility scripts
├── bin/                # Compiled binaries (gitignored)
├── tmp/                # Local storage (gitignored)
└── secrets/            # Secret files (gitignored)
```

## API Endpoints

### Public
- `GET /` - Root endpoint
- `GET /health` - Health check

### Auth (No authentication required)
- `POST /auth/register` - Register new user (awaits approval)
- `POST /auth/login` - Login with device ID
- `GET /auth/pending` - List pending users (admin)
- `POST /auth/approve` - Approve pending user (admin)

### Protected (Requires Bearer token)
- `GET /api/me` - Get current user info
- `GET /api/users` - Get all users
- `GET /api/messages` - Get unreceived messages
- `POST /api/messages/upload` - Upload audio message
- `GET /api/messages/download?id=<message_id>` - Download audio file
- `POST /api/messages/received` - Mark message as received

## Security

- Device IDs are hashed with bcrypt before storage (never stored in plain text)
- JWT tokens contain only user ID (no device information)
- All message endpoints require Bearer token authentication
- Hashed device IDs never exposed via API responses or logs

## Database Schema

Generated from `internal/database/schema/001_init.sql` using sqlc.

**Tables**: `users`, `audio_messages`, `audio_message_receipts`
