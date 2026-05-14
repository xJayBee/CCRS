/**
 * Middleware Configuration
 * Defines which routes require authentication and which are public
 */

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

export const PUBLIC_ROUTES = ['/', '/login', '/about', '/help', '/legal', '/resources'];

/**
 * Routes that require authentication
 * All other routes will check for auth and redirect to /login if not authenticated
 */
export const PROTECTED_ROUTES_PATTERN = /\/(assign-mediator|find-venue|manage-venues|manage-reports|profile|settings|schedule-meeting|resolve-conflict|track-progress|provide-feedback|users)/;

/**
 * Role-based access control (RBAC) configuration
 * Define which routes require specific roles
 */
export const ROLE_BASED_ROUTES = {
  admin: ['/users'],
  mediator: ['/assign-mediator', '/resolve-conflict'],
  staff: ['/track-progress', '/provide-feedback'],
};
