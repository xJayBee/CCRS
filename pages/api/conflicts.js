import {
  getConflictsServer,
  createConflictServer,
  updateConflictServer,
  getConflictByIdServer,
  deleteConflictServer,
  getConflicts,
  createConflict,
  updateConflict,
  getConflictById,
  deleteConflict,
} from '../../lib/firestore';
import { getAuthTokenFromHeaders, parseToken } from '../../lib/auth';
import { adminDb } from '../../lib/firebaseAdmin';

function validateConflictPayload(payload) {
  const { description, parties, date } = payload;
  if (!description || !parties || !date) {
    return 'Description, parties, and date are required.';
  }
  return null;
}

export default async function handler(req, res) {
    const useAdmin = !!adminDb;
  try {
    if (req.method === 'GET') {
      const search = String(req.query.search || '').trim().toLowerCase();
      const statusFilter = String(req.query.status || '').trim();
      const conflicts = useAdmin ? await getConflictsServer() : await getConflicts();

      let filtered = conflicts;
      if (statusFilter) {
        filtered = filtered.filter((item) => item.status === statusFilter);
      }

      filtered = search
        ? filtered.filter((item) =>
            [item.description, item.parties, item.location, item.priority, item.status, item.submittedAt]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(search)
          )
        : filtered;

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

      const submittedAt = new Date().toISOString();
      const newConflict = {
        description: payload.description,
        parties: payload.parties,
        location: payload.location || 'Not specified',
        priority: payload.priority || 'Normal',
        date: payload.date,
        evidence: payload.evidence || 'None',
        status: payload.status || 'Pending review',
        submittedAt,
        createdBy: user.email,
        reportedBy: user.email,
        activityLog: [
          {
            timestamp: submittedAt,
            actor: user.email,
            action: 'Reported conflict',
            details: `Conflict reported by ${user.email}`,
          },
        ],
      };

      const conflict = useAdmin ? await createConflictServer(newConflict) : await createConflict(newConflict);
      return res.status(201).json({ message: 'Conflict report saved', report: conflict });
    }

    if (req.method === 'PATCH') {
      const token = getAuthTokenFromHeaders(req.headers);
      const user = token ? parseToken(token) : null;
      if (!user) {
        return res.status(401).json({ error: 'Authentication required to update a report.' });
      }

      if (!['admin', 'staff', 'mediator'].includes(user.role)) {
        return res.status(403).json({ error: 'Only admin, staff, or mediator users can update reports.' });
      }

      const { id, status, approvalNotes, resolvedBy, resolvedAt } = req.body;
      if (!id || !status) {
        return res.status(400).json({ error: 'Missing report ID or status.' });
      }

      const allowedStatuses = ['Pending review', 'Under review', 'Resolved', 'Approved'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value.' });
      }

      const existingConflict = useAdmin ? await getConflictByIdServer(id) : await getConflictById(id);
      if (!existingConflict) {
        return res.status(404).json({ error: 'Report not found.' });
      }

      const actionLabel =
        status === 'Approved'
          ? 'Approved report'
          : status === 'Under review'
          ? 'Marked report under review'
          : status === 'Resolved'
          ? 'Resolved report'
          : `Updated status to ${status}`;

      const logEntry = {
        timestamp: new Date().toISOString(),
        actor: user.email,
        action: actionLabel,
        details: approvalNotes || '',
      };

      const updatedConflict = {
        ...existingConflict,
        status,
        approvedBy: status === 'Approved' ? user.email : existingConflict.approvedBy,
        approvalNotes: approvalNotes !== undefined ? approvalNotes : existingConflict.approvalNotes || '',
        approvedAt: status === 'Approved' ? new Date().toISOString() : existingConflict.approvedAt,
        resolvedBy: status === 'Resolved' ? resolvedBy || user.email : existingConflict.resolvedBy,
        resolvedAt: status === 'Resolved' ? resolvedAt || new Date().toISOString() : existingConflict.resolvedAt,
        activityLog: [...(existingConflict.activityLog || []), logEntry],
      };

      const conflict = useAdmin ? await updateConflictServer(id, updatedConflict) : await updateConflict(id, updatedConflict);
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

      const existingConflict = useAdmin ? await getConflictByIdServer(id) : await getConflictById(id);
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

      if (useAdmin) {
        await deleteConflictServer(id);
      } else {
        await deleteConflict(id);
      }
      return res.status(200).json({ message: 'Report deleted successfully', id });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).end();
  } catch (error) {
    console.error('Conflicts API error:', error);
    // Include stack trace in development to aid debugging. In production this helps logs;
    // keep response minimal but return stack for diagnosability while we fix the root cause.
    return res
      .status(500)
      .json({ error: 'Internal server error', message: error.message, stack: error.stack });
  }
}
