import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import { useAuth } from '../components/AuthContext';
import styles from '../styles/Home.module.css';

export default function AssignMediator() {
  const [conflicts, setConflicts] = useState([]);
  const [mediators, setMediators] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [selectedMediator, setSelectedMediator] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
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

  useEffect(() => {
    fetchConflictsAndMediators();
  }, []);

  const fetchConflictsAndMediators = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      // Fetch conflicts
      const conflictsRes = await fetch('/api/conflicts', {
        credentials: 'include',
      });
      const conflictsData = await conflictsRes.json();
      const unassignedConflicts = Array.isArray(conflictsData)
        ? conflictsData
            .filter((c) => !c.assignedMediator && c.status !== 'Resolved')
            .sort((a, b) => {
              const priorityWeight = { Urgent: 3, High: 2, Normal: 1 };
              const statusWeight = { 'Pending review': 2, 'Under review': 1, Approved: 0 };
              return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0) ||
                (statusWeight[b.status] || 0) - (statusWeight[a.status] || 0);
            })
        : [];
      setConflicts(unassignedConflicts);

      // Fetch mediators
      const mediatorsRes = await fetch('/api/users?role=mediator', {
        credentials: 'include',
      });
      const mediatorsData = await mediatorsRes.json();
      setMediators(Array.isArray(mediatorsData) ? mediatorsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Failed to load conflicts or mediators');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConflicts = useMemo(
    () => conflicts.filter((conflict) => {
      const matchesSearch = searchTerm
        ? [conflict.id, conflict.description, conflict.parties, conflict.location].join(' ').toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const matchesStatus = statusFilter ? conflict.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    }),
    [conflicts, searchTerm, statusFilter]
  );

  const handleAssignMediator = async () => {
    if (!selectedConflict) {
      setErrorMessage('Please select a conflict');
      return;
    }
    if (!selectedMediator) {
      setErrorMessage('Please select a mediator');
      return;
    }

    try {
      setIsAssigning(true);
      setErrorMessage('');
      
      const mediator = mediators.find(m => m.id === selectedMediator);
      if (!mediator) {
        setErrorMessage('Invalid mediator selected');
        return;
      }

      const response = await fetch('/api/assignments', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conflictId: selectedConflict.id,
          mediatorId: mediator.id,
          mediatorName: mediator.name,
          mediatorEmail: mediator.email,
          notes: assignmentNotes,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        await fetchConflictsAndMediators();
        router.push(`/schedule-meeting?reportId=${selectedConflict.id}`);
      } else {
        setErrorMessage(result.error || 'Failed to assign mediator');
      }
    } catch (error) {
      console.error('Error assigning mediator:', error);
      setErrorMessage('Error assigning mediator: ' + error.message);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Layout pageTitle="Assign Mediator">
      <div className={styles.cardShell}>
        <div className={styles.panelCard}>
          <div className={styles.pageHeaderRow}>
            <div>
              <h2>Assign Mediator</h2>
              <p>Assign qualified mediators to active conflicts for resolution.</p>
            </div>
          </div>

          {successMessage && (
            <div style={{
              padding: '12px 16px',
              background: '#ecfdf5',
              color: '#166534',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid #d1fae5',
            }}>
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div style={{
              padding: '12px 16px',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid #fecaca',
            }}>
              ⚠️ {errorMessage}
            </div>
          )}

          <div className={styles.filterRow}>
            <div className={styles.filterSearch}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conflicts by ID or parties..."
              />
            </div>
            <select
              className={styles.controlSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Pending review">Pending Review</option>
              <option value="Under review">Under Review</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          <div className={styles.sectionHeader}>
            <h3>Available Conflicts for Assignment</h3>
            <p>Select a conflict and assign a mediator to handle the case.</p>
          </div>

          {isLoading ? (
            <p style={{ textAlign: 'center', color: '#64748b' }}>Loading conflicts and mediators...</p>
          ) : filteredConflicts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b' }}>No conflicts available for assignment.</p>
          ) : (
            <>
              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>Conflict ID</th>
                      <th>Parties</th>
                      <th>Status</th>
                      <th>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConflicts.map((conflict) => (
                      <tr key={conflict.id} style={{ background: selectedConflict?.id === conflict.id ? '#eef2ff' : 'transparent' }}>
                        <td>
                          <input
                            type="radio"
                            name="conflict"
                            checked={selectedConflict?.id === conflict.id}
                            onChange={() => setSelectedConflict(conflict)}
                          />
                        </td>
                        <td>{conflict.id}</td>
                        <td>{conflict.parties}</td>
                        <td>
                          <span style={{ padding: '4px 8px', background: '#dbeafe', color: '#1e40af', borderRadius: '4px', fontSize: '0.85rem' }}>
                            {conflict.status}
                          </span>
                        </td>
                        <td>{conflict.priority || 'Normal'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedConflict && (
                <div className={styles.formCard} style={{ marginTop: '24px' }}>
                  <div className={styles.sectionHeader}>
                    <h3>Assign Mediator</h3>
                    <p>Select a mediator for: <strong>{selectedConflict.parties}</strong></p>
                  </div>

                  <div className={styles.formGrid}>
                    <label className={styles.formField}>
                      <span>Select Mediator</span>
                      <select
                        value={selectedMediator}
                        onChange={(e) => setSelectedMediator(e.target.value)}
                        required
                      >
                        <option value="">-- Choose a mediator --</option>
                        {mediators.map((mediator) => (
                          <option key={mediator.id} value={mediator.id}>
                            {mediator.name} ({mediator.email})
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className={styles.formField}>
                      <span>Assignment Notes (Optional)</span>
                      <textarea
                        value={assignmentNotes}
                        onChange={(e) => setAssignmentNotes(e.target.value)}
                        placeholder="Add any notes for this assignment..."
                        rows="3"
                      />
                    </label>

                    <div className={styles.panelActions}>
                      <button
                        className={styles.primaryButton}
                        onClick={handleAssignMediator}
                        disabled={isAssigning || !selectedMediator}
                      >
                        {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
                      </button>
                      <button
                        className={styles.secondaryButton}
                        onClick={() => {
                          setSelectedConflict(null);
                          setSelectedMediator('');
                          setAssignmentNotes('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <p className={styles.tableNote} style={{ marginTop: '24px' }}>
                Showing {filteredConflicts.length} of {conflicts.length} conflicts
              </p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
