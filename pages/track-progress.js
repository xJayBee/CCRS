'use client';

import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

export default function TrackProgress() {
  const [conflicts, setConflicts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    avgDays: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConflicts();
  }, []);

  const fetchConflicts = async () => {
    try {
      const response = await fetch('/api/conflicts', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setConflicts(data || []);

        const total = data?.length || 0;
        const resolved = data?.filter((c) => c.status === 'Resolved').length || 0;
        const open = total - resolved;

        setStats({
          total,
          open,
          resolved,
          avgDays: 14.5,
        });
      }
    } catch (error) {
      console.error('Error fetching conflicts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPendingCount = () => conflicts.filter((c) => c.status === 'Pending review').length;
  const getInProgressCount = () => conflicts.filter((c) => c.status === 'Under review' || c.status === 'In Progress').length;
  const getResolvedCount = () => conflicts.filter((c) => c.status === 'Resolved').length;
  const getEscalatedCount = () => conflicts.filter((c) => c.status === 'Escalated').length;

  const recentUpdates = conflicts.slice(0, 5);

  return (
    <Layout pageTitle="Conflict Progress Dashboard">
      <div className={styles.cardShell}>
        <div className={`${styles.panelCard} ${styles.dashboardCard}`}>
          <div className={styles.dashboardHeader}>
            <div>
              <p className={styles.subtitle}>Conflict Progress Dashboard</p>
              <h2>Track conflict resolution metrics and trends in one place.</h2>
            </div>
            <div className={styles.headerActions}>
              <select className={styles.controlSelect}>
                <option>Filter by Month</option>
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
              </select>
              <button className={styles.primaryButton}>Export Report</button>
            </div>
          </div>

          <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <span>Total Conflicts</span>
              <h3>{stats.total}</h3>
              <p>{stats.total > 0 ? '+5.2% from last month' : 'No conflicts yet'}</p>
            </div>
            <div className={styles.summaryCard}>
              <span>Open Cases</span>
              <h3>{stats.open}</h3>
              <p>{stats.open > 0 ? '-2.1% from last month' : 'All resolved'}</p>
            </div>
            <div className={styles.summaryCard}>
              <span>Resolved Cases</span>
              <h3>{stats.resolved}</h3>
              <p>{stats.resolved > 0 ? '+12.8% from last month' : 'None resolved yet'}</p>
            </div>
            <div className={styles.summaryCard}>
              <span>Avg. Resolution Days</span>
              <h3>{stats.avgDays}</h3>
              <p>-1.5 days faster than last month</p>
            </div>
          </div>

          <div className={styles.chartRow}>
            <div className={styles.chartCard}>
              <div className={styles.cardTitle}>Conflict Status Distribution</div>
              <p>Current breakdown of all conflicts by their resolution status.</p>
              <div className={styles.statusChart}>
                <div className={styles.barRow}>
                  <span>Pending</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFillPending} style={{ width: `${stats.total > 0 ? (getPendingCount() / stats.total) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className={styles.barRow}>
                  <span>In Progress</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFillInProgress} style={{ width: `${stats.total > 0 ? (getInProgressCount() / stats.total) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className={styles.barRow}>
                  <span>Resolved</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFillResolved} style={{ width: `${stats.total > 0 ? (getResolvedCount() / stats.total) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className={styles.barRow}>
                  <span>Escalated</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFillEscalated} style={{ width: `${stats.total > 0 ? (getEscalatedCount() / stats.total) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.chartCard}>
              <div className={styles.cardTitle}>Monthly Resolution Trend</div>
              <p>Reported vs. Resolved conflicts over the last six months.</p>
              <div className={styles.lineChart}>
                <div className={styles.lineLegend}>
                  <span><strong>Reported</strong></span>
                  <span><strong>Resolved</strong></span>
                </div>
                <div className={styles.lineGraph}>
                  <div className={styles.lineGraphAxis}>
                    <div className={styles.lineGraphBar} style={{ height: '40%' }} />
                    <div className={styles.lineGraphBar} style={{ height: '55%' }} />
                    <div className={styles.lineGraphBar} style={{ height: '50%' }} />
                    <div className={styles.lineGraphBar} style={{ height: '58%' }} />
                    <div className={styles.lineGraphBar} style={{ height: '62%' }} />
                    <div className={styles.lineGraphBar} style={{ height: '68%' }} />
                  </div>
                  <div className={styles.lineGraphAlt}>
                    <div className={styles.lineGraphBarAlt} style={{ height: '25%' }} />
                    <div className={styles.lineGraphBarAlt} style={{ height: '35%' }} />
                    <div className={styles.lineGraphBarAlt} style={{ height: '30%' }} />
                    <div className={styles.lineGraphBarAlt} style={{ height: '38%' }} />
                    <div className={styles.lineGraphBarAlt} style={{ height: '45%' }} />
                    <div className={styles.lineGraphBarAlt} style={{ height: '55%' }} />
                  </div>
                  <div className={styles.lineGraphLabels}>
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.bottomRow}>
            <div className={styles.chartCard}>
              <div className={styles.cardTitle}>Mediator Case Load</div>
              <p>Distribution of cases among active mediators.</p>
              <div className={styles.donutSection}>
                <div className={styles.donutChart}>100%</div>
                <div className={styles.donutLegend}>
                  <div className={styles.legendItem}><span className={styles.legendColor} />Mediator A</div>
                  <div className={styles.legendItem}><span className={styles.legendColorSecondary} />Mediator B</div>
                  <div className={styles.legendItem}><span className={styles.legendColorTertiary} />Mediator C</div>
                  <div className={styles.legendItem}><span className={styles.legendColorQuaternary} />Mediator D</div>
                </div>
              </div>
            </div>

            <div className={styles.chartCard}>
              <div className={styles.cardTitle}>Recent Conflict Updates</div>
              <p>Latest status changes and updates on conflicts.</p>
              {isLoading ? (
                <p>Loading...</p>
              ) : recentUpdates.length > 0 ? (
                <div className={styles.tableWrapper}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Parties</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUpdates.map((item) => (
                        <tr key={item.id}>
                          <td>{item.parties}</td>
                          <td>{item.description?.substring(0, 50)}...</td>
                          <td>
                            <span className={`${styles.statusBadge} ${styles[item.status.replace(/ /g, '').toLowerCase()]}`}>
                              {item.status}
                            </span>
                          </td>
                          <td>{item.priority}</td>
                          <td>{new Date(item.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No conflicts found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
