import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import { useAuth } from '../components/AuthContext';
import styles from '../styles/Home.module.css';

const conflicts = [
  { id: 'C-001', type: 'Family Dispute', parties: 'Alcantara Family', reported: '2024-07-01', status: 'New Report' },
  { id: 'C-002', type: 'Property Issue', parties: 'Neighbors: Reyes & Cruz', reported: '2024-06-28', status: 'Pending Assignment' },
  { id: 'C-003', type: 'Community Conflict', parties: 'Sitio Upper vs. Lower', reported: '2024-06-25', status: 'New Report' },
  { id: 'C-004', type: 'Business Dispute', parties: 'Vendor A & Customer B', reported: '2024-06-20', status: 'Pending Assignment' },
  { id: 'C-005', type: 'Workplace Harassment', parties: 'Employee X & Manager Y', reported: '2024-06-15', status: 'Escalated' },
];

export default function AssignMediator() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedConflict, setAssignedConflict] = useState(null);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!['admin', 'mediator', 'staff'].includes(user.role)) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const filteredConflicts = useMemo(
    () => conflicts.filter((conflict) => {
      const matchesSearch = searchTerm
        ? [conflict.id, conflict.type, conflict.parties].join(' ').toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const matchesType = typeFilter ? conflict.type === typeFilter : true;
      const matchesStatus = statusFilter ? conflict.status === statusFilter : true;
      return matchesSearch && matchesType && matchesStatus;
    }),
    [searchTerm, typeFilter, statusFilter]
  );

  const assignMediator = (id) => {
    setAssignedConflict(id);
  };

  return (
    <Layout pageTitle="Assign Mediator">
      <div className={styles.cardShell}>
        <div className={styles.panelCard}>
          <div className={styles.pageHeaderRow}>
            <div>
              <h2>Assign Mediator</h2>
              <p>Effortlessly coordinate mediator assignment for active conflicts.</p>
            </div>
          </div>

          <div className={styles.filterRow}>
            <div className={styles.filterSearch}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conflicts by ID or keyword..."
              />
            </div>
            <select
              className={styles.controlSelect}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Conflict Type</option>
              <option value="Family Dispute">Family Dispute</option>
              <option value="Property Issue">Property Issue</option>
              <option value="Community Conflict">Community Conflict</option>
              <option value="Workplace Harassment">Workplace Harassment</option>
            </select>
            <select
              className={styles.controlSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Status</option>
              <option value="New Report">New Report</option>
              <option value="Pending Assignment">Pending Assignment</option>
              <option value="Escalated">Escalated</option>
            </select>
            <button className={styles.filterButton} type="button">Filter</button>
          </div>

          <div className={styles.sectionHeader}>
            <h3>Conflicts Awaiting Mediator</h3>
            <p>List of conflicts that require a mediator to be assigned.</p>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Conflict ID</th>
                  <th>Type</th>
                  <th>Parties Involved</th>
                  <th>Date Reported</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredConflicts.map((conflict) => (
                  <tr key={conflict.id}>
                    <td>{conflict.id}</td>
                    <td>{conflict.type}</td>
                    <td>{conflict.parties}</td>
                    <td>{conflict.reported}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[conflict.status.replace(/ /g, '').toLowerCase()]}`}>
                        {conflict.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.actionButton}
                        type="button"
                        onClick={() => assignMediator(conflict.id)}
                      >
                        Assign Mediator
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {assignedConflict && (
            <p className={styles.statusMessage}>Mediator assigned to conflict {assignedConflict}.</p>
          )}

          <p className={styles.tableNote}>Showing {filteredConflicts.length} of {conflicts.length} conflicts</p>
        </div>
      </div>
    </Layout>
  );
}
