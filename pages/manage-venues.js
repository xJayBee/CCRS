import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import { useAuth } from '../components/AuthContext';
import styles from '../styles/Home.module.css';

const emptyVenue = {
  id: null,
  title: '',
  type: 'Hall',
  capacity: '',
  address: '',
  status: 'Available',
  image: '',
};

export default function ManageVenues() {
  const [venues, setVenues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [venueForm, setVenueForm] = useState(emptyVenue);
  const [showForm, setShowForm] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!['admin', 'mediator', 'staff'].includes(user.role)) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const fetchVenues = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/venues');
      const data = await response.json();
      if (response.ok) {
        setVenues(data);
        setActionMessage('Venue list loaded successfully.');
      } else {
        setActionMessage(data.error || 'Unable to load venues.');
      }
    } catch {
      setActionMessage('Unable to connect to the venue service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const filteredVenues = useMemo(
    () => venues.filter((venue) => {
      const matchesSearch = searchTerm
        ? [venue.title, venue.address, venue.type].join(' ').toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const matchesType = typeFilter ? venue.type === typeFilter : true;
      const matchesStatus = statusFilter ? venue.status === statusFilter : true;
      return matchesSearch && matchesType && matchesStatus;
    }),
    [venues, searchTerm, typeFilter, statusFilter]
  );

  const handleFormChange = (field, value) => {
    setVenueForm((current) => ({ ...current, [field]: value }));
  };

  const handleAddVenue = () => {
    setVenueForm(emptyVenue);
    setSelectedVenue(null);
    setShowForm(true);
    setFormMessage('Adding a new venue. Fill in the fields and save.');
  };

  const handleViewDetails = (venue) => {
    setSelectedVenue(venue);
    setShowForm(false);
    setActionMessage(`Showing details for ${venue.title}.`);
  };

  const handleEditVenue = (venue) => {
    setVenueForm(venue);
    setSelectedVenue(venue);
    setShowForm(true);
    setFormMessage(`Editing venue ${venue.title}.`);
  };

  const handleCancelForm = () => {
    setVenueForm(emptyVenue);
    setShowForm(false);
    setFormMessage('');
  };

  const handleSaveVenue = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setFormMessage('Saving venue...');

    const method = venueForm.id ? 'PATCH' : 'POST';
    const response = await fetch('/api/venues', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(venueForm),
    });

    const data = await response.json();
    if (!response.ok) {
      setFormMessage(data.error || 'Unable to save venue.');
      setIsSaving(false);
      return;
    }

    if (venueForm.id) {
      setVenues((current) => current.map((venue) => (venue.id === data.venue.id ? data.venue : venue)));
      setFormMessage('Venue updated successfully.');
      setActionMessage(`Updated ${data.venue.title}.`);
      setSelectedVenue(data.venue);
    } else {
      setVenues((current) => [data.venue, ...current]);
      setFormMessage('Venue added successfully.');
      setActionMessage(`Created ${data.venue.title}.`);
      setSelectedVenue(data.venue);
    }

    setVenueForm(emptyVenue);
    setShowForm(false);
    setIsSaving(false);
  };

  const handleDeleteVenue = async (venue) => {
    if (!window.confirm(`Delete venue “${venue.title}”? This action cannot be undone.`)) {
      return;
    }

    const response = await fetch(`/api/venues?id=${venue.id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) {
      setActionMessage(data.error || 'Unable to delete venue.');
      return;
    }

    setVenues((current) => current.filter((item) => item.id !== venue.id));
    setSelectedVenue(null);
    setActionMessage('Venue deleted successfully.');
  };

  return (
    <Layout pageTitle="Manage Venues">
      <div className={styles.cardShell}>
        <div className={`${styles.panelCard} ${styles.venuePanel}`}>
          <div className={styles.venueHero}>
            <div>
              <p className={styles.subtitle}>Manage Venues</p>
              <h2>Curated venue directory for conflict sessions and mediation events.</h2>
            </div>
            <button className={styles.primaryButton} type="button" onClick={handleAddVenue}>
              + Add New Venue
            </button>
          </div>

          <div className={styles.searchFilterRow}>
            <div className={styles.searchInputGroup}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search venues by name or address..."
              />
            </div>
            <div className={styles.filterGroup}>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">Filter by Type</option>
                <option value="Hall">Hall</option>
                <option value="Conference Room">Conference Room</option>
                <option value="Outdoor Space">Outdoor Space</option>
                <option value="Multi-purpose Area">Multi-purpose Area</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">Filter by Status</option>
                <option value="Available">Available</option>
                <option value="Booked">Booked</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          {(actionMessage || formMessage) && (
            <div className={styles.pageStatusText}>{formMessage || actionMessage}</div>
          )}

          {showForm && (
            <div className={styles.formCard}>
              <div className={styles.sectionHeader}>
                <h3>{venueForm.id ? 'Edit Venue' : 'Add New Venue'}</h3>
                <p>Fill in venue details and save to persist the listing.</p>
              </div>
              <form className={styles.formGrid} onSubmit={handleSaveVenue}>
                <label className={styles.formField}>
                  <span>Venue Name</span>
                  <input
                    type="text"
                    value={venueForm.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    required
                  />
                </label>
                <label className={styles.formField}>
                  <span>Venue Type</span>
                  <select
                    value={venueForm.type}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    required
                  >
                    <option value="Hall">Hall</option>
                    <option value="Conference Room">Conference Room</option>
                    <option value="Outdoor Space">Outdoor Space</option>
                    <option value="Multi-purpose Area">Multi-purpose Area</option>
                  </select>
                </label>
                <label className={styles.formField}>
                  <span>Capacity</span>
                  <input
                    type="text"
                    value={venueForm.capacity}
                    onChange={(e) => handleFormChange('capacity', e.target.value)}
                    placeholder="e.g., 150 people"
                    required
                  />
                </label>
                <label className={styles.formField}>
                  <span>Address</span>
                  <input
                    type="text"
                    value={venueForm.address}
                    onChange={(e) => handleFormChange('address', e.target.value)}
                    required
                  />
                </label>
                <label className={styles.formField}>
                  <span>Status</span>
                  <select
                    value={venueForm.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                    required
                  >
                    <option value="Available">Available</option>
                    <option value="Booked">Booked</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </label>
                <label className={styles.formField}>
                  <span>Image URL</span>
                  <input
                    type="text"
                    value={venueForm.image}
                    onChange={(e) => handleFormChange('image', e.target.value)}
                    placeholder="Optional image URL"
                  />
                </label>
                <div className={styles.panelActions}>
                  <button type="submit" className={styles.primaryButton} disabled={isSaving}>
                    {isSaving ? 'Saving…' : 'Save Venue'}
                  </button>
                  <button type="button" className={styles.secondaryButton} onClick={handleCancelForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className={styles.sectionHeader}>
            <h3>All Venues</h3>
            <p>{filteredVenues.length} of {venues.length} venues currently displayed.</p>
          </div>

          {selectedVenue && !showForm && (
            <div className={styles.detailsPanel}>
              <h3>{selectedVenue.title}</h3>
              <p className={styles.detailLabel}>{selectedVenue.type} • {selectedVenue.capacity}</p>
              <p className={styles.detailText}>{selectedVenue.address}</p>
              <p className={styles.detailText}>Status: {selectedVenue.status}</p>
              <div className={styles.panelActions}>
                <button className={styles.primaryButton} type="button" onClick={() => handleEditVenue(selectedVenue)}>
                  Edit venue
                </button>
                <button className={styles.dangerButton} type="button" onClick={() => handleDeleteVenue(selectedVenue)}>
                  Delete venue
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className={styles.statusMessage}>Loading venues...</div>
          ) : (
            <div className={styles.venueGrid}>
              {filteredVenues.map((venue) => (
                <article key={venue.id} className={styles.venueCard}>
                  <div
                    className={styles.venueImage}
                    style={{ backgroundImage: `url(${venue.image})` }}
                  />
                  <div className={styles.venueDetails}>
                    <span className={styles.venueType}>{venue.type}</span>
                    <h4>{venue.title}</h4>
                    <p>{venue.capacity}</p>
                    <p className={styles.venueAddress}>{venue.address}</p>
                  </div>
                  <div className={styles.venueCardFooter}>
                    <span className={`${styles.venueStatus} ${styles[venue.status.replace(' ', '').toLowerCase()]}`}>
                      {venue.status}
                    </span>
                    <div className={styles.actionButtons}>
                      <button className={styles.secondaryButton} type="button" onClick={() => handleViewDetails(venue)}>
                        View Details
                      </button>
                      <button className={styles.linkButton} type="button" onClick={() => handleEditVenue(venue)}>
                        Edit
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className={styles.mapPanel}>
            <div className={styles.mapHeader}>
              <div>
                <h3>Venues in Dapitan City</h3>
                <p>Visualizing all managed venues on the map.</p>
              </div>
            </div>
            <div className={styles.mapPlaceholder}>
              <span>DAPITAN CITY</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
