import { createClient, getClients, getUserByEmail } from '../../lib/firestore';
import { getUserFromHeaders, hashPassword } from '../../lib/auth';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const currentUser = getUserFromHeaders(req.headers);
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can list client accounts.' });
      }

      const clients = await getClients();
      const safeClients = clients.map(({ password, ...rest }) => rest);
      return res.status(200).json(safeClients);
    }

    if (req.method === 'POST') {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
      }

      const normalizedEmail = String(email).toLowerCase();
      const existingUser = await getUserByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(400).json({ error: 'A user with that email already exists.' });
      }

      const createdClient = await createClient({
        name,
        email: normalizedEmail,
        password: hashPassword(password),
      });

      const safeClient = {
        id: createdClient.id,
        name: createdClient.name,
        email: createdClient.email,
        role: createdClient.role,
      };

      return res.status(201).json({ user: safeClient });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Clients API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
