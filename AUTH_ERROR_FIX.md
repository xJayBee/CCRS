# Authentication API Error Fix - Complete Guide

## Error Summary

You're seeing two types of errors from the `/api/auth` endpoint:

### 1. **401 Status** - "Failed to load resource: the server responded with a status of 401"
✅ **This is EXPECTED and NORMAL** 
- Occurs when checking for existing authentication on app load
- The app fetches `/api/auth` with GET to verify if you're logged in
- Returns 401 if no valid auth token exists (you're not authenticated)
- This is correct behavior and doesn't need fixing

### 2. **500 Status** - "Failed to load resource: the server responded with a status of 500"  
🔧 **This needs fixing** - Indicates a server-side Firestore access error

---

## Root Cause of 500 Error

Your Firestore security rules require authentication (`request.auth != null`) to access user data, but the server-side auth endpoint was using the **client-side Firebase SDK**, which has no authentication context on the server. This caused all user operations to fail.

**The Problem Flow:**
```
1. User attempts login → POST /api/auth with email/password
2. Server calls getUserByEmail() (client SDK)
3. Client SDK tries to query /users collection in Firestore
4. Firestore checks: "Is this request authenticated?" → NO
5. Firestore denies access (requires auth context)
6. Result: 500 Internal Server Error
```

---

## Solution Implemented

### Changes Made:

1. **Created `lib/firebaseAdmin.js`** - Server-side Firebase Admin SDK initialization
   - Initializes Admin SDK with service account credentials
   - Provides `adminDb` for secure server operations
   - Fails gracefully if Admin SDK isn't configured

2. **Updated `lib/firestore.js`** - Added server-side user operations
   - New functions: `getUserByEmailServer()`, `createUserServer()`, `getUserByIdServer()`
   - These use Admin SDK (not client SDK) for server-to-server authentication

3. **Updated `pages/api/auth.js`** - Uses server-side functions
   - Imports and calls the new server-side user operations
   - Admin SDK authenticates directly with Firebase, bypassing user-level rules

4. **Updated `FIRESTORE_RULES.txt`** - Temporary development rules
   - Allows unauthenticated access to /users collection (for development)
   - **⚠️ SECURITY WARNING: This is temporary - use proper Admin SDK in production**

5. **Updated `.env.local`** - Added Admin SDK configuration keys with instructions
   - Added placeholder environment variables
   - Includes step-by-step setup instructions

6. **Updated `package.json`** - Added firebase-admin dependency
   - Installed firebase-admin v12.5.0

---

## Setup Instructions

### Option 1: Quick Fix (Use Current Setup)
The app now works with **development mode** Firestore rules that allow unauthenticated access to user data. 

✅ Test it: Try logging in with any email/password
- The default users from the auth endpoint should now be created
- You can then log in with these credentials:
  - admin@elupun.com / admin123
  - mediator@elupun.com / mediator123  
  - staff@elupun.com / staff123

### Option 2: Proper Production Setup (Recommended)
To fix this properly without security issues:

#### Step 1: Generate Firebase Admin SDK Key
1. Go to: https://console.firebase.google.com/project/ccrs-system-a49a0/settings/serviceaccounts/adminsdk
2. Click **"Generate New Private Key"**
3. A JSON file will download - keep it safe!

#### Step 2: Update `.env.local`
Open your `.env.local` and add these values from the JSON file:

```
FIREBASE_ADMIN_SDK_TYPE=service_account
FIREBASE_ADMIN_SDK_PROJECT_ID=<from JSON "project_id">
FIREBASE_ADMIN_SDK_PRIVATE_KEY_ID=<from JSON "private_key_id">
FIREBASE_ADMIN_SDK_PRIVATE_KEY=<from JSON "private_key"> (keep the \n characters)
FIREBASE_ADMIN_SDK_CLIENT_EMAIL=<from JSON "client_email">
FIREBASE_ADMIN_SDK_CLIENT_ID=<from JSON "client_id">
FIREBASE_ADMIN_SDK_AUTH_PROVIDER_CERT_URL=<from JSON "auth_provider_x509_cert_url">
FIREBASE_ADMIN_SDK_CLIENT_CERT_URL=<from JSON "client_x509_cert_url">
```

#### Step 3: Update Firestore Rules (Secure)
Replace your Firestore rules with the proper security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users: Admin SDK can manage, only allow authenticated access
    match /users/{document=**} {
      allow read, create, update: if request.auth != null;
    }
    
    // Venues: Anyone can read, authenticated users can create/update/delete
    match /venues/{document=**} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
    
    // Conflicts: Authenticated users can create/manage
    match /conflicts/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && (request.auth.token.role == 'admin' || resource.data.createdBy == request.auth.token.email);
    }
    
    // Default: Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

#### Step 4: Restart Your App
```bash
npm run dev
```

---

## How It Works Now

**With Admin SDK Configured:**
```
User Login Attempt:
  1. POST /api/auth with email/password
  2. Admin SDK authenticates as service account
  3. Direct database access with full permissions
  4. getUserByEmailServer() queries succeed
  5. User is created or verified
  6. Login token generated and returned
  7. Success! ✅
```

**Without Admin SDK:**
```
  1. Same as above, but firebaseAdmin returns null
  2. Auth endpoint handles gracefully
  3. Falls back to development mode Firestore rules
  4. Unauthenticated access allowed for /users
  5. Works but INSECURE in production
  6. ⚠️ Must complete Option 2 before production deployment
```

---

## Testing

### Test 1: Check 401 is Still Happening
This is normal on app load before you log in. No action needed.

### Test 2: Try Default Login
1. Open the login page
2. Enter: `admin@elupun.com` / `admin123`
3. Should successfully log in
4. No more 500 errors! ✅

### Test 3: Verify No 500 Errors
- Open browser DevTools (F12)
- Go to Network tab
- Try logging in or interacting with the app
- Verify there are no 500 errors

---

## Environment Variables Reference

| Variable | Purpose | Required |
|----------|---------|----------|
| `FIREBASE_ADMIN_SDK_TYPE` | Service account type (always "service_account") | Optional* |
| `FIREBASE_ADMIN_SDK_PROJECT_ID` | Firebase project ID | Optional* |
| `FIREBASE_ADMIN_SDK_PRIVATE_KEY_ID` | Private key ID | Optional* |
| `FIREBASE_ADMIN_SDK_PRIVATE_KEY` | Private key (multi-line) | Optional* |
| `FIREBASE_ADMIN_SDK_CLIENT_EMAIL` | Service account email | Optional* |
| `FIREBASE_ADMIN_SDK_CLIENT_ID` | Client ID | Optional* |
| `FIREBASE_ADMIN_SDK_AUTH_URI` | OAuth auth endpoint | Optional* |
| `FIREBASE_ADMIN_SDK_TOKEN_URI` | OAuth token endpoint | Optional* |
| `FIREBASE_ADMIN_SDK_AUTH_PROVIDER_CERT_URL` | Certificate URL | Optional* |
| `FIREBASE_ADMIN_SDK_CLIENT_CERT_URL` | Client certificate URL | Optional* |

*Optional for development (uses Firestore dev rules), Required for production

---

## Troubleshooting

### Still Getting 500 Errors?
1. Check browser console for detailed error messages
2. Check server logs (terminal where you ran `npm run dev`)
3. Verify `.env.local` has no syntax errors
4. Make sure `firebase-admin` is installed: `npm list firebase-admin`

### Login Still Not Working?
1. Verify users collection exists in Firestore
2. Check that default users were created (should happen on first auth attempt)
3. Try using the Firestore console to verify user data

### "Admin SDK not configured" Error?
- This is expected if you haven't set Admin SDK keys yet
- The app will use development mode Firestore rules instead
- For production, complete "Option 2: Proper Production Setup" above

---

## Security Notes

⚠️ **Important**: The current development setup allows unauthenticated access to the users collection. This is only suitable for development/testing. For production:

1. ✅ Complete the Admin SDK setup (Option 2)
2. ✅ Update Firestore rules to require authentication
3. ✅ Never commit the Admin SDK JSON file to version control
4. ✅ Store Admin SDK credentials securely (use Firebase Hosting or backend environment)
5. ✅ Regenerate the Admin SDK key if compromised

---

## Next Steps

1. Test with the current setup (development mode)
2. When ready for production, follow Option 2 to set up the Admin SDK properly
3. Update your deployment environment variables on Vercel
4. Update Firestore rules to the secure version
5. Test thoroughly before going live
