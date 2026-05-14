import { getAuthTokenFromHeaders, parseToken } from '../../lib/auth';

export default async function handler(req, res) {
  try {
    const token = getAuthTokenFromHeaders(req.headers);
    const user = token ? parseToken(token) : null;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required to schedule a meeting.' });
    }

    if (req.method === 'POST') {
      const { title, date, time, attendees, purpose, venue, notes, reportId } = req.body;

      // Validation
      if (!title || !date || !time || !attendees || !purpose || !venue || !reportId) {
        return res.status(400).json({
          error: 'Missing required fields: title, date, time, attendees, purpose, venue, reportId',
        });
      }

      // Create meeting object
      const meeting = {
        id: `MTNG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        date,
        time,
        attendees,
        purpose,
        venue,
        notes: notes || '',
        reportId,
        scheduledBy: user.email,
        createdAt: new Date().toISOString(),
        status: 'Scheduled',
      };

      // In a real application, you would save this to a database
      // For now, we'll return success
      return res.status(201).json({
        message: 'Meeting scheduled successfully',
        meeting: meeting,
      });
    }

    if (req.method === 'GET') {
      // Fetch scheduled meetings
      // This would query a database in a real application
      return res.status(200).json([]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in schedule handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
