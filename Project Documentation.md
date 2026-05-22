# Project Documentation

Current snapshot of the Community Conflict Resolution System (CCRS) — setup, environment, structure, and quick reference.

---

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file (no example file is required in this repo):

```bash
copy .env.example .env.local  # Windows
```

3. Add Firebase client and, if used, Firebase Admin values to `.env.local` (see Environment section).

4. Run the app in development:

```bash
npm run dev
```

5. Open:

```text
http://localhost:3000
```

---

## Project Highlights

- Next.js app (version: 14.2.5)
- Role-based access control with middleware and route matching
- Firebase Firestore for persistence (client + optional Admin SDK)
- Server-side and client-side helpers in `lib/`
- Minimal, responsive UI components in `components/`
- API routes under `pages/api/` for backend endpoints
- Vercel-ready deployment (includes `vercel.json` and `next.config.js`)

---

## Environment Variables

Client (required for Firebase client SDK):

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

Optional Server / Admin (used by `lib/firebaseAdmin.js` when provided):

```
FIREBASE_ADMIN_SDK_TYPE
FIREBASE_ADMIN_SDK_PROJECT_ID
FIREBASE_ADMIN_SDK_PRIVATE_KEY  # watch newlines; stored with \n replaced
FIREBASE_ADMIN_SDK_PRIVATE_KEY_ID
FIREBASE_ADMIN_SDK_CLIENT_EMAIL
FIREBASE_ADMIN_SDK_CLIENT_ID
FIREBASE_ADMIN_SDK_AUTH_URI
FIREBASE_ADMIN_SDK_TOKEN_URI
FIREBASE_ADMIN_SDK_AUTH_PROVIDER_CERT_URL
FIREBASE_ADMIN_SDK_CLIENT_CERT_URL
```

Notes:
- `lib/firebase.js` reads `NEXT_PUBLIC_*` variables for the client SDK.
- `lib/firebaseAdmin.js` initializes only when `FIREBASE_ADMIN_SDK_PROJECT_ID` and `FIREBASE_ADMIN_SDK_PRIVATE_KEY` exist.

---

## Scripts (from `package.json`)

```
npm run dev    # next dev
npm run build  # next build
npm run start  # next start
npm run deploy # vercel --prod
```

---

## Pages (user-facing)

The main routes found in `pages/`:

- / (index)
- /about
- /assign-mediator
- /find-venue
- /help
- /legal
- /login
- /manage-reports
- /manage-venues
- /my-reports
- /profile
- /provide-feedback
- /register
- /report-conflict
- /resolve-conflict
- /resources
- /schedule-meeting
- /settings
- /track-progress
- /users

---

## API routes (server endpoints)

Located under `pages/api/`:

- /api/assignments
- /api/auth
- /api/clients
- /api/conflicts
- /api/feedback
- /api/health
- /api/schedule
- /api/users
- /api/venues

---

## Key folders and files

- [components](components): `AuthContext.js`, `Layout.js`, `LogoutConfirmation.js`, `Sidebar.js`
- [lib](lib): helpers and Firebase clients (`firebase.js`, `firebaseAdmin.js`, `firestore.js`, `auth.js`, `apiErrors.js`)
- [data](data): static JSON used for seeding/fixtures (`conflicts.json`, `users.json`, `venues.json`)
- [styles](styles): `globals.css`, `Home.module.css`
- `middleware.js` + `middleware.config.js`: route protection and public route configuration
- `next.config.js`, `vercel.json`: framework & deployment configuration

---

## Middleware & Auth Behavior

- `middleware.config.js` sets the matcher and `PUBLIC_ROUTES`.
- `middleware.js` enforces authentication for protected routes and redirects unauthenticated users to `/login`.
- Role-based route lists are declared in `middleware.config.js` (admin, mediator, staff mappings).

---

## Deployment

- This repo is prepared for Vercel. Use `npm run deploy` (invokes `vercel --prod`) or deploy from the Vercel dashboard.
- Make sure production environment variables are added in Vercel (client + Admin variables if needed).

---

## Changelog (update)

- 2026-05-22: Documentation updated to reflect current project files, pages, API routes, env variables, and middleware behavior.

---

If you'd like, I can also:
- Add an `.env.example` file populated with required keys (no secrets), or
- Generate a short README with setup steps and common troubleshooting commands.

