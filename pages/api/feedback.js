import { verifyToken } from '../../lib/auth';
import { createFeedbackServer, getFeedbackServer } from '../../lib/firestore';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Verify authentication
      const user = await verifyToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { subject, feedbackType, satisfaction, comments, allowContact } = req.body;

      // Validate required fields
      if (!subject || !feedbackType || !comments) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Create feedback record
      const feedbackData = {
        subject,
        feedbackType,
        satisfaction: Number(satisfaction) || 5,
        comments,
        allowContact: Boolean(allowContact),
        submittedBy: user.email,
        userRole: user.role,
        userName: user.name,
        submittedAt: new Date().toISOString(),
      };

      const feedbackId = await createFeedbackServer(feedbackData);

      res.status(201).json({
        message: 'Feedback submitted successfully',
        feedbackId
      });
    } catch (error) {
      console.error('Error creating feedback:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'GET') {
    try {
      // Verify authentication
      const user = await verifyToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Only admins can view all feedback
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const feedback = await getFeedbackServer();
      res.status(200).json(feedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}