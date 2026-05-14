import {
  getConflictsServer,
  createConflictServer,
  updateConflictServer,
  getConflictByIdServer,
  deleteConflictServer,
} from '../../lib/firestore';
import { getAuthTokenFromHeaders, parseToken } from '../../lib/auth';

function validateConflictPayload(payload) {
  const { description, parties, date } = payload;
  if (!description || !parties || !date) {
    return 'Description, parties, and date are required.';
  }
  return null;
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const search = String(req.query.search || '').trim().toLowerCase();
      const conflicts = await getConflictsServer();
      
      const filtered = search
        ? conflicts.filter((item) =>
            [item.description, item.parties, item.location, item.priority, item.status, item.submittedAt]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(search)
          )
        : conflicts;

      return res.status(200).json(filtered.reverse());
    }

    if (req.method === 'POST') {
      const token = getAuthTokenFromHeaders(req.headers);
      const user = token ? parseToken(token) : null;
      if (!user) {
        return res.status(401).json({ error: 'Authentication required to submit a report.' });
      }

      const payload = req.body;
      const validationError = validateConflictPayload(payload);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      const newConflict = {
        description: payload.description,
        parties: payload.parties,
        location: payload.location || 'Not specified',
        priority: payload.priority || 'Normal',
        date: payload.date,
        evidence: payload.evidence || 'None',
        status: payload.status || 'Pending review',
        submittedAt: payload.submittedAt || new Date().toISOString(),
        createdBy: user.email,
      };

      const conflict = await createConflictServer(newConflict);
      return res.status(201).json({ message: 'Conflict report saved', report: conflict });
    }

    if (req.method === 'PATCH') {
      const token = getAuthTokenFromHeaders(req.headers);
      const user = token ? parseToken(token) : null;
      if (!user) {
        return res.status(401).json({ error: 'Authentication required to approve a report.' });
      }

      if (!['admin', 'staff'].includes(user.role)) {
        return res.status(403).json({ error: 'Only admin and staff users can approve reports.' });
      }

      const { id, status, approvalNotes } = req.body;
      if (!id || !status) {
        return res.status(400).json({ error: 'Missing report ID or status.' });
      }

      const allowedStatuses = ['Pending review', 'Under review', 'Resolved', 'Approved'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value.' });
      }

      const existingConflict = await getConflictByIdServer(id);
      if (!existingConflict) {
        return res.status(404).json({ error: 'Report not found.' });
      }

      const updatedConflict = {
        ...existingConflict,
        status,
        approvedBy: user.email,
        approvalNotes: approvalNotes || existingConflict.approvalNotes || '',
        approvedAt: status === 'Approved' ? new Date().toISOString() : existingConflict.approvedAt,
      };

      const conflict = await updateConflictServer(id, updatedConflict);
      return res.status(200).json({ message: 'Report updated successfully', report: conflict });
    }

    if (req.method === 'DELETE') {
      const token = getAuthTokenFromHeaders(req.headers);
      const user = token ? parseToken(token) : null;
      if (!user) {
        return res.status(401).json({ error: 'Authentication required to delete a report.' });
      }

      const id = req.query.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ error: 'Missing report ID.' });
      }

      const existingConflict = await getConflictByIdServer(id);
      if (!existingConflict) {
        return res.status(404).json({ error: 'Report not found.' });
      }

      // Allow deletion if user is admin or the report creator
      const isCreator = existingConflict.createdBy === user.email;
      const isAdmin = user.role === 'admin';
      
      if (!isCreator && !isAdmin) {
        return res.status(403).json({ error: 'You do not have permission to delete this report.' });
      }

      // Only allow deletion if report is pending review
      if (existingConflict.status !== 'Pending review' && !isAdmin) {
        return res.status(400).json({ error: 'Can only delete reports that are pending review.' });
      }

      await deleteConflictServer(id);
      return res.status(200).json({ message: 'Report deleted successfully', id });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).end();
  } catch (error) {
    console.error('Conflicts API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
