import { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:5000';

function UsersPage({ role, token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' });
  const canManage = ['ADMIN', 'MANAGER'].includes(role);

  if (!canManage) {
    return (
      <section className="page-panel">
        <div className="empty-state">
          <h2>Access denied</h2>
          <p>User management is restricted to administrators and managers.</p>
        </div>
      </section>
    );
  }

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Unable to load users');
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadUsers();
    }
  }, [token]);

  const handleCreateUser = async (event) => {
    event.preventDefault();

    if (!canManage) {
      setMessage('You do not have permission to manage users');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to create user');
      }

      setMessage('User created successfully');
      setForm({ name: '', email: '', password: '', role: 'USER' });
      await loadUsers();
    } catch (err) {
      setMessage(err.message || 'Unable to create user');
    }
  };

  if (loading) {
    return <div className="page-state">Loading users...</div>;
  }

  return (
    <section className="page-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Users</p>
          <h2>User directory</h2>
        </div>
      </div>

      {canManage && (
        <div className="form-card users-form">
          <h3>Create user</h3>

          <form onSubmit={handleCreateUser} className="stack-form inline-form">
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Full name"
              required
            />
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Password"
              required
            />
            <select
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="USER">USER</option>
            </select>
            <button type="submit" className="primary-button">Add user</button>
          </form>
        </div>
      )}

      {message && <div className="standalone-message">{message}</div>}

      <div className="table-card">
        {error && <div className="status-error">{error}</div>}

        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="3">No users found</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`status-badge ${user.role?.toLowerCase()}`}>{user.role}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default UsersPage;
