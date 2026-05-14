import {
  getUsersServer,
  createUserServer,
  getUserByEmailServer,
  updateUserServer,
  deleteUserServer,
} from '../../lib/firestore';
import { getUserFromHeaders, hashPassword } from '../../lib/auth';

export default async function handler(req, res) {
  try {
    const user = getUserFromHeaders(req.headers);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to manage users.' });
    }

    if (req.method === 'GET') {
      const users = await getUsersServer();
      const safeUsers = users.map(({ password, ...rest }) => rest);
      return res.status(200).json(safeUsers);
    }

    if (req.method === 'POST') {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'Name, email, password, and role are required.' });
      }

      const normalizedEmail = email.toLowerCase();
      const existingUser = await getUserByEmailServer(normalizedEmail);
      if (existingUser) {
        return res.status(400).json({ error: 'A user with that email already exists.' });
      }

      const newUser = {
        name,
        email: normalizedEmail,
        password: hashPassword(password),
        role,
      };

      const createdUser = await createUserServer(newUser);
      const safeUser = { id: createdUser.id, name: createdUser.name, email: createdUser.email, role: createdUser.role };
      return res.status(201).json({ user: safeUser });
    }

    if (req.method === 'PATCH') {
      const { id, name, email, password, role } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'User ID is required.' });
      }

      const updatedData = {};
      if (name) updatedData.name = name;
      if (email) updatedData.email = email.toLowerCase();
      if (password) updatedData.password = hashPassword(password);
      if (role) updatedData.role = role;

      if (Object.keys(updatedData).length === 0) {
        return res.status(400).json({ error: 'At least one field to update is required.' });
      }

      const user = await updateUserServer(id, updatedData);
      const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
      return res.status(200).json({ message: 'User updated successfully', user: safeUser });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ error: 'User ID is required.' });
      }

      await deleteUserServer(id);
      return res.status(200).json({ message: 'User deleted successfully', id });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).end();
  } catch (error) {
    console.error('Users API error:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      message: error?.message,
      stack: error?.stack,
    });
    return res.status(500).json({
      error: 'Internal server error',
      details: error?.message,
      stack: error?.stack,
    });
  }
}
