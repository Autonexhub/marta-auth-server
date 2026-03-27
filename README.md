# Marta Auth Server

Better-auth authentication server for Marta Dashboard. Handles OAuth (Google) and magic link authentication, syncing user data with the PHP backend.

## 🏗️ Architecture

```
┌─────────────┐      OAuth/Magic Link       ┌──────────────┐
│   Frontend  │ ─────────────────────────►  │  Auth Server │
│   (React)   │ ◄─────────────────────────  │  (Vercel)    │
└─────────────┘      JWT Token              └──────┬───────┘
                                                    │
                                                    │ Sync User Data
                                                    │
                                            ┌───────▼────────┐
                                            │  PHP Backend   │
                                            │  (Hostinger)   │
                                            └────────────────┘
```

## 📦 Prerequisites

- Node.js 18+
- npm or yarn
- PHP backend running (http://localhost:8000)
- Google OAuth credentials

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

**Required environment variables:**
- `JWT_SECRET` - Must match your PHP backend JWT_SECRET
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `PHP_API_URL` - Your PHP backend URL
- `PHP_AUTH_SECRET` - Must match BETTER_AUTH_SECRET in PHP backend

### 3. Get Google OAuth Credentials

**📖 Detailed Guide:** See [`GOOGLE_OAUTH_SETUP.md`](./GOOGLE_OAUTH_SETUP.md) for step-by-step instructions with screenshots descriptions.

**⚡ Quick Checklist:** See [`QUICK_START.md`](./QUICK_START.md) for a simple checklist.

**Quick summary:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable "Google+ API"
4. Configure OAuth consent screen
5. Create OAuth 2.0 credentials
6. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env`

### 4. Run Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

### 5. Test OAuth Flow

1. Start your PHP backend: `cd backend && php -S localhost:8000 -t public`
2. Start this auth server: `npm run dev`
3. Visit: `http://localhost:3000/api/auth/signin/google`
4. Complete Google OAuth
5. You'll be redirected with a JWT token

## 🧪 Testing

### Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-03-20T...",
  "environment": "development",
  "phpBackend": "connected"
}
```

### Test PHP Connection

```bash
curl http://localhost:3000/api/auth/session
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/auth/signin/google` | GET | Initiate Google OAuth |
| `/api/auth/callback/google` | GET | OAuth callback (handled by better-auth) |
| `/api/auth/session` | GET | Get current session |
| `/api/auth/signout` | POST | Sign out |

## 🚢 Deployment to Vercel

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
vercel
```

### 4. Set Environment Variables

In Vercel dashboard, add all environment variables from `.env`:

- `NODE_ENV=production`
- `JWT_SECRET` (same as PHP backend)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `PHP_API_URL` (production PHP backend URL)
- `PHP_AUTH_SECRET` (same as PHP BETTER_AUTH_SECRET)

### 5. Update Google OAuth Redirect URI

Add your Vercel URL to Google OAuth:
- `https://your-app.vercel.app/api/auth/callback/google`

## 🔧 Configuration

### JWT Secret

**CRITICAL**: The `JWT_SECRET` must match your PHP backend's `JWT_SECRET`. This ensures tokens generated here can be validated by PHP.

### PHP Auth Secret

The `PHP_AUTH_SECRET` must match `BETTER_AUTH_SECRET` in your PHP backend. This secures communication between auth server and PHP API.

## 📝 Development Notes

### File Structure

```
marta-auth-server/
├── src/
│   ├── auth.ts          # Better-auth configuration
│   ├── php-client.ts    # PHP backend API client
│   ├── env.ts           # Environment validation
│   ├── types.ts         # TypeScript types
│   └── index.ts         # Local dev server
├── api/
│   └── auth/
│       └── [...all].ts  # Vercel serverless function
├── package.json
├── tsconfig.json
├── vercel.json
└── .env
```

### How It Works

1. User clicks "Sign in with Google" in React app
2. Frontend redirects to `/api/auth/signin/google`
3. Better-auth handles OAuth flow with Google
4. On success, better-auth calls `signIn` callback
5. Callback syncs user with PHP backend via API
6. PHP creates/updates user and assigns organization
7. Better-auth generates JWT token (compatible with PHP)
8. Frontend receives token and stores it
9. All subsequent API calls to PHP use this JWT

### User Sync Flow

```typescript
// When user signs in with Google:
1. better-auth receives OAuth data from Google
2. Calls PHP: GET /api/v1/auth/ba-user?email=user@example.com
3. If user exists: Update provider info
4. If new user: POST /api/v1/auth/ba-user (creates user)
5. PHP assigns default organization and role
6. better-auth generates JWT with PHP user data
7. Returns token to frontend
```

## 🐛 Troubleshooting

### "Invalid environment variables" error

Check that all required env vars are set:
```bash
JWT_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
PHP_API_URL
PHP_AUTH_SECRET
```

### "Failed to sync user with PHP backend"

1. Check PHP backend is running: `curl http://localhost:8000/api/v1/auth/me`
2. Verify `PHP_AUTH_SECRET` matches `BETTER_AUTH_SECRET` in PHP
3. Check PHP logs: `tail -f backend/logs/app.log`

### OAuth redirect mismatch

Ensure redirect URI in Google Console matches exactly:
- Development: `http://localhost:3000/api/auth/callback/google`
- Production: `https://your-vercel-app.vercel.app/api/auth/callback/google`

### CORS errors

Add your frontend URL to PHP backend CORS configuration in `.env`:
```bash
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 📚 Resources

- [Better-Auth Documentation](https://www.better-auth.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)

## 🔐 Security Notes

- Never commit `.env` file
- Rotate secrets regularly
- Use HTTPS in production
- Keep dependencies updated
- Monitor auth logs for suspicious activity

## 📄 License

Proprietary - Autonex
