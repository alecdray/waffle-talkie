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
```env
ENV=local
PORT=8080
DATABASE_PATH=./tmp/waffle-talkie.db
JWT_SECRET=your-secret-key-here
AUDIO_DIRECTORY=./tmp/audio
```

3. **Build and run**:
```bash
make run
```

## Development

```bash
make setup        # Initial project setup (first time only)
make dev          # Run with hot reload (using air)
make test         # Run tests
make sqlc         # Regenerate sqlc code after schema changes
make clean        # Remove build artifacts
make help         # Show all available commands
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
│   └── server/         # HTTP server setup and routing
├── scripts/            # Setup and utility scripts
└── tmp/                # Local storage (gitignored)
```

## API Endpoints

### Auth
- `POST /auth/register` - Register new user (awaits approval)
- `POST /auth/login` - Login with device ID
- `POST /auth/approve` - Approve pending user (admin)
- `GET /auth/pending` - List pending users (admin)

### Messages
- `POST /api/messages/upload` - Upload audio message
- `GET /api/messages` - Get unreceived messages
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
