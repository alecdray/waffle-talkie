# Waffle Talkie Mobile

React Native mobile app for Waffle Talkie voice messaging.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure API URL:
Copy `.env.example` to `.env` and set your API URL:
```bash
cp .env.example .env
```

Edit `.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:8080
```

**Platform-specific URLs:**
- iOS Simulator: `http://localhost:8080`
- Android Emulator: `http://10.0.2.2:8080`
- Physical Device: `http://YOUR_LOCAL_IP:8080` (e.g., `http://192.168.1.100:8080`)
- Production: `https://your-api-domain.com`

## Running the App

```bash
# Start development server
npm start

# Run on iOS Simulator
npm run start:ios

# Run on iOS device
npm run run:ios

# Run on Android
npm run run:android

# Run on web
npm run start:web
```

## Environment Variables

Create a `.env` file from the example:
```bash
cp .env.example .env
```

**Available variables:**
- `EXPO_PUBLIC_API_URL`: Backend API base URL (required)

**Note:** `.env` files are for local development only. For production, set environment variables through your deployment platform.
