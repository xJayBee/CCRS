import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '../components/Layout';
import { useAuth } from '../components/AuthContext';
import styles from '../styles/Home.module.css';

const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM'];
const monthOptions = ['October 2025', 'November 2025', 'December 2025', 'January 2026'];
const calendarDays = Array.from({ length: 31 }, (_, index) => index + 1);

export default function ScheduleMeeting() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeMonth, setActiveMonth] = useState(monthOptions[0]);
  const [selectedDay, setSelectedDay] = useState(30);
  const [selectedSlot, setSelectedSlot] = useState('09:00 AM');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [attendees, setAttendees] = useState('');
  const [purpose, setPurpose] = useState('');
  const [venue, setVenue] = useState('');
  const [notes, setNotes] = useState('');
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState('');
  const [loadingReports, setLoadingReports] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const currentMonthIndex = monthOptions.indexOf(activeMonth);
  
  const handlePrevMonth = () => setActiveMonth(monthOptions[(currentMonthIndex + monthOptions.length - 1) % monthOptions.length]);
  const handleNextMonth = () => setActiveMonth(monthOptions[(currentMonthIndex + 1) % monthOptions.length]);

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

  useEffect(() => {
    if (user && ['admin', 'mediator', 'staff'].includes(user.role)) {
      fetchScheduledReports();
    }
  }, [user]);

  useEffect(() => {
    if (!searchParams || reports.length === 0) return;
    const reportId = searchParams.get('reportId');
    if (!reportId) return;
    const report = reports.find((r) => r.id === reportId);
    if (report) {
      handleSelectReport(report.id);
    }
  }, [searchParams, reports]);

  const fetchScheduledReports = async () => {
    try {
      setLoadingReports(true);
      setError('');
      const response = await fetch('/api/conflicts', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const reportCandidates = data.filter((r) =>
          ['Approved', 'Under review'].includes(r.status) || r.assignedMediator
        );
        setReports(reportCandidates);
      } else {
        setError('Failed to load reports for scheduling');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Error loading reports: ' + error.message);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleSelectReport = (reportId) => {
    const report = reports.find((r) => r.id === reportId);
    setSelectedReport(reportId);
    
    if (report) {
      // Pre-fill form with report details
      setMeetingTitle(`Conflict Resolution Meeting: ${report.parties}`);
      setAttendees(`${report.parties}, Mediator, Administrator`);
      setPurpose(`Resolution discussion and agreement for: ${report.parties}`);
      setNotes(`Reference: ${report.id}\nLocation: ${report.location}\nPriority: ${report.priority}`);
    } else {
      setMeetingTitle('');
      setAttendees('');
      setPurpose('');
      setNotes('');
    }
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedReport) {
      setError('Please select a report to schedule a meeting for');
      return;
    }

    if (!meetingTitle.trim()) {
      setError('Please enter a meeting title');
      return;
    }

    if (!attendees.trim()) {
      setError('Please specify attendees');
      return;
    }

    if (!venue) {
      setError('Please select a venue');
      return;
    }

    if (!purpose.trim()) {
      setError('Please describe the meeting purpose');
      return;
    }

    try {
      setIsScheduling(true);
      
      // Format the date
      const monthIndex = monthOptions.indexOf(activeMonth);
      const year = monthIndex < 2 ? 2025 : 2026; // October-November 2025, rest 2026
      const scheduledDate = new Date(year, monthIndex, selectedDay);

      const meetingData = {
        title: meetingTitle,
        date: scheduledDate.toISOString().split('T')[0],
        time: selectedSlot,
        attendees,
        purpose,
        venue,
        notes,
        reportId: selectedReport,
        scheduledBy: user?.email,
      };

      const response = await fetch('/api/schedule', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
      });

      if (response.ok) {
        setSuccess('✓ Meeting scheduled successfully!');
        // Reset form
        setMeetingTitle('');
        setAttendees('');
        setPurpose('');
        setVenue('');
        setNotes('');
        setSelectedReport('');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to schedule meeting');
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      setError('Error scheduling meeting: ' + error.message);
    } finally {
      setIsScheduling(false);
    }
  };

  const displayedDays = [...Array(2).fill(null), ...calendarDays];

  return (
    <Layout pageTitle="Schedule Meeting">
      <div className={styles.cardShell}>
        <div className={styles.scheduleShell}>
          {/* Report Selection */}
          <section className={`${styles.panelCard} ${styles.scheduleCard}`}>
            <h2>Select Approved Report</h2>
            <p>Choose a conflict report to schedule a resolution meeting.</p>

            <div className={styles.sectionHeader}>
              <h3>Approved Reports</h3>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="report-select" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.95rem' }}>
                Select a report to schedule
              </label>
              <select
                id="report-select"
                value={selectedReport}
                onChange={(e) => handleSelectReport(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db' }}
              >
                <option value="">-- Select approved report --</option>
                {reports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.parties} — {report.location}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div
                style={{
                  padding: '12px 14px',
                  background: '#fee2e2',
                  color: '#991b1b',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  border: '1px solid #fecaca',
                  borderLeftColor: '#dc2626',
                  borderLeftWidth: '4px',
                  fontSize: '0.9rem',
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div
                style={{
                  padding: '12px 14px',
                  background: '#ecfdf5',
                  color: '#166534',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  border: '1px solid #d1fae5',
                  borderLeftColor: '#16a34a',
                  borderLeftWidth: '4px',
                  fontSize: '0.9rem',
                }}
              >
                {success}
              </div>
            )}

            {loadingReports ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                Loading approved reports...
              </p>
            ) : reports.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>
                No approved reports available. All reports must be approved before scheduling.
              </p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gap: '12px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  marginBottom: '20px',
                }}
              >
                {reports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => handleSelectReport(report.id)}
                    style={{
                      padding: '14px 16px',
                      border: selectedReport === report.id ? '2px solid #4338ca' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      background: selectedReport === report.id ? '#f0f4ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#0f172a' }}>
                          {report.parties}
                        </p>
                        <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#64748b' }}>
                          📍 {report.location}
                        </p>
                        <p style={{ margin: '0', fontSize: '0.85rem', color: '#94a3b8' }}>
                          Priority: <strong>{report.priority}</strong>
                        </p>
                      </div>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: '2px solid #d1d5db',
                          background: selectedReport === report.id ? '#4338ca' : 'transparent',
                          flexShrink: 0,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Calendar and Time Selection */}
          <section className={`${styles.panelCard} ${styles.scheduleCard}`}>
            <h2>Select Date & Time</h2>
            <p>Choose a suitable date and time for your meeting.</p>

            <div className={styles.sectionHeader}>
              <h3>Select Date & Time</h3>
              <p>Choose a suitable date and time for your meeting.</p>
            </div>

            <div className={styles.calendarBox}>
              <div className={styles.calendarHeader}>
                <button className={styles.calendarNav} type="button" onClick={handlePrevMonth}>
                  &lt;
                </button>
                <span>{activeMonth}</span>
                <button className={styles.calendarNav} type="button" onClick={handleNextMonth}>
                  &gt;
                </button>
              </div>
              <div className={styles.calendarWeekdays}>
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>
              <div className={styles.calendarDays}>
                {displayedDays.map((day, index) =>
                  day === null ? (
                    <span key={`empty-${index}`} className={styles.calendarDayEmpty} />
                  ) : (
                    <button
                      key={day}
                      type="button"
                      className={`${styles.calendarDay} ${selectedDay === day ? styles.calendarDaySelected : ''}`}
                      onClick={() => setSelectedDay(day)}
                    >
                      {day}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className={styles.selectedDate}>
              <strong>Selected:</strong> {activeMonth} {selectedDay}
            </div>

            <div className={styles.timeSlotSection}>
              <p className={styles.timeSlotLabel}>Select Time Slot</p>
              <div className={styles.timeSlotGrid}>
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`${styles.timeSlotButton} ${selectedSlot === slot ? styles.timeSlotButtonSelected : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Meeting Details Form */}
          <section className={`${styles.panelCard} ${styles.scheduleCard}`} style={{ gridColumn: '1 / -1' }}>
            <h2>Meeting Details</h2>
            <p>Fill in the specifics for your scheduled meeting.</p>
            <form className={styles.scheduleForm} onSubmit={handleScheduleMeeting}>
              <label className={styles.formField}>
                <span style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '8px', display: 'block' }}>
                  <span style={{ color: '#dc2626' }}>*</span> Meeting Title
                </span>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="Conflict Resolution Meeting: [parties involved]"
                  required
                />
              </label>

              <label className={styles.formField}>
                <span style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '8px', display: 'block' }}>
                  <span style={{ color: '#dc2626' }}>*</span> Attendees
                </span>
                <input
                  type="text"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  placeholder="John Doe, Jane Smith, Mediator, Administrator"
                  required
                />
                <small style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '6px', display: 'block' }}>
                  Separate multiple names with commas
                </small>
              </label>

              <label className={styles.formField}>
                <span style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '8px', display: 'block' }}>
                  <span style={{ color: '#dc2626' }}>*</span> Meeting Purpose
                </span>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Describe the resolution strategies and next steps to be discussed."
                  required
                  rows="4"
                />
                <small style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '6px', display: 'block' }}>
                  Be specific about what will be discussed
                </small>
              </label>

              <label className={styles.formField}>
                <span style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '8px', display: 'block' }}>
                  <span style={{ color: '#dc2626' }}>*</span> Meeting Venue
                </span>
                <select value={venue} onChange={(e) => setVenue(e.target.value)} required>
                  <option value="">-- Select a venue --</option>
                  <option value="Dapitan City Hall Convention Center">Dapitan City Hall Convention Center</option>
                  <option value="Jose Rizal Memorial State University Auditorium">
                    Jose Rizal Memorial State University Auditorium
                  </option>
                  <option value="Dapitan Sports Complex Function Hall">Dapitan Sports Complex Function Hall</option>
                  <option value="Innovation Hub Conference Room">Innovation Hub Conference Room</option>
                  <option value="Coastal View Garden">Coastal View Garden</option>
                </select>
                <small style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '6px', display: 'block' }}>
                  Select from available venues
                </small>
              </label>

              <label className={styles.formField}>
                <span style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '8px', display: 'block' }}>
                  Additional Notes
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific requirements or considerations for the meeting."
                  rows="3"
                />
                <small style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '6px', display: 'block' }}>
                  Optional: Add any special requirements or notes
                </small>
              </label>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isScheduling || !selectedReport}
                style={{
                  opacity: !selectedReport ? 0.6 : 1,
                  cursor: !selectedReport ? 'not-allowed' : 'pointer',
                }}
              >
                {isScheduling ? '⏳ Scheduling Meeting...' : '✓ Schedule Meeting'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </Layout>
  );
}

