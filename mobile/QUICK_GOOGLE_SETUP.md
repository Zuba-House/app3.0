# Quick Google OAuth Setup

## Step 1: Get Your Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure OAuth consent screen (choose External, fill in app name: "Zuba House")
6. Application type: **Web application**
7. Name: **Zuba House Mobile**
8. Authorized redirect URIs:
   - `exp://localhost:8081` (for Expo Go development)
   - `zuba://auth/callback` (for production)
9. Click **Create**
10. **Copy the Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)

## Step 2: Add Client ID to Your App

### Option A: Update app.json (Easiest)

1. Open `mobile/app.json`
2. Find this line:
   ```json
   "googleClientId": "YOUR_GOOGLE_CLIENT_ID_HERE"
   ```
3. Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Client ID:
   ```json
   "googleClientId": "123456789-abc.apps.googleusercontent.com"
   ```
4. Save the file
5. **Restart Expo** (stop and start again)

### Option B: Use Environment Variable

1. Create a file `.env` in the `mobile` folder
2. Add this line:
   ```
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
   ```
3. Replace with your actual Client ID
4. **Restart Expo**

## Step 3: Test

1. Restart your Expo development server
2. Go to Login screen
3. Click "Continue with Google"
4. It should open Google sign-in

## Troubleshooting

**Still getting "not configured" error?**
- Make sure you replaced `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual ID
- Restart Expo after making changes
- Check that there are no extra spaces or quotes

**Getting "redirect_uri_mismatch" error?**
- Make sure you added both redirect URIs in Google Console:
  - `exp://localhost:8081`
  - `zuba://auth/callback`

**Need help?**
- Check the full guide: `GOOGLE_AUTH_SETUP.md`
- Make sure your Client ID is for "Web application" type (not iOS/Android)
