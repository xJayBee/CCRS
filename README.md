# E-Lupon Community Conflict Resolution System

A simplified guide for the CCRS project, focused on setup, deployment, and usage.

---

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.local.example .env.local
```

3. Add Firebase config values to `.env.local`.

4. Run the app:

```bash
npm run dev
```

5. Open:

```text
http://localhost:3000
```

---

## Features

- Login/register flow with secure HttpOnly cookie sessions
- Role-based access control (admin, mediator, staff, client)
- Firebase Firestore persistence
- Responsive Next.js UI with sidebar navigation
- CRUD for venues, conflicts, users, and assignments
- Vercel deployment ready

---

## Tech Stack

- Next.js 14
- React 18
- Firebase Firestore
- CSS Modules
- Vercel
- Node.js 18+

---

## Firebase Setup

Add the Firebase values to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abcdef
```

---

## Deployment

Use Vercel:

```bash
npm install -g vercel
vercel
vercel --prod
```

Live URL:

- `https://ccrsystem.vercel.app`

---

## Notes

- `/register` is public for new users.
- Removed the sidebar quick actions for `New Report` and `Find Venue`.
- Demo credentials are for development only.

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@elupun.com | admin123 |
| Mediator | mediator@elupun.com | mediator123 |
| Staff | staff@elupun.com | staff123 |

> Remove demo credentials before production.

---

## Troubleshooting

- Confirm Firebase environment variables
- Restart the dev server after updating `.env.local`
- Review Vercel build logs for deployment issues

---

## Project Structure

```
components/        # UI components
pages/             # Next.js pages and API routes
styles/            # CSS and layout styling
lib/               # Firebase and auth helpers
public/            # Static assets
.env.local.example # Environment template
package.json       # Scripts and dependencies
middleware.js      # Route protection middleware
README.md          # Project documentation
```
