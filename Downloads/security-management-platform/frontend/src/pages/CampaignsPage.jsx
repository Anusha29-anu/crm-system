import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = 'http://localhost:5000';
const PAGE_SIZE = 5;
const STATUSES = ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

function CampaignsPage({ role, token }) {
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ name: '', description: '', status: 'DRAFT' });
  const [assignmentTarget, setAssignmentTarget] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [campaignAssignments, setCampaignAssignments] = useState({});
  const [actionMessage, setActionMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canManage = ['ADMIN', 'MANAGER'].includes(role);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const campaignsResponse = await fetch(`${API_BASE_URL}/api/campaigns`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!campaignsResponse.ok) {
        throw new Error('Unable to load campaign data');
      }

      const campaignsData = await campaignsResponse.json();
      setCampaigns(campaignsData);

      if (canManage) {
        const usersResponse = await fetch(`${API_BASE_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!usersResponse.ok) {
          throw new Error('Unable to load users for campaign assignment');
        }

        setUsers(await usersResponse.json());
      } else {
        setUsers([]);
      }
    } catch (err) {
      setError(err.message || 'Unable to load campaign data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch = !search || (campaign.name || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || campaign.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / PAGE_SIZE));
  const paginatedCampaigns = filteredCampaigns.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canManage) {
      setActionMessage('You do not have permission to manage campaigns');
      return;
    }

    try {
      setSubmitting(true);
      setActionMessage('');

      const isEditing = Boolean(form.id);
      const response = await fetch(
        isEditing ? `${API_BASE_URL}/api/campaigns/${form.id}` : `${API_BASE_URL}/api/campaigns`,
        {
          method: isEditing ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            status: form.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save campaign');
      }

      setActionMessage(isEditing ? 'Campaign updated successfully' : 'Campaign created successfully');
      setForm({ name: '', description: '', status: 'DRAFT' });
      setSelectedCampaignId(null);
      await loadData();
    } catch (err) {
      setActionMessage(err.message || 'Unable to save campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (campaign) => {
    setForm({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description || '',
      status: campaign.status,
    });
    setSelectedCampaignId(campaign.id);
  };

  const handleDelete = async (campaignId) => {
    if (!window.confirm('Delete this campaign?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete campaign');
      }

      setActionMessage('Campaign deleted successfully');
      await loadData();
    } catch (err) {
      setActionMessage(err.message || 'Unable to delete campaign');
    }
  };

  const handleAssignUser = async (campaignId) => {
    if (!assignmentTarget) {
      setActionMessage('Choose a user to assign first');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/campaigns/${campaignId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: Number(assignmentTarget) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to assign user');
      }

      setCampaignAssignments((current) => ({
        ...current,
        [campaignId]: [...(current[campaignId] || []), Number(assignmentTarget)],
      }));
      setAssignmentTarget('');
      setActionMessage('User assigned successfully');
    } catch (err) {
      setActionMessage(err.message || 'Unable to assign user');
    }
  };

  const handleRemoveUser = async (campaignId, userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/campaigns/${campaignId}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to remove user');
      }

      setCampaignAssignments((current) => ({
        ...current,
        [campaignId]: (current[campaignId] || []).filter((id) => id !== userId),
      }));
      setActionMessage('User removed from campaign');
    } catch (err) {
      setActionMessage(err.message || 'Unable to remove user');
    }
  };

  if (loading) {
    return <div className="page-state">Loading campaigns...</div>;
  }

  return (
    <section className="page-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Campaigns</p>
          <h2>Campaign management</h2>
        </div>
      </div>

      <div className="toolbar">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search campaigns"
          className="search-input"
        />

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="filter-select">
          <option value="ALL">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        {canManage && (
          <button type="button" className="primary-button" onClick={() => {
            setForm({ name: '', description: '', status: 'DRAFT' });
            setSelectedCampaignId(null);
          }}>
            + New Campaign
          </button>
        )}
      </div>

      {actionMessage && <div className="standalone-message">{actionMessage}</div>}

      <div className="campaign-layout">
        <div className="form-card">
          <h3>{selectedCampaignId ? 'Edit campaign' : 'Create campaign'}</h3>

          <form onSubmit={handleSubmit} className="stack-form">
            <label className="field-group compact-field">
              <span>Campaign Name</span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>

            <label className="field-group compact-field">
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                rows="4"
              />
            </label>

            <label className="field-group compact-field">
              <span>Status</span>
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>

            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? 'Saving...' : selectedCampaignId ? 'Update campaign' : 'Create campaign'}
            </button>
          </form>
        </div>

        <div className="table-card">
          {error && <div className="status-error">{error}</div>}

          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCampaigns.length === 0 ? (
                <tr>
                  <td colSpan="4">No campaigns found</td>
                </tr>
              ) : (
                paginatedCampaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>
                      <div className="cell-primary">{campaign.name}</div>
                      <small>{campaign.description || 'No description'}</small>
                    </td>
                    <td>
                      <span className={`status-badge ${campaign.status?.toLowerCase()}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td>{new Date(campaign.created_at).toLocaleDateString()}</td>
                    <td className="action-group">
                      {canManage && (
                        <>
                          <button type="button" className="ghost-button" onClick={() => handleEdit(campaign)}>
                            Edit
                          </button>
                          <button type="button" className="ghost-button danger" onClick={() => handleDelete(campaign.id)}>
                            Delete
                          </button>
                        </>
                      )}
                    </td>
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
      </div>

      <div className="assignment-card">
        <h3>Assign users</h3>

        <div className="assignment-controls">
          <select value={assignmentTarget} onChange={(event) => setAssignmentTarget(event.target.value)} className="filter-select">
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
            ))}
          </select>

          <button type="button" className="primary-button" onClick={() => handleAssignUser(selectedCampaignId || campaigns[0]?.id)} disabled={!selectedCampaignId && !campaigns[0]}>
            Assign to selected campaign
          </button>
        </div>

        {selectedCampaignId && (
          <div className="assigned-users">
            <strong>Campaign users</strong>
            {(campaignAssignments[selectedCampaignId] || []).length === 0 ? (
              <p>No users assigned yet.</p>
            ) : (
              <ul>
                {(campaignAssignments[selectedCampaignId] || []).map((userId) => {
                  const user = users.find((item) => item.id === userId);
                  if (!user) return null;

                  return (
                    <li key={user.id}>
                      <span>{user.name}</span>
                      <button type="button" className="ghost-button danger" onClick={() => handleRemoveUser(selectedCampaignId, user.id)}>
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default CampaignsPage;
