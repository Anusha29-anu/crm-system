import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CampaignsPage from './pages/CampaignsPage';
import SecurityEventsPage from './pages/SecurityEventsPage';
import UsersPage from './pages/UsersPage';
import AuditLogsPage from './pages/AuditLogsPage';
import './styles.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'security-events', label: 'Security Events' },
  { id: 'users', label: 'Users', managerOnly: true },
  { id: 'audit-logs', label: 'Audit Logs', adminOnly: true },
];

const decodeJwtRole = (token) => {
  if (!token) return 'USER';

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || 'USER';
  } catch (error) {
    return 'USER';
  }
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [currentView, setCurrentView] = useState('dashboard');
  const [role, setRole] = useState(() => decodeJwtRole(localStorage.getItem('token')));

  useEffect(() => {
    const syncAuthState = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(Boolean(token));
      setRole(decodeJwtRole(token));
    };

    window.addEventListener('storage', syncAuthState);
    return () => window.removeEventListener('storage', syncAuthState);
  }, []);

  useEffect(() => {
    if (role === 'USER' && (currentView === 'users' || currentView === 'audit-logs')) {
      setCurrentView('dashboard');
    }
  }, [currentView, role]);

  const handleLoginSuccess = () => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(Boolean(token));
    setRole(decodeJwtRole(token));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCurrentView('dashboard');
    setRole('USER');
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderPage = () => {
    switch (currentView) {
      case 'campaigns':
        return <CampaignsPage role={role} token={localStorage.getItem('token')} />;
      case 'security-events':
        return <SecurityEventsPage token={localStorage.getItem('token')} />;
      case 'users':
        return <UsersPage role={role} token={localStorage.getItem('token')} />;
      case 'audit-logs':
        return <AuditLogsPage role={role} />;
      case 'dashboard':
      default:
        return <DashboardPage role={role} token={localStorage.getItem('token')} />;
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-mark">SP</span>
          <div>
            <p className="eyebrow small-margin">Security</p>
            <h3>Platform</h3>
          </div>
        </div>

        <nav className="side-nav" aria-label="Application navigation">
          {NAV_ITEMS.filter((item) => {
            if (item.adminOnly) return role === 'ADMIN';
            if (item.managerOnly) return role === 'ADMIN' || role === 'MANAGER';
            return true;
          }).map((item) => (
            <button
              type="button"
              key={item.id}
              className={`side-nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="user-pill">{role}</span>
          <button type="button" className="logout-button full-width" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-panel">{renderPage()}</main>
    </div>
  );
}

export default App;
