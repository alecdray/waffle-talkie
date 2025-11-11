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

# Run on iOS
npm run start:ios

# Run on Android
npm run run:android
```

## Environment Variables

- `EXPO_PUBLIC_API_URL`: Backend API base URL (required)

The app will automatically use the appropriate default URL based on the platform if no environment variable is set.
