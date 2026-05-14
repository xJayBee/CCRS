import { getVenues, createVenue, updateVenue, deleteVenue, getVenueById } from '../../lib/firestore';

function validateVenuePayload(payload) {
  const { title, type, capacity, address, status } = payload;
  if (!title || !type || !capacity || !address || !status) {
    return 'Title, type, capacity, address, and status are required.';
  }
  return null;
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const venues = await getVenues();
      return res.status(200).json(venues);
    }

    if (req.method === 'POST') {
      const payload = req.body;
      const validationError = validateVenuePayload(payload);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      const newVenue = {
        title: payload.title,
        type: payload.type,
        capacity: payload.capacity,
        address: payload.address,
        status: payload.status,
        image: payload.image || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
      };

      const venue = await createVenue(newVenue);
      return res.status(201).json({ message: 'Venue added successfully', venue });
    }

    if (req.method === 'PATCH') {
      const payload = req.body;
      const id = payload.id;
      if (!id) {
        return res.status(400).json({ error: 'Valid venue id is required.' });
      }

      const existingVenue = await getVenueById(id);
      if (!existingVenue) {
        return res.status(404).json({ error: 'Venue not found.' });
      }

      const updatedVenue = {
        title: payload.title || existingVenue.title,
        type: payload.type || existingVenue.type,
        capacity: payload.capacity || existingVenue.capacity,
        address: payload.address || existingVenue.address,
        status: payload.status || existingVenue.status,
        image: payload.image || existingVenue.image,
      };

      const venue = await updateVenue(id, updatedVenue);
      return res.status(200).json({ message: 'Venue updated successfully', venue });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ error: 'Valid venue id is required.' });
      }

      const existingVenue = await getVenueById(id);
      if (!existingVenue) {
        return res.status(404).json({ error: 'Venue not found.' });
      }

      await deleteVenue(id);
      return res.status(200).json({ message: 'Venue removed successfully', id });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).end();
  } catch (error) {
    console.error('Venues API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
