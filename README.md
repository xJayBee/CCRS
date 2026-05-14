# E-Lupon Community Conflict Resolution System

A Next.js 14 application for managing community conflict resolution workflows, venues, mediators, and case tracking.

## 🚀 Live Demo

**Deployed on Vercel:** [Your Live URL Here]

## Features

- **Authentication & Authorization**
  - Secure HttpOnly cookie-based auth sessions
  - SHA-256 password hashing
  - Role-based access control (Admin, Mediator, Staff)
  - Server-side route protection via middleware
  - Client-side auth context for seamless UX

- **Core Workflows**
  - Report and track conflict cases
  - Manage mediators and assignments
  - Venue booking and scheduling
  - Progress tracking and feedback

- **UI/UX**
  - Responsive sidebar navigation with collapsible sections
  - Real-time notifications dashboard
  - Loading skeletons during auth validation
  - Login page with demo credentials
  - Logout confirmation dialog
  - Role-specific dashboard summaries

- **Cloud Backend**
  - Firebase Firestore for data persistence
  - Real-time data synchronization
  - Scalable cloud infrastructure

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Firebase account (for cloud backend)

### Installation

1. **Clone or download the project**
   ```bash
   cd "c:\ccrs new project"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase backend**
   ```bash
   # Follow FIREBASE_SETUP.md for complete instructions
   cp .env.local.example .env.local
   # Edit .env.local with your Firebase configuration
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## Deployment

### Quick Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   npm run deploy
   ```

3. **Configure environment variables** in Vercel dashboard

See `VERCEL_DEPLOYMENT.md` for detailed instructions.

### Demo Credentials

- **Admin**: admin@example.com / admin123
- **Mediator**: mediator@example.com / mediator123
- **Staff**: staff@example.com / staff123

## Project Structure

```
├── components/          # React components
├── lib/                # Utility functions and Firebase setup
├── pages/              # Next.js pages and API routes
├── styles/             # CSS styles
├── data/               # Sample data (local development)
├── FIREBASE_SETUP.md   # Firebase configuration guide
├── VERCEL_DEPLOYMENT.md # Deployment instructions
└── DEPLOYMENT_CHECKLIST.md # Deployment checklist
```

## Tech Stack

- **Frontend**: Next.js 14, React 18
- **Backend**: Firebase Firestore
- **Authentication**: Custom JWT with HttpOnly cookies
- **Styling**: CSS Modules
- **Deployment**: Vercel
- **Database**: Firebase Firestore (NoSQL)

## API Endpoints

- `GET/POST/PATCH/DELETE /api/venues` - Venue management
- `GET/POST/PATCH/DELETE /api/conflicts` - Conflict reports
- `GET/POST/PATCH/DELETE /api/users` - User management
- `POST /api/auth` - Authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes.
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Demo Credentials

Log in with any of these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@elupun.com | admin123 |
| Mediator | mediator@elupun.com | mediator123 |
| Staff | staff@elupun.com | staff123 |

> **Note:** Demo credentials are displayed on the login page for ease of testing. Remove or disable this in production by setting `NEXT_PUBLIC_DEMO_CREDENTIALS_VISIBLE=false` in `.env.local`.

## Architecture

### Authentication Flow

1. **Login**
   - User submits email and password
   - Server validates against hashed passwords in `data/users.json`
   - On success, creates a Base64-encoded JWT-like token
   - Sets token in an HttpOnly, Secure, SameSite cookie (1-hour expiration)

2. **Session Validation**
   - `AuthContext` fetches `/api/auth` GET on app load
   - Middleware validates token from cookies on each request
   - Protected routes redirect unauthenticated users to `/login`

3. **Logout**
   - User confirms logout via modal dialog
   - Server clears auth cookie
   - Client-side auth state resets
   - User redirected to `/login`

### Directory Structure

```
├── components/           # React components
│   ├── Layout.js        # Main app shell with auth checks
│   ├── Sidebar.js       # Navigation sidebar
│   ├── AuthContext.js   # Centralized auth state (useAuth hook)
│   └── LogoutConfirmation.js  # Logout confirmation modal
├── pages/               # Next.js pages and API routes
│   ├── index.js         # Homepage (public)
│   ├── login.js         # Login page
│   ├── users.js         # Admin user listing
│   ├── api/
│   │   ├── auth.js      # Authentication endpoints (POST login, GET verify, DELETE logout)
│   │   ├── conflicts.js # Conflict report endpoints (protected)
│   │   └── users.js     # User listing endpoint (admin-only)
│   └── [other pages]    # Protected application pages
├── lib/
│   ├── auth.js          # Shared auth utilities (tokens, passwords, cookies)
│   └── apiErrors.js     # API error handling utilities
├── middleware.js        # Next.js middleware for route protection
├── middleware.config.js # Middleware configuration (public routes, RBAC)
├── styles/
│   ├── Home.module.css  # All component styles
│   └── globals.css      # Global styles
├── data/
│   └── users.json       # User database (local file-based)
├── .env.local.example   # Environment configuration template
└── README.md            # This file
```

### Key Technologies

- **Next.js 14.2** - React framework with built-in routing and middleware
- **React 18** - UI library
- **Node.js crypto** - Password hashing (SHA-256)
- **File system storage** - Local JSON-based data persistence
- **CSS Modules** - Component-scoped styling

## Configuration

### Environment Variables

Create `.env.local` from the template for optional configuration:

```bash
cp .env.local.example .env.local
```

Available options:
- `NODE_ENV` - Set to 'production' to hide demo credentials
- `NEXT_PUBLIC_AUTH_SESSION_MAX_AGE` - Session duration in seconds (default: 3600)
- `NEXT_PUBLIC_DEMO_CREDENTIALS_VISIBLE` - Show/hide demo credentials on login page
- `DATA_PATH` - Path to data storage directory

### Middleware & Route Protection

Routes are protected via:
- `middleware.js` - Server-side route protection checks auth cookies
- `middleware.config.js` - Configuration for public routes and role-based access

Protected routes automatically redirect unauthenticated users to `/login`.
Admin-only routes require the `admin` role.

## API Endpoints

### Authentication

- `POST /api/auth` - Login (email + password)
  - Response: `{ user: { id, name, email, role }, }`
  - Cookie: `authToken=...` (HttpOnly, 1 hour)

- `GET /api/auth` - Verify session
  - Requires: Valid auth cookie
  - Response: `{ user: { id, name, email, role } }`

- `DELETE /api/auth` - Logout
  - Clears auth cookie
  - Response: `{ message: 'Logged out successfully.' }`

### Data

- `GET /api/conflicts` - List conflict reports (public read)
- `POST /api/conflicts` - Submit a conflict report (authenticated)
- `GET /api/users` - List users (admin-only)

## Security Considerations

### Implemented

✅ **HttpOnly Cookies** - Tokens stored in HttpOnly, Secure cookies (not accessible to JavaScript)
✅ **Password Hashing** - SHA-256 hashing for stored passwords
✅ **Server-Side Route Protection** - Middleware validates auth on every request
✅ **CSRF Protection** - SameSite cookie policy
✅ **Role-Based Access Control** - Admin-only endpoints reject non-admin requests

### Recommendations for Production

- Replace SHA-256 with bcrypt or Argon2 for password hashing
- Implement proper JWT with signed tokens (not Base64)
- Add HTTPS enforcement (already set in production via `Secure` flag)
- Implement refresh token rotation for extended sessions
- Add rate limiting on login endpoint
- Set up audit logging for sensitive operations
- Use a proper database (PostgreSQL, MongoDB) instead of JSON files
- Implement password reset flow
- Add two-factor authentication (2FA)
- Regular security audits and penetration testing

## Development

### Code Style

- ESLint configured for Next.js (included via CRA)
- CSS Modules for scoped styling
- Component-based architecture

### Building

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build

# Production server
npm start
```

## Troubleshooting

### Issue: "Cannot find module" errors on build
**Solution:** Ensure all imports use correct relative paths and file extensions.

### Issue: Auth not persisting across page reloads
**Solution:** Check that cookies are being set correctly in browser DevTools. Ensure third-party cookies aren't blocked.

### Issue: "Invalid token" when accessing protected routes
**Solution:** Tokens expire after 1 hour. Log out and log back in to refresh.

### Issue: CORS errors on API requests
**Solution:** API requests use `credentials: 'include'` to send cookies. Ensure server allows requests from the same origin.

## Future Enhancements

- [ ] Password reset / recovery flow
- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, Microsoft)
- [ ] Database migration (PostgreSQL/MongoDB)
- [ ] Email notifications for case updates
- [ ] Advanced search and filtering
- [ ] Audit logging
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app (React Native)

## Support & Questions

For issues, questions, or contributions, please contact the development team or create an issue in the project repository.

---

**Version:** 0.1.0  
**Last Updated:** May 3, 2026
