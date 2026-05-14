import { NextResponse } from 'next/server';
import { PUBLIC_ROUTES, ROLE_BASED_ROUTES, config } from './middleware.config';

const publicRoutes = PUBLIC_ROUTES;

export { config };

function parseToken(token) {
  try {
    const raw = atob(token);
    const decoded = decodeURIComponent(
      Array.from(raw, (char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join('')
    );
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function getAuthToken(req) {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  const cookieHeader = req.headers.get('cookie') || '';
  const authCookie = cookieHeader
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith('authToken='));

  if (!authCookie) {
    return null;
  }

  return authCookie.split('=')[1];
}

export function middleware(req) {
  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/static')) {
    return NextResponse.next();
  }

  const token = getAuthToken(req);
  const user = token ? parseToken(token) : null;
  const isPublicRoute = publicRoutes.includes(pathname);

  if (!user && !isPublicRoute) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && pathname === '/login') {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
