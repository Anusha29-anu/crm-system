import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = 'http://localhost:5000';
const PAGE_SIZE = 6;

function SecurityEventsPage({ token }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams();
        if (severityFilter !== 'ALL') params.set('severity', severityFilter);
        if (statusFilter !== 'ALL') params.set('status', statusFilter);

        const response = await fetch(`${API_BASE_URL}/api/security-events?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Unable to load security events');
        }

        const data = await response.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Unable to load security events');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchEvents();
    }
  }, [token, severityFilter, statusFilter]);

  const filteredEvents = useMemo(() => events, [events]);
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const paginatedEvents = filteredEvents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [severityFilter, statusFilter]);

  if (loading) {
    return <div className="page-state">Loading security events...</div>;
  }

  return (
    <section className="page-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Security events</p>
          <h2>Security monitoring</h2>
        </div>
      </div>

      <div className="toolbar compact-toolbar">
        <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)} className="filter-select">
          <option value="ALL">All severities</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="filter-select">
          <option value="ALL">All statuses</option>
          <option value="OPEN">OPEN</option>
          <option value="INVESTIGATING">INVESTIGATING</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>
      </div>

      <div className="table-card">
        {error && <div className="status-error">{error}</div>}

        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Description</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEvents.length === 0 ? (
              <tr>
                <td colSpan="5">No security events found</td>
              </tr>
            ) : (
              paginatedEvents.map((event) => (
                <tr key={event.id}>
                  <td>{event.event_type || 'Unknown'}</td>
                  <td>
                    <span className={`status-badge ${event.severity?.toLowerCase()}`}>
                      {event.severity}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${event.status?.toLowerCase()}`}>
                      {event.status}
                    </span>
                  </td>
                  <td>{event.description || 'No description provided'}</td>
                  <td>{new Date(event.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="pagination-row">
          <button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

export default SecurityEventsPage;
