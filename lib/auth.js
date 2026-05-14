import crypto from 'crypto';

export function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function createToken(user) {
  return Buffer.from(
    JSON.stringify({ id: user.id, email: user.email, name: user.name, role: user.role, issuedAt: Date.now() })
  ).toString('base64');
}

export function parseToken(token) {
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

export function getAuthTokenFromHeaders(headers) {
  const authHeader = headers.authorization || headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  const cookieHeader = headers.cookie || headers.Cookie || '';
  const cookiePairs = cookieHeader.split(';').map((entry) => entry.trim());
  const authCookie = cookiePairs.find((entry) => entry.startsWith('authToken='));
  if (!authCookie) {
    return null;
  }

  return authCookie.split('=')[1];
}

export function getUserFromHeaders(headers) {
  const token = getAuthTokenFromHeaders(headers);
  return token ? parseToken(token) : null;
}

export function getAuthCookieOptions() {
  const secureFlag = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';
  return `HttpOnly; Path=/; SameSite=Lax; ${secureFlag}Max-Age=3600`;
}
