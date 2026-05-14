import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

const defaultVenues = [
  {
    id: '1',
    title: 'Dapitan City Hall Convention Center',
    description: 'National Rd, Dapitan City',
    details: 'Capacity: 200 | Amenities: Projector, Wi-Fi, Sound System',
    status: 'Available',
    type: 'Convention Center',
    capacity: 200,
    address: 'National Road, Dapitan City',
    image: 'https://images.unsplash.com/photo-1519671482677-7450ec284188?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    title: 'Jose Rizal Memorial State University Auditorium',
    description: 'College Park, Dapitan City',
    details: 'Capacity: 150 | Amenities: Projector, Sound System, Stage',
    status: 'Limited',
    type: 'Auditorium',
    capacity: 150,
    address: 'College Park, Dapitan City',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    title: 'Dapitan Sports Complex Function Hall',
    description: 'Sports Complex Rd, Dapitan City',
    details: 'Capacity: 120 | Amenities: Wi-Fi, Air Conditioning',
    status: 'Available',
    type: 'Function Hall',
    capacity: 120,
    address: 'Sports Complex Road, Dapitan City',
    image: 'https://images.unsplash.com/photo-1519671482677-7450ec284188?auto=format&fit=crop&w=800&q=80',
  },
];

const getCapacityValue = (capacityText) => {
  const match = capacityText.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
};

export default function FindVenue() {
  const router = useRouter();
  const [venues, setVenues] = useState(defaultVenues);
  const [keyword, setKeyword] = useState('');
  const [capacity, setCapacity] = useState('');
  const [amenities, setAmenities] = useState('');
  const [availability, setAvailability] = useState('');
  const [radius, setRadius] = useState(5);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false);
  const [sortBy, setSortBy] = useState('title');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch venues on mount
  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/venues');
      if (response.ok) {
        const data = await response.json();
        setVenues(data.length > 0 ? data : defaultVenues);
      } else {
        setVenues(defaultVenues);
      }
    } catch (err) {
      console.error('Error fetching venues:', err);
      setVenues(defaultVenues);
      setError('Failed to load venues. Showing default list.');
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = useMemo(() => {
    let results = venues.filter((venue) => {
      const matchesKeyword = [venue.title, venue.description, venue.details, venue.type]
        .join(' ')
        .toLowerCase()
        .includes(keyword.toLowerCase());

      const capacityThreshold =
        capacity === '200+'
          ? 200
          : capacity === '100+'
          ? 100
          : capacity === '50+'
          ? 50
          : 0;
      const matchesCapacity = capacityThreshold ? getCapacityValue(venue.details) >= capacityThreshold : true;

      const matchesAmenities = amenities ? venue.details.toLowerCase().includes(amenities.toLowerCase()) : true;

      const matchesAvailability = availability ? venue.status === availability : true;

      return matchesKeyword && matchesCapacity && matchesAmenities && matchesAvailability;
    });

    // Apply sorting
    if (sortBy === 'capacity') {
      results.sort((a, b) => getCapacityValue(b.details) - getCapacityValue(a.details));
    } else if (sortBy === 'status') {
      const statusOrder = { Available: 1, Limited: 2, Unavailable: 3 };
      results.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    } else {
      results.sort((a, b) => a.title.localeCompare(b.title));
    }

    return results;
  }, [venues, keyword, capacity, amenities, availability, sortBy]);

  const clearFilters = () => {
    setKeyword('');
    setCapacity('');
    setAmenities('');
    setAvailability('');
    setRadius(5);
    setSortBy('title');
    setFilterApplied(false);
    setError('');
  };

  const handleApplyFilters = () => {
    setFilterApplied(true);
    if (filteredVenues.length === 0) {
      setError('No venues found matching your criteria. Try adjusting your filters.');
    } else {
      setError('');
    }
  };

  const handleViewDetails = (venue) => {
    setSelectedVenue(venue);
    setShowDetailModal(true);
  };

  const handleBookVenue = () => {
    if (selectedVenue) {
      // Navigate to booking page or open booking modal
      router.push(`/schedule-meeting?venueId=${selectedVenue.id}&venueName=${encodeURIComponent(selectedVenue.title)}`);
    }
  };

  const handleContactVenue = () => {
    if (selectedVenue) {
      // Could open contact modal or email handler
      alert(`Contact for ${selectedVenue.title}: pending@ccrs.local`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return styles.available;
      case 'Limited':
        return styles.booked;
      case 'Unavailable':
        return styles.unavailable;
      default:
        return '';
    }
  };

  return (
    <Layout pageTitle="Find Venue in Dapitan City">
      <div className={styles.cardShell}>
        <div className={styles.findShell}>
          {/* Filter Sidebar */}
          <aside className={styles.filterCard}>
            <div className={styles.sectionHeader}>
              <h3>Venue Filters</h3>
              <p>{filteredVenues.length} venue(s) found</p>
            </div>

            {error && <div className={styles.statusMessage} style={{ color: '#dc2626', borderColor: '#fecaca', background: '#fee2e2' }}>{error}</div>}

            <form className={styles.filterForm}>
              <label className={styles.formField}>
                <span className={styles.inputLabel}>Search by Keyword</span>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g., convention, hall, park"
                />
              </label>

              <label className={styles.formField}>
                <span className={styles.inputLabel}>Minimum Capacity</span>
                <select value={capacity} onChange={(e) => setCapacity(e.target.value)}>
                  <option value="">Select capacity</option>
                  <option value="50+">50+ people</option>
                  <option value="100+">100+ people</option>
                  <option value="200+">200+ people</option>
                </select>
              </label>

              <label className={styles.formField}>
                <span className={styles.inputLabel}>Amenities</span>
                <select value={amenities} onChange={(e) => setAmenities(e.target.value)}>
                  <option value="">Select amenities</option>
                  <option value="Projector">Projector</option>
                  <option value="Wi-Fi">Wi-Fi</option>
                  <option value="Sound System">Sound System</option>
                  <option value="Stage">Stage</option>
                  <option value="Air Conditioning">Air Conditioning</option>
                </select>
              </label>

              <label className={styles.formField}>
                <span className={styles.inputLabel}>Availability Status</span>
                <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
                  <option value="">All statuses</option>
                  <option value="Available">Available</option>
                  <option value="Limited">Limited</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </label>

              <label className={styles.formField}>
                <span className={styles.inputLabel}>Search Radius: {radius} km</span>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                />
                <small style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  Searching within {radius} km of Dapitan City
                </small>
              </label>

              <div className={styles.filterActions}>
                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={handleApplyFilters}
                >
                  Apply Filters
                </button>
                <button className={styles.filterButton} type="button" onClick={clearFilters}>
                  Clear All
                </button>
              </div>
            </form>
          </aside>

          {/* Map Section */}
          <div className={styles.mapCard}>
            <div className={styles.mapBanner}>
              📍 Dapitan City Venue Map
            </div>
            <div style={{ padding: '16px', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
              <p style={{ margin: '0 0 8px' }}>
                <strong>Found {filteredVenues.length} venues</strong> within {radius} km radius
              </p>
              <p style={{ margin: '0' }}>
                Select a venue from the list to view location details and booking availability.
              </p>
            </div>
          </div>
        </div>

        {/* Venue Results */}
        <div className={`${styles.panelCard} ${styles.venueResultsCard}`}>
          <div className={styles.sectionHeader} style={{ marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px' }}>Available Venues</h3>
              <p style={{ margin: '0', color: '#64748b', fontSize: '0.9rem' }}>
                {filteredVenues.length} of {venues.length} venues match your criteria
              </p>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.filterButton}
              style={{ width: '160px' }}
            >
              <option value="title">Sort by Name</option>
              <option value="capacity">Sort by Capacity</option>
              <option value="status">Sort by Availability</option>
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <p>Loading venues...</p>
            </div>
          ) : filteredVenues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <p style={{ fontSize: '1rem', marginBottom: '8px' }}>No venues found</p>
              <p style={{ fontSize: '0.9rem' }}>Try adjusting your search filters</p>
            </div>
          ) : (
            <div className={styles.venueList}>
              {filteredVenues.map((venue) => (
                <div key={venue.id} className={styles.venueRow}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 6px', color: '#0f172a', fontSize: '1.05rem', fontWeight: '600' }}>
                      {venue.title}
                    </h4>
                    <p className={styles.venueDescription}>{venue.description}</p>
                    <p className={styles.venueDetails}>{venue.details}</p>
                    <p style={{ margin: '8px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                      Type: <strong>{venue.type}</strong>
                    </p>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      alignItems: 'flex-end',
                    }}
                  >
                    <span className={`${styles.statusBadge} ${getStatusColor(venue.status)}`}>
                      {venue.status}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button
                        className={styles.primaryButton}
                        style={{ padding: '10px 16px', fontSize: '0.9rem' }}
                        onClick={() => handleViewDetails(venue)}
                      >
                        View Details
                      </button>
                      {venue.status !== 'Unavailable' && (
                        <button
                          className={styles.secondaryButton}
                          style={{ padding: '10px 16px', fontSize: '0.9rem' }}
                          onClick={() => {
                            setSelectedVenue(venue);
                            handleBookVenue();
                          }}
                        >
                          Book Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Venue Detail Modal */}
      {showDetailModal && selectedVenue && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 className={styles.modalTitle}>{selectedVenue.title}</h2>
                <p className={styles.modalMessage} style={{ marginTop: '4px' }}>
                  {selectedVenue.type}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#94a3b8',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '24px', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 12px', color: '#0f172a', fontWeight: '500' }}>
                <strong>Address:</strong>
              </p>
              <p style={{ margin: '0 0 16px', color: '#475569' }}>{selectedVenue.address}</p>

              <p style={{ margin: '0 0 12px', color: '#0f172a', fontWeight: '500' }}>
                <strong>Capacity:</strong>
              </p>
              <p style={{ margin: '0 0 16px', color: '#475569' }}>
                Up to {selectedVenue.capacity} people
              </p>

              <p style={{ margin: '0 0 12px', color: '#0f172a', fontWeight: '500' }}>
                <strong>Availability:</strong>
              </p>
              <p style={{ margin: '0 0 16px' }}>
                <span className={`${styles.statusBadge} ${getStatusColor(selectedVenue.status)}`}>
                  {selectedVenue.status}
                </span>
              </p>

              <p style={{ margin: '0 0 12px', color: '#0f172a', fontWeight: '500' }}>
                <strong>Amenities & Details:</strong>
              </p>
              <p style={{ margin: '0', color: '#475569' }}>{selectedVenue.details}</p>
            </div>

            <div className={styles.modalActions}>
              {selectedVenue.status !== 'Unavailable' && (
                <button className={styles.primaryButton} onClick={handleBookVenue} style={{ flex: 1 }}>
                  Book Venue
                </button>
              )}
              <button
                className={styles.secondaryButton}
                onClick={handleContactVenue}
                style={{ flex: 1 }}
              >
                Contact
              </button>
              <button
                className={styles.filterButton}
                onClick={() => setShowDetailModal(false)}
                style={{ flex: 1 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
