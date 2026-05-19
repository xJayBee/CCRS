# E-Lupon Community Conflict Resolution System

Welcome to the consolidated documentation for the CCRS project. This single file contains the complete setup, architecture, deployment, API, and troubleshooting information for the system.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Prerequisites](#prerequisites)
5. [Installation & Setup](#installation--setup)
6. [Firebase Setup](#firebase-setup)
7. [Firestore Security Rules](#firestore-security-rules)
8. [Authentication & Security](#authentication--security)
9. [Deployment](#deployment)
10. [Deployment Checklist](#deployment-checklist)
11. [API Reference](#api-reference)
12. [CRUD Operations](#crud-operations)
13. [Project Structure](#project-structure)
14. [Troubleshooting](#troubleshooting)
15. [Demo Credentials](#demo-credentials)
16. [Contributing](#contributing)
17. [License](#license)

---

## Latest updates

- Fixed registration flow so unauthenticated users can reach `/register` and create accounts.
- Updated middleware to allow `/register` as a public route.
- Removed the `New Report` and `Find Venue` sidebar quick action buttons.
- Deployed successfully to Vercel: `https://ccrsystem.vercel.app`

## Project Overview

The E-Lupon Community Conflict Resolution System is a Next.js 14 application built to support community conflict reporting, mediation, venue management, and case tracking. It provides role-based access for administrators, mediators, and staff, backed by Firebase Firestore.

### Objectives

- Digitize conflict resolution workflows
- Improve accessibility for community members
- Enhance transparency with status tracking
- Facilitate mediation and venue scheduling
- Maintain secure, auditable records

### Core System Capabilities

- Online conflict reporting
- Case management and status updates
- Venue creation and scheduling
- User and role management
- Feedback collection
- Admin dashboards and notifications

---

## Features

- Secure authentication with HttpOnly cookie sessions
- Role-based access control (admin, mediator, staff)
- Firebase Firestore persistence
- Responsive UI with sidebar navigation
- Form validation, loading states, and status messaging
- Full CRUD support for venues, conflicts, users, and assignments
- Vercel deployment-ready configuration

---

## Tech Stack

- Frontend: Next.js 14, React 18
- Backend: Firebase Firestore
- Authentication: custom auth with HttpOnly cookies
- Styling: CSS Modules and global CSS
- Deployment: Vercel
- Runtime: Node.js 18+

---

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Firebase account and project
- Modern browser (Chrome, Firefox, Edge, Safari)

---

## Installation & Setup

### 1. Clone the project

```powershell
cd "c:\ccrs new project"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

```bash
cp .env.local.example .env.local
```

### 4. Update `.env.local`

Fill in Firebase configuration values from your Firebase project settings.

### 5. Start development server

```bash
npm run dev
```

### 6. Open browser

```
http://localhost:3000
```

---

## Firebase Setup

### Create a Firebase project

1. Go to https://console.firebase.google.com
2. Create a new project
3. Add a Web app
4. Copy the Firebase config object

### Add Firebase config to `.env.local`

```env
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abcdef
```

### Set up Firestore

1. Open Firestore Database in Firebase Console
2. Click **Create database**
3. Choose **Start in test mode** for development
4. Select your region and enable the database

### Collections created automatically

- `venues`
- `conflicts`
- `users`
- `assignments`

---

## Firestore Security Rules

Use the following rules in production once Firebase is configured:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{document=**} {
      allow read, create, update: if true;
    }

    match /venues/{document=**} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }

    match /conflicts/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && (request.auth.token.role == 'admin' || resource.data.createdBy == request.auth.token.email);
    }

    match /assignments/{document=**} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && (request.auth.token.role == 'admin' || request.auth.token.role == 'mediator');
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

> **Note:** The current root rule for `/users` allows open access for development. Update this before production.

---

## Authentication & Security

### Authentication Flow

1. User submits login credentials
2. Server validates hashed password and user record
3. Successful login returns a secure auth cookie
4. Client `AuthContext` validates session with `/api/auth`
5. Protected routes are enforced by middleware

### Session Validation

- `GET /api/auth` — verify auth token
- `POST /api/auth` — login
- `DELETE /api/auth` — logout

### Authentication Fix Summary

The backend is updated so auth requests use server-side Firestore access and can avoid `500` errors. If Firebase Admin SDK is configured, secure admin-level reads are used. Otherwise the app can still run in development with permissive Firestore rules.

---

## Deployment

### Vercel Setup

#### Install Vercel CLI

```bash
npm install -g vercel
```

#### Deploy with CLI

```bash
vercel
vercel --prod
```

#### Deploy with the Vercel dashboard

1. Go to https://vercel.com
2. Click **New Project**
3. Import your repository
4. Set the framework to **Next.js**
5. Use `./` as the root directory
6. Confirm build command: `npm run build`
7. Add environment variables

### Environment Variables on Vercel

Set the same Firebase values used locally:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Redeploy and verify

- Save environment variables
- Trigger a redeploy
- Test the live site after deployment

---

## Deployment Checklist

### Pre-Deployment

- [ ] Firebase project created
- [ ] Firestore enabled
- [ ] `.env.local` configured
- [ ] Application builds successfully
- [ ] Sensitive data removed from Git

### Deployment

- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Project deployed
- [ ] Live URL verified

### Verification

- [ ] Login works
- [ ] Venue CRUD works
- [ ] Conflict reporting works
- [ ] User management works
- [ ] Firestore persists data
- [ ] No browser console errors

---

## API Reference

### Venues API

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/venues` | List all venues | Optional |
| POST | `/api/venues` | Create venue | Required |
| PATCH | `/api/venues` | Update venue | Required |
| DELETE | `/api/venues` | Delete venue | Required |

### Conflicts API

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/conflicts` | List conflicts | Required |
| POST | `/api/conflicts` | Create conflict | Required |
| PATCH | `/api/conflicts` | Update conflict | Admin only |
| DELETE | `/api/conflicts` | Delete conflict | Admin only |

### Users API

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/users` | List users | Admin only |
| POST | `/api/users` | Create user | Admin only |
| PATCH | `/api/users` | Update user | Admin only |
| DELETE | `/api/users` | Delete user | Admin only |

### Auth API

- `POST /api/auth` — Login
- `GET /api/auth` — Session verification
- `DELETE /api/auth` — Logout

---

## CRUD Operations

- Venues: create, read, update, delete
- Conflicts: create, read, update, delete
- Users: create, read, update, delete
- Assignments: create, read, update, delete

This project supports complete CRUD workflows across its core resources.

---

## Project Structure

```
├── components/           # React components
├── pages/                # Next.js pages and API routes
├── styles/               # UI and layout styling
├── lib/                  # Firebase, auth, and utility helpers
├── data/                 # Sample local data
├── public/               # Static assets
├── .env.local.example    # Environment variable template
├── package.json          # Scripts and dependencies
├── middleware.js         # Route protection and auth middleware
└── README.md             # Consolidated documentation
```

---

## Troubleshooting

### Unable to connect to the server

- Verify Firebase environment variables
- Restart the development server after updating `.env.local`
- Check browser console and server logs

### Authentication 500 errors

- Confirm Firebase Admin SDK configuration if used
- For development, allow permissive Firestore rules until secure setup is complete

### Vercel build errors

- Confirm dependencies are installed
- Ensure environment variables are set in Vercel
- Inspect Vercel build logs for details

### Firestore permission denied

- Publish the correct security rules
- Confirm the authenticated request has required role claims

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@elupun.com | admin123 |
| Mediator | mediator@elupun.com | mediator123 |
| Staff | staff@elupun.com | staff123 |

> Remove or hide demo credentials in production.

---

## Contributing

1. Fork the repository
2. Create a branch
3. Implement changes
4. Test thoroughly
5. Submit a pull request

---

## License

This project is provided for educational use.
