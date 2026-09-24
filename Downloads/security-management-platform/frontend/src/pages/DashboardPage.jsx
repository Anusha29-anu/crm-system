import { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:5000';

function DashboardPage({ role, token }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalCampaigns: 0,
    openSecurityEvents: 0,
    highCriticalSecurityEvents: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const userRequests = ['ADMIN', 'MANAGER'].includes(role)
          ? [fetch(`${API_BASE_URL}/api/users`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })]
          : [];

        const [campaignsResponse, securityEventsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/campaigns`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/api/security-events`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!campaignsResponse.ok || !securityEventsResponse.ok) {
          throw new Error('Unable to load dashboard data');
        }

        const [campaignsData, securityEventsData] = await Promise.all([
          campaignsResponse.json(),
          securityEventsResponse.json(),
        ]);

        const campaigns = Array.isArray(campaignsData) ? campaignsData : [];
        const securityEvents = Array.isArray(securityEventsData) ? securityEventsData : [];

        let users = [];
        if (userRequests.length > 0) {
          const usersResponse = await userRequests[0];
          if (usersResponse.ok) {
            users = await usersResponse.json();
          }
        }

        const activity = [
          ...users.map((user) => ({
            title: 'User added',
            detail: `${user.name} (${user.role})`,
            timestamp: user.created_at,
          })),
          ...campaigns.map((campaign) => ({
            title: 'Campaign update',
            detail: `${campaign.name} is ${campaign.status}`,
            timestamp: campaign.updated_at || campaign.created_at,
          })),
          ...securityEvents.map((event) => ({
            title: `${event.event_type} event`,
            detail: `${event.severity} / ${event.status}`,
            timestamp: event.created_at,
          })),
        ]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 6);

        setMetrics({
          totalUsers: users.length,
          totalCampaigns: campaigns.length,
          openSecurityEvents: securityEvents.filter((event) => event.status === 'OPEN').length,
          highCriticalSecurityEvents: securityEvents.filter((event) => ['HIGH', 'CRITICAL'].includes(event.severity)).length,
        });
        setRecentActivity(activity);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [role, token]);

  if (loading) {
    return <div className="page-state">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="page-state error-state">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <section className="page-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Tenant overview</h2>
        </div>
        <span className="user-pill">{role}</span>
      </div>

      <div className="summary-grid">
        <article className="summary-card">
          <span>Total Users</span>
          <strong>{metrics.totalUsers}</strong>
        </article>
        <article className="summary-card">
          <span>Total Campaigns</span>
          <strong>{metrics.totalCampaigns}</strong>
        </article>
        <article className="summary-card">
          <span>Open Security Events</span>
          <strong>{metrics.openSecurityEvents}</strong>
        </article>
        <article className="summary-card">
          <span>Critical/High Events</span>
          <strong>{metrics.highCriticalSecurityEvents}</strong>
        </article>
      </div>

      <div className="activity-layout">
        <div className="content-panel">
          <h3>Overview</h3>
          <p>
            This tenant currently has active campaign and security monitoring coverage across users,
            incident handling, and operational tracking.
          </p>
        </div>

        <div className="content-panel">
          <h3>Recent activity</h3>
          <ul className="activity-list">
            {recentActivity.map((item, index) => (
              <li key={`${item.title}-${index}`}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
                <small>{new Date(item.timestamp).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
