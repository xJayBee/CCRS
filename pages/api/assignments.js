import {
  getAssignmentsServer,
  createAssignmentServer,
  updateAssignmentServer,
  getAssignmentByIdServer,
  deleteAssignmentServer,
} from '../../lib/firestore';
import { getAuthTokenFromHeaders, parseToken } from '../../lib/auth';

function validateAssignmentPayload(payload) {
  const { conflictId, mediatorId, mediatorName } = payload;
  if (!conflictId || !mediatorId || !mediatorName) {
    return 'Conflict ID, mediator ID, and mediator name are required.';
  }
  return null;
}

export default async function handler(req, res) {
  try {
    const token = getAuthTokenFromHeaders(req.headers);
    const user = token ? parseToken(token) : null;

    if (req.method === 'GET') {
      const { conflictId, mediatorId, status } = req.query;
      const filters = {};
      if (conflictId) filters.conflictId = conflictId;
      if (mediatorId) filters.mediatorId = mediatorId;
      if (status) filters.status = status;

      const assignments = await getAssignmentsServer(filters);
      return res.status(200).json(assignments);
    }

    if (req.method === 'POST') {
      if (!user) {
        return res.status(401).json({ error: 'Authentication required to create assignment.' });
      }

      if (user.role !== 'admin' && user.role !== 'mediator') {
        return res.status(403).json({ error: 'Only admins and mediators can create assignments.' });
      }

      const payload = req.body;
      const validationError = validateAssignmentPayload(payload);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      const newAssignment = {
        conflictId: payload.conflictId,
        mediatorId: payload.mediatorId,
        mediatorName: payload.mediatorName,
        mediatorEmail: payload.mediatorEmail || user.email,
        status: payload.status || 'Assigned',
        notes: payload.notes || '',
        assignedBy: user.email,
        assignedAt: new Date().toISOString(),
      };

      const assignment = await createAssignmentServer(newAssignment);
      return res.status(201).json({ message: 'Mediator assigned successfully', assignment });
    }

    if (req.method === 'PATCH') {
      if (!user) {
        return res.status(401).json({ error: 'Authentication required to update assignment.' });
      }

      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admin users can update assignments.' });
      }

      const { id, status, notes } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Assignment ID is required.' });
      }

      const existingAssignment = await getAssignmentByIdServer(id);
      if (!existingAssignment) {
        return res.status(404).json({ error: 'Assignment not found.' });
      }

      const updatedAssignment = {
        ...existingAssignment,
        status: status || existingAssignment.status,
        notes: notes !== undefined ? notes : existingAssignment.notes,
      };

      const assignment = await updateAssignmentServer(id, updatedAssignment);
      return res.status(200).json({ message: 'Assignment updated successfully', assignment });
    }

    if (req.method === 'DELETE') {
      if (!user) {
        return res.status(401).json({ error: 'Authentication required to delete assignment.' });
      }

      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admin users can delete assignments.' });
      }

      const id = req.query.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ error: 'Assignment ID is required.' });
      }

      const existingAssignment = await getAssignmentByIdServer(id);
      if (!existingAssignment) {
        return res.status(404).json({ error: 'Assignment not found.' });
      }

      await deleteAssignmentServer(id);
      return res.status(200).json({ message: 'Assignment deleted successfully', id });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).end();
  } catch (error) {
    console.error('Assignments API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
