# Quick Start Checklist ✅

Follow these steps in order to get Google OAuth working.

---

## ☑️ Part 1: Google Cloud Console (15 minutes)

### 1️⃣ Create Project
```
1. Go to: https://console.cloud.google.com
2. Click project dropdown (top bar)
3. Click "NEW PROJECT"
4. Name: "Marta Dashboard"
5. Click "CREATE"
6. Wait 30 seconds
```
**✅ Done when:** Project dropdown shows "Marta Dashboard"

---

### 2️⃣ Enable Google+ API
```
1. Menu (☰) → APIs & Services → Library
2. Search: "Google+ API"
3. Click "Google+ API"
4. Click "ENABLE"
5. Wait 10 seconds
```
**✅ Done when:** You see "API enabled"

---

### 3️⃣ Configure Consent Screen
```
1. Menu (☰) → APIs & Services → OAuth consent screen
2. Select: "External" (or "Internal" if Workspace)
3. Click "CREATE"

Fill in:
- App name: Marta Dashboard
- User support email: (your email)
- Developer email: (your email)

4. Click "SAVE AND CONTINUE" (4 times)
```
**✅ Done when:** Back at OAuth consent screen dashboard

---

### 4️⃣ Create OAuth Credentials
```
1. Menu (☰) → APIs & Services → Credentials
2. Click "+ CREATE CREDENTIALS"
3. Select "OAuth client ID"
4. Application type: "Web application"
5. Name: "Marta Dashboard Web Client"

Add redirect URIs:
- http://localhost:3000/api/auth/callback/google

6. Click "CREATE"
```
**✅ Done when:** Dialog shows Client ID and Secret

---

### 5️⃣ Copy Credentials
```
Copy these and save somewhere safe:

Client ID:
1234567890-abc123def456.apps.googleusercontent.com

Client Secret:
GOCSPX-abc123def456ghi789
```
**✅ Done when:** You have both values copied

---

## ☑️ Part 2: Configure Auth Server (2 minutes)

### 6️⃣ Update .env File
```bash
cd /Users/marcosriganti/Projects/marta-auth-server
nano .env
```

Replace these lines:
```bash
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

With your actual values:
```bash
GOOGLE_CLIENT_ID=1234567890-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789
```

Save file (Ctrl+O, Enter, Ctrl+X)

**✅ Done when:** `cat .env` shows real Google credentials

---

## ☑️ Part 3: Test OAuth Flow (5 minutes)

### 7️⃣ Start PHP Backend
```bash
cd /Users/marcosriganti/Projects/marta-backend/backend
php -S localhost:8000 -t public
```
**✅ Done when:** Terminal shows "Listening on http://localhost:8000"

---

### 8️⃣ Start Auth Server
```bash
# New terminal window
cd /Users/marcosriganti/Projects/marta-auth-server
npm run dev
```
**✅ Done when:** You see:
```
🚀 Marta Auth Server
📍 URL: http://localhost:3000
🔧 Environment: development
🔗 PHP Backend: http://localhost:8000/api/v1
```

---

### 9️⃣ Test OAuth
```
1. Open browser
2. Go to: http://localhost:3000/api/auth/signin/google
3. You should see Google sign-in page
4. Sign in with your Google account
5. Grant permissions
6. You should be redirected back
```
**✅ Done when:** Successfully signed in with Google

---

## 🎉 Success!

If all steps are checked ✅, your OAuth is working!

**Next:** Move to Phase 3 - Frontend Integration

---

## 🚨 Quick Troubleshooting

### Problem: "Redirect URI mismatch"
**Fix:** In Google Console, verify redirect URI is exactly:
```
http://localhost:3000/api/auth/callback/google
```
No trailing slash!

### Problem: "Invalid client"
**Fix:** Double-check Client ID in `.env` matches Google Console

### Problem: Can't enable Google+ API
**Fix:** Try enabling "People API" instead

### Problem: Auth server won't start
**Fix:**
```bash
# Check environment variables
cd /Users/marcosriganti/Projects/marta-auth-server
cat .env

# Restart
npm run dev
```

---

## 📞 Still Stuck?

Check the detailed guide: `GOOGLE_OAUTH_SETUP.md`

Or check logs:
```bash
# Auth server logs (in terminal where it's running)
# PHP backend logs
tail -f /Users/marcosriganti/Projects/marta-backend/backend/logs/app.log
```
