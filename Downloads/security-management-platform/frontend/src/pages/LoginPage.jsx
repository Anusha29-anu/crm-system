import { useState } from 'react';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setSuccessMessage('Login successful');

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.message || 'Unable to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-header">
          <span className="auth-badge">Secure Access</span>
          <h1>Security Management Platform</h1>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field-group">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@tenanta.com"
              required
            />
          </label>

          <label className="field-group">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          {error && <div className="message error-message">{error}</div>}
          {successMessage && (
            <div className="message success-message">{successMessage}</div>
          )}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
