# Vercel Environment Variables Setup

The error **"Unable to connect to the server"** happens because the app can't access Firebase without environment variables set on Vercel.

## Steps to Fix

1. **Go to your Vercel project dashboard**
   - Visit https://vercel.com/dashboard
   - Select your deployed project

2. **Navigate to Settings > Environment Variables**
   - Click the "Settings" tab
   - Go to "Environment Variables" section

3. **Add your Firebase configuration**
   Copy and paste these from your local `.env.local` file:
   
   - `NEXT_PUBLIC_FIREBASE_API_KEY` = `AIzaSyAaFrHgttS1bIVI8ZEFMK7961KOKjN_c74`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = `ccrs-system-a49a0.firebaseapp.com`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = `ccrs-system-a49a0`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = `ccrs-system-a49a0.appspot.com`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = `823494925136`
   - `NEXT_PUBLIC_FIREBASE_APP_ID` = `1:823494925136:web:4be9a5d6662aa6fe432a55`

4. **Save and redeploy**
   - Click "Save"
   - Go to the "Deployments" tab
   - Click "Redeploy" on the latest deployment

5. **Test the login**
   - Use demo credentials:
     - admin@elupun.com / admin123
     - mediator@elupun.com / mediator123
     - staff@elupun.com / staff123

## Local Development

For local development, keep your `.env.local` file. It's already git-ignored and won't be committed to the repository.

## Default Users

The app automatically creates these test accounts on first login:
- **Admin**: admin@elupun.com / admin123
- **Mediator**: mediator@elupun.com / mediator123  
- **Staff**: staff@elupun.com / staff123

These accounts are stored in your Firebase Firestore database.
