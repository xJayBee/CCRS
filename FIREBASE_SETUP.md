# Firebase Setup Guide

This project now uses Firebase Firestore as its cloud backend. Follow these steps to set up Firebase:

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter a project name (e.g., "ccrs-system")
4. Accept terms and click **"Continue"**
5. Disable Google Analytics (optional) and click **"Create project"**
6. Wait for the project to be created, then click **"Continue"**

## Step 2: Get Firebase Configuration

1. In the Firebase Console, click the **Settings icon** (⚙️) → **Project Settings**
2. Scroll down to **"Your apps"** section
3. Click **"Web"** to create a web app
4. Enter an app name (e.g., "CCRS App")
5. Click **"Register app"**
6. Copy the Firebase config object that appears (it will look like below)

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefg"
};
```

## Step 3: Add Configuration to .env.local

1. Open `.env.local` file in the project root
2. Replace the empty values with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdefg
```

## Step 4: Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select a region close to your location
5. Click **"Enable"**

## Step 5: Create Collections

Firestore will automatically create collections when you add documents. The following collections will be created:
- `venues` - For venue/hall management
- `conflicts` - For conflict reports
- `users` - For user accounts

## Step 6: Test the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000

3. Test the Venues page:
   - Go to "Manage Venues"
   - Try creating a new venue
   - Check Firebase Console to see the data in Firestore

## Troubleshooting

### "Cannot read properties of undefined (reading 'projectId')"
- Make sure `.env.local` has all Firebase config values
- Restart the development server after adding environment variables

### Firestore Permission Denied
- Go to Firebase Console → Firestore → Rules
- Make sure you're in "Test mode" for development
- For production, set up proper security rules

### Data not appearing in Firestore
- Check browser console for errors (F12)
- Verify API keys are correct in `.env.local`
- Make sure Firestore database is enabled

## Production Notes

Before deploying to production:
1. Set up proper Firestore security rules (don't use test mode)
2. Use environment variables for API keys
3. Test thoroughly before going live

For more info: [Firebase Documentation](https://firebase.google.com/docs)
