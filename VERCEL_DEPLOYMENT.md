# Vercel Deployment Guide

## 🚀 Deploy to Vercel (Recommended for Next.js)

### Prerequisites
- Firebase project set up with Firestore enabled
- `.env.local` configured with Firebase credentials
- GitHub repository (optional but recommended)

### Step 1: Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)
```bash
# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow the prompts:
# - Link to existing project or create new? → Create new
# - Project name → ccrs-system (or your choice)
# - Directory → ./ (current directory)
```

#### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository (or upload manually)
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` (leave default)
   - **Output Directory**: `.next` (leave default)

### Step 3: Configure Environment Variables

In Vercel Dashboard:
1. Go to your project → **Settings** → **Environment Variables**
2. Add all Firebase environment variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Important:** Set environment to **"Production"** and **"Preview"** for both.

### Step 4: Deploy

#### Using CLI:
```bash
# Deploy to production
vercel --prod
```

#### Using Dashboard:
- Click **"Deploy"** in Vercel dashboard
- Wait for build to complete (usually 2-3 minutes)

### Step 5: Verify Deployment

1. Visit your deployed URL (provided by Vercel)
2. Test the application:
   - Login page should work
   - Try creating a venue in "Manage Venues"
   - Check Firebase Console to verify data is saved

## 🔧 Troubleshooting

### Build Fails
- Check Vercel build logs for errors
- Ensure all dependencies are in `package.json`
- Verify Firebase config is correct

### Firebase Connection Issues
- Double-check environment variables in Vercel
- Make sure Firestore security rules allow access
- Check browser console for Firebase errors

### API Routes Not Working
- Vercel functions have a 10-second timeout (configured in `vercel.json`)
- Check Vercel function logs for API errors

## 📋 Alternative Deployment Options

### Netlify
1. Go to [netlify.com](https://netlify.com)
2. Drag & drop the project folder
3. Set build command: `npm run build`
4. Set publish directory: `.next`
5. Add environment variables in Netlify dashboard

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize: `firebase init hosting`
3. Deploy: `firebase deploy`

## 🌐 Custom Domain (Optional)

After deployment:
1. In Vercel dashboard → **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed

## 📊 Monitoring

- **Vercel Analytics**: Built-in analytics in dashboard
- **Firebase Console**: Monitor Firestore usage and errors
- **Browser DevTools**: Check for client-side errors

## 🔒 Security Notes

- Never commit `.env.local` to Git
- Use Firebase security rules in production
- Regularly update dependencies
- Monitor Firebase usage for costs

---

**Estimated deployment time: 10-15 minutes**

Once deployed, you'll have a live URL to submit with your project! 🎉