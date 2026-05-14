# Final Setup: Environment Variables & Firebase Security Rules

## ✅ Status
- ✅ All 3 APIs migrated to Firebase (venues, conflicts, users)
- ✅ Build successful
- ✅ Deployment initiated: https://ccrs-new-project-8b8fhyomm-xjaybees-projects.vercel.app

---

## 🔧 Step 1: Add Firebase Environment Variables to Vercel

1. Go to **Vercel Dashboard** → Your **ccrs-new-project**
2. Click **Settings** → **Environment Variables**
3. Add these variables (get values from Firebase Console):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | From Firebase Console |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `ccrs-system-a49a0.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `ccrs-system-a49a0` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `ccrs-system-a49a0.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `823494925136` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | From Firebase Console |

**Important:** Set these for both **Production** and **Preview** environments.

4. After adding, click **Deployments** and redeploy the latest deployment

---

## 🔐 Step 2: Update Firestore Security Rules

**Current Status:** Firestore is in **test mode** (allows all access)

1. Go to **Firebase Console** → **Firestore Database** → **Rules**
2. Replace all rules with contents from `FIRESTORE_RULES.txt` in project root
3. Click **Publish**

The new rules:
- ✅ Allow anyone to read venues
- ✅ Allow authenticated users to create/manage data
- ✅ Allow admins to approve/delete conflict reports
- ✅ Deny all other access

---

## 🧪 Step 3: Test Live Application

Wait 2-3 minutes for deployment to complete, then:

1. Visit: **https://ccrs-new-project.vercel.app**
2. Login with demo credentials:
   - Email: `admin@example.com`
   - Password: `admin123`

3. Test these workflows:
   - ✅ **Manage Venues**: Create/Edit/Delete venues → Check Firestore Console
   - ✅ **Report Conflict**: Submit a conflict report → Check Firestore Console
   - ✅ **Manage Users**: Create new user (admin only) → Check Firestore Console

4. Watch for any errors in browser console (F12)

---

## 📊 Verification Checklist

- [ ] Vercel environment variables are set
- [ ] Deployment shows "Ready"
- [ ] Live URL opens without errors
- [ ] Firestore security rules published
- [ ] Can login with admin credentials
- [ ] Can create a venue (appears in Firestore)
- [ ] Can report a conflict (appears in Firestore)
- [ ] Can create a user (admin only)
- [ ] No 403/permission errors in console

---

## 🚀 Final Status

**When all checks pass:**
- Your app is fully cloud-backed
- Ready for project submission
- Live demo URL: `https://ccrs-new-project.vercel.app`

---

## 📝 What was migrated

✅ `pages/api/venues.js` → Firebase Firestore
✅ `pages/api/conflicts.js` → Firebase Firestore  
✅ `pages/api/users.js` → Firebase Firestore
✅ All local JSON files no longer used

---

## 💡 Troubleshooting

**App not loading?**
- Check browser console (F12) for Firebase connection errors
- Verify environment variables in Vercel are correct

**Permission Denied errors?**
- Ensure Firestore security rules are published
- Check that rules match `FIRESTORE_RULES.txt`

**Data not saving?**
- Verify Firestore database exists and is enabled
- Check Firebase console for errors

---

**All 4 tasks complete! Ready for final verification.** 🎉
