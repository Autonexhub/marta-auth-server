# Google OAuth Setup - Complete Guide

This guide will walk you through setting up Google OAuth for the Marta Dashboard authentication.

---

## Prerequisites

- A Google account (personal or workspace)
- Access to Google Cloud Console
- 10-15 minutes

---

## Step-by-Step Instructions

### Step 1: Access Google Cloud Console

1. Open your browser and go to: **https://console.cloud.google.com**

2. Sign in with your Google account

3. You should see the Google Cloud Console dashboard

---

### Step 2: Create a New Project

**2.1.** Click on the **project dropdown** at the top of the page
   - It's next to "Google Cloud" logo
   - Shows your current project name or "Select a project"

**2.2.** In the dialog that appears, click **"NEW PROJECT"** (top right)

**2.3.** Fill in the project details:
   - **Project name:** `Marta Dashboard` (or any name you prefer)
   - **Organization:** Leave as "No organization" (unless you have a workspace)
   - **Location:** Leave as default

**2.4.** Click **"CREATE"**

**2.5.** Wait for the project to be created (usually takes 10-30 seconds)

**2.6.** Once created, make sure you're switched to this new project
   - Check the project dropdown shows "Marta Dashboard"

---

### Step 3: Enable Google+ API

**Why?** Google OAuth requires the Google+ API to be enabled.

**3.1.** From the navigation menu (☰ hamburger icon), go to:
   - **"APIs & Services"** → **"Library"**

**3.2.** In the search bar, type: `Google+ API`

**3.3.** Click on **"Google+ API"** from the results

**3.4.** Click the blue **"ENABLE"** button

**3.5.** Wait for it to enable (5-10 seconds)

**3.6.** You should see "API enabled" message

---

### Step 4: Configure OAuth Consent Screen

**Why?** Google requires you to configure what users see when they sign in.

**4.1.** From the navigation menu (☰), go to:
   - **"APIs & Services"** → **"OAuth consent screen"**

**4.2.** Select **User Type:**
   - If you have a Google Workspace: Select **"Internal"**
   - If you're using a personal account: Select **"External"**
   - Click **"CREATE"**

**4.3.** Fill in the **OAuth consent screen** form:

   **App information:**
   - **App name:** `Marta Dashboard`
   - **User support email:** Your email address (select from dropdown)
   - **App logo:** (Optional - skip for now)

   **App domain:**
   - **Application home page:** `https://yourdomain.com` (or leave blank for now)
   - **Application privacy policy link:** (Optional - leave blank)
   - **Application terms of service link:** (Optional - leave blank)

   **Authorized domains:**
   - For development: Leave blank
   - For production: Add your domain (e.g., `autonexhub.es`)

   **Developer contact information:**
   - **Email addresses:** Your email address

**4.4.** Click **"SAVE AND CONTINUE"**

**4.5.** On the **"Scopes"** page:
   - Click **"ADD OR REMOVE SCOPES"**
   - Select these scopes:
     - ✅ `.../auth/userinfo.email`
     - ✅ `.../auth/userinfo.profile`
     - ✅ `openid`
   - Click **"UPDATE"**
   - Click **"SAVE AND CONTINUE"**

**4.6.** On the **"Test users"** page:
   - If you selected "External", add test users:
     - Click **"+ ADD USERS"**
     - Enter your email addresses (one per line)
     - Click **"ADD"**
   - Click **"SAVE AND CONTINUE"**

**4.7.** Review the summary and click **"BACK TO DASHBOARD"**

---

### Step 5: Create OAuth 2.0 Credentials

**5.1.** From the navigation menu (☰), go to:
   - **"APIs & Services"** → **"Credentials"**

**5.2.** Click **"+ CREATE CREDENTIALS"** (top of page)

**5.3.** Select **"OAuth client ID"** from the dropdown

**5.4.** If prompted to configure consent screen, you've already done it - click **"OK"**

**5.5.** Configure the OAuth client:

   **Application type:**
   - Select **"Web application"**

   **Name:**
   - Enter: `Marta Dashboard Web Client`

   **Authorized JavaScript origins:**
   - Click **"+ ADD URI"**
   - For development: `http://localhost:3000`
   - For production: `https://your-vercel-url.vercel.app`
   - You can add multiple URIs (one per environment)

   **Authorized redirect URIs:**
   - Click **"+ ADD URI"**
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://your-vercel-url.vercel.app/api/auth/callback/google`
   - ⚠️ **IMPORTANT:** The path must be exactly `/api/auth/callback/google`

**5.6.** Click **"CREATE"**

---

### Step 6: Copy Your Credentials

**6.1.** A dialog will appear showing your credentials:
   - **Your Client ID**
   - **Your Client Secret**

**6.2.** Click the **"DOWNLOAD JSON"** button (optional, for backup)

**6.3.** **Copy the Client ID:**
   - It looks like: `1234567890-abc123def456.apps.googleusercontent.com`
   - Click the copy icon 📋

**6.4.** **Copy the Client Secret:**
   - It looks like: `GOCSPX-abc123def456ghi789`
   - Click the copy icon 📋

**6.5.** Click **"OK"** to close the dialog

---

### Step 7: Update Your .env File

**7.1.** Open your auth server `.env` file:
   ```bash
   cd /Users/marcosriganti/Projects/marta-auth-server
   nano .env  # or use VS Code, etc.
   ```

**7.2.** Find these lines:
   ```bash
   GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
   ```

**7.3.** Replace with your actual values:
   ```bash
   GOOGLE_CLIENT_ID=1234567890-abc123def456.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789
   ```

**7.4.** Save the file (Ctrl+O, Enter, Ctrl+X for nano)

---

### Step 8: Verify Setup

**8.1.** Check your `.env` file has all required values:
   ```bash
   cd /Users/marcosriganti/Projects/marta-auth-server
   cat .env
   ```

**8.2.** You should see:
   ```bash
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   VERCEL_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=1234567890-abc123...  ← Real value
   GOOGLE_CLIENT_SECRET=GOCSPX-abc123...  ← Real value
   PHP_API_URL=http://localhost:8000/api/v1
   PHP_AUTH_SECRET=ded9844c2ec315d50b6699b8dd06b0b294003a59f8268cdbd8257e086d2a542d
   ```

---

### Step 9: Test the OAuth Flow

**9.1.** Start your PHP backend:
   ```bash
   cd /Users/marcosriganti/Projects/marta-backend/backend
   php -S localhost:8000 -t public
   ```

**9.2.** In a new terminal, start the auth server:
   ```bash
   cd /Users/marcosriganti/Projects/marta-auth-server
   npm run dev
   ```

**9.3.** You should see:
   ```
   🚀 Marta Auth Server
   📍 URL: http://localhost:3000
   🔧 Environment: development
   🔗 PHP Backend: http://localhost:8000/api/v1

   Google OAuth:
     - Sign in: http://localhost:3000/api/auth/signin/google
   ```

**9.4.** Open your browser and go to:
   ```
   http://localhost:3000/api/auth/signin/google
   ```

**9.5.** You should be redirected to Google's sign-in page

**9.6.** Sign in with your Google account

**9.7.** Grant permissions when asked

**9.8.** If everything works, you'll be redirected back and see a JWT token

---

## Common Issues & Solutions

### Issue 1: "Access blocked: This app is not verified"

**Solution:**
- This is normal for apps in development
- Click **"Advanced"** → **"Go to Marta Dashboard (unsafe)"**
- This only appears for external apps with test users

### Issue 2: "Redirect URI mismatch"

**Error:** `redirect_uri_mismatch`

**Cause:** The redirect URI in your app doesn't match Google Console

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Click your OAuth client ID
3. Under "Authorized redirect URIs", verify you have exactly:
   - `http://localhost:3000/api/auth/callback/google`
4. Make sure there are no trailing slashes
5. Save and try again

### Issue 3: "Invalid Client ID"

**Cause:** Wrong Client ID in `.env`

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Copy the Client ID again
3. Update `.env` file
4. Restart auth server (`Ctrl+C`, then `npm run dev`)

### Issue 4: "Error 400: invalid_request"

**Cause:** OAuth consent screen not configured

**Solution:**
- Go back to Step 4 and complete the consent screen configuration
- Make sure you saved each step

### Issue 5: Can't find Google+ API

**Solution:**
- The API might be deprecated in your region
- Try enabling "Google Identity" API instead
- Or search for "People API"

---

## Security Best Practices

### ✅ Do's

- ✅ Use different OAuth clients for development and production
- ✅ Add only necessary redirect URIs
- ✅ Keep Client Secret secure (never commit to git)
- ✅ Rotate secrets periodically
- ✅ Review OAuth scopes - only request what you need

### ❌ Don'ts

- ❌ Don't commit `.env` file to git
- ❌ Don't share Client Secret publicly
- ❌ Don't use production credentials in development
- ❌ Don't add wildcard redirect URIs

---

## Production Setup

When ready for production:

### 1. Create Production OAuth Client

- Go to Google Cloud Console → Credentials
- Create a NEW OAuth client ID
- Name it: `Marta Dashboard Production`
- Add production redirect URI:
  - `https://your-vercel-app.vercel.app/api/auth/callback/google`

### 2. Publish OAuth Consent Screen

- Go to OAuth consent screen
- Click "PUBLISH APP"
- Submit for verification (if needed)

### 3. Update Vercel Environment Variables

- In Vercel dashboard, add:
  - `GOOGLE_CLIENT_ID` (production value)
  - `GOOGLE_CLIENT_SECRET` (production value)

---

## Quick Reference

### Where to Find Things

| Item | Location in Google Cloud Console |
|------|----------------------------------|
| **Client ID & Secret** | APIs & Services → Credentials → Click your client |
| **Redirect URIs** | APIs & Services → Credentials → Click your client → Edit |
| **Consent Screen** | APIs & Services → OAuth consent screen |
| **Enabled APIs** | APIs & Services → Library |
| **API Dashboard** | APIs & Services → Dashboard |

### Useful URLs

- **Google Cloud Console:** https://console.cloud.google.com
- **OAuth Playground:** https://developers.google.com/oauthplayground
- **OAuth Documentation:** https://developers.google.com/identity/protocols/oauth2

---

## Need Help?

If you're still having issues:

1. Check the auth server logs for error messages
2. Check browser console for errors (F12)
3. Verify all environment variables are correct
4. Make sure both servers (PHP + Auth) are running
5. Try with a different Google account

---

## ✅ Setup Complete Checklist

- [ ] Google Cloud project created
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 Client ID created
- [ ] Redirect URIs added
- [ ] Client ID copied to `.env`
- [ ] Client Secret copied to `.env`
- [ ] Auth server starts without errors
- [ ] Can visit `/api/auth/signin/google` successfully
- [ ] Google login page appears
- [ ] Successfully redirected after sign-in

---

**Once all items are checked, you're ready for Phase 3: Frontend Integration! 🎉**
