import { hashPassword, createToken, getAuthTokenFromHeaders, parseToken, getAuthCookieOptions } from '../../lib/auth';
import { getUserByEmailServer, createUserServer } from '../../lib/firestore';

// Validate Firebase configuration
function validateFirebaseConfig() {
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing Firebase config: ${missing.join(', ')}`);
  }
}

const defaultUsers = [
  {
    email: 'admin@elupun.com',
    name: 'Admin User',
    password: 'admin123',
    role: 'admin',
  },
  {
    email: 'mediator@elupun.com',
    name: 'Mediator User',
    password: 'mediator123',
    role: 'mediator',
  },
  {
    email: 'staff@elupun.com',
    name: 'Support Staff',
    password: 'staff123',
    role: 'staff',
  },
];

async function ensureDefaultUsers() {
  try {
    for (const userData of defaultUsers) {
      try {
        const normalizedEmail = userData.email.toLowerCase();
        const existingUser = await getUserByEmailServer(normalizedEmail);
        if (!existingUser) {
          await createUserServer({
            name: userData.name,
            email: normalizedEmail,
            password: hashPassword(userData.password),
            role: userData.role,
          });
        }
      } catch (userError) {
        // Silently fail - user might already exist
        if (userError?.message?.includes?.('already exists')) {
          return; // User already exists, skip
        }
        // Log other errors but don't block
        console.warn(`Warning processing user ${userData.email}:`, userError?.message?.substring(0, 100));
      }
    }
  } catch (error) {
    // Don't block on Firestore errors
    console.warn('Warning in ensureDefaultUsers:', error?.message?.substring(0, 100));
  }
}

function getAuthInfo(req) {
  const token = getAuthTokenFromHeaders(req.headers);
  return token ? parseToken(token) : null;
}

// Helper function with timeout
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), ms)
    ),
  ]);
}

export default async function handler(req, res) {
  try {
    validateFirebaseConfig();
    
    if (req.method === 'POST') {
      // Try to ensure default users but don't block if it times out
      try {
        await withTimeout(ensureDefaultUsers(), 5000);
      } catch (timeoutError) {
        console.warn('Default users setup timeout or failed (continuing):', timeoutError?.message);
      }

      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password.' });
      }

      const normalizedEmail = String(email).toLowerCase();
      const user = await getUserByEmailServer(normalizedEmail);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const hashedInput = hashPassword(password);
      if (user.password !== hashedInput) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = createToken(user);
      const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
      res.setHeader('Set-Cookie', `authToken=${token}; ${getAuthCookieOptions()}`);
      return res.status(200).json({ user: safeUser });
    }

    if (req.method === 'GET') {
      const user = getAuthInfo(req);
      if (!user) {
        return res.status(401).json({ error: 'Invalid or missing token.' });
      }

      return res.status(200).json({ user });
    }

    if (req.method === 'DELETE') {
      res.setHeader('Set-Cookie', `authToken=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
      return res.status(200).json({ message: 'Logged out successfully.' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Auth API error:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.message : 'Server error',
    });
  }
}
