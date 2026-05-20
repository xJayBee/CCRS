import { getAuthTokenFromHeaders, parseToken } from '../../lib/auth';
import {
  createMeetingServer,
  getMeetingsServer,
  updateMeetingServer,
  getMeetingByIdServer,
  updateMeeting,
  getMeetingById,
  getConflictByIdServer,
  updateConflictServer,
  getConflictById,
  updateConflict,
} from '../../lib/firestore';
import { adminDb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  try {
    const token = getAuthTokenFromHeaders(req.headers);
    const user = token ? parseToken(token) : null;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required to schedule a meeting.' });
    }

    const useAdmin = !!adminDb;

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
        const savedMeeting = useAdmin ? await createMeetingServer(meeting) : await createMeeting(meeting);

        // Also link meeting to the conflict and mark assigned
        try {
          const existingConflict = useAdmin ? await getConflictByIdServer(reportId) : await getConflictById(reportId);
          if (existingConflict) {
            const updatedConflict = {
              ...existingConflict,
              assignedMeetingId: savedMeeting.id,
              status: 'Assigned',
              activityLog: [
                ...(existingConflict.activityLog || []),
                {
                  timestamp: new Date().toISOString(),
                  actor: user.email,
                  action: 'Scheduled meeting',
                  details: `Meeting ${savedMeeting.id} scheduled on ${date} ${time}`,
                },
              ],
            };

            const cleaned = JSON.parse(JSON.stringify(updatedConflict));
            if (useAdmin) {
              await updateConflictServer(reportId, cleaned);
            } else {
              await updateConflict(reportId, cleaned);
            }
          }
        } catch (err) {
          console.warn('Failed to link meeting to conflict:', err?.message);
        }

        return res.status(201).json({ message: 'Meeting scheduled successfully', meeting: savedMeeting });
      } catch (error) {
        console.error('Error saving meeting:', error);
        return res.status(500).json({ error: 'Failed to save meeting to database', details: error.message });
      }
    }

    if (req.method === 'GET') {
      try {
        const filters = {};
        if (req.query.reportId) filters.reportId = req.query.reportId;
        if (req.query.status) filters.status = req.query.status;

        const meetings = useAdmin ? await getMeetingsServer(filters) : await getMeetings(filters);
        return res.status(200).json(meetings);
      } catch (error) {
        console.error('Error fetching meetings:', error);
        return res.status(500).json({ error: 'Failed to fetch meetings' });
      }
    }

    if (req.method === 'PATCH') {
      // Update meeting status or mark completed
      const { meetingId, action } = req.body;
      if (!meetingId || !action) {
        return res.status(400).json({ error: 'Missing meetingId or action' });
      }

      try {
        const meeting = useAdmin ? await getMeetingByIdServer(meetingId) : await getMeetingById(meetingId);
        if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

        if (action === 'complete') {
          const meetingUpdate = { ...meeting, status: 'Completed', completedAt: new Date().toISOString() };
          const cleanedMeeting = JSON.parse(JSON.stringify(meetingUpdate));
          if (useAdmin) {
            await updateMeetingServer(meetingId, cleanedMeeting);
          } else {
            await updateMeeting(meetingId, cleanedMeeting);
          }

          // Also mark associated conflict as Resolved
          if (meeting.reportId) {
            try {
              const conflict = useAdmin
                ? await getConflictByIdServer(meeting.reportId)
                : await getConflictById(meeting.reportId);
              if (conflict) {
                const updatedConflict = {
                  ...conflict,
                  status: 'Resolved',
                  resolvedBy: user.email,
                  resolvedAt: new Date().toISOString(),
                  activityLog: [
                    ...(conflict.activityLog || []),
                    {
                      timestamp: new Date().toISOString(),
                      actor: user.email,
                      action: 'Meeting completed - resolved conflict',
                      details: `Meeting ${meetingId} completed`,
                    },
                  ],
                };

                const cleanedConflict = JSON.parse(JSON.stringify(updatedConflict));
                if (useAdmin) {
                  await updateConflictServer(conflict.id, cleanedConflict);
                } else {
                  await updateConflict(conflict.id, cleanedConflict);
                }
              }
            } catch (err) {
              console.warn('Failed to update conflict after meeting completion:', err?.message);
            }
          }

          return res.status(200).json({ message: 'Meeting completed and conflict resolved' });
        }

        return res.status(400).json({ error: 'Unknown action' });
      } catch (error) {
        console.error('Error updating meeting:', error);
        return res.status(500).json({ error: 'Failed to update meeting', details: error.message });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in schedule handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
