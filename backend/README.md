# Waffle Talkie Backend

Go backend server for Waffle Talkie voice messaging app.

## Tech Stack

- **Language**: Go
- **Database**: SQLite with sqlc for type-safe queries
- **Auth**: JWT tokens (30-day expiration) with bcrypt hashed device IDs

## Quick Start

1. **Run setup** (creates .env, directories, installs deps):
```bash
make setup
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
make run
```

## Development

```bash
make help         # Show all available commands
make setup        # Initial project setup (first time only)
make build        # Build the server binary
make run          # Build and run the server
make dev          # Run with hot reload (using air)
make test         # Run tests
make sqlc         # Regenerate sqlc code after schema changes
make clean        # Remove build artifacts
make docker-build # Build Docker image
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
