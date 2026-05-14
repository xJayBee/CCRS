import { getAuthTokenFromHeaders, parseToken } from '../../lib/auth';
import { createMeetingServer, getMeetingsServer } from '../../lib/firestore';

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
        title,
        date,
        time,
        attendees,
        purpose,
        venue,
        notes: notes || '',
        reportId,
        scheduledBy: user.email,
        status: 'Scheduled',
      };

      try {
        const savedMeeting = await createMeetingServer(meeting);
        return res.status(201).json({
          message: 'Meeting scheduled successfully',
          meeting: savedMeeting,
        });
      } catch (error) {
        console.error('Error saving meeting:', error);
        return res.status(500).json({ error: 'Failed to save meeting to database' });
      }
    }

    if (req.method === 'GET') {
      try {
        const filters = {};
        if (req.query.reportId) filters.reportId = req.query.reportId;
        if (req.query.status) filters.status = req.query.status;

        const meetings = await getMeetingsServer(filters);
        return res.status(200).json(meetings);
      } catch (error) {
        console.error('Error fetching meetings:', error);
        return res.status(500).json({ error: 'Failed to fetch meetings' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in schedule handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
