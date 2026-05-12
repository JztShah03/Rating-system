import { LockKeyhole } from 'lucide-react';
import { useState } from 'react';

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

  function handleSubmit(event) {
    event.preventDefault();

    if (!adminPassword) {
      setErrorMessage('Admin password is not configured. Add VITE_ADMIN_PASSWORD to your environment variables.');
      return;
    }

    if (password === adminPassword) {
      sessionStorage.setItem('ratingAdminAuthenticated', 'true');
      onLogin();
      return;
    }

    setErrorMessage('Incorrect password. Please try again.');
  }

  return (
    <main className="page page--admin-login">
      <section className="login-card">
        <div className="login-card__icon">
          <LockKeyhole size={28} aria-hidden="true" />
        </div>
        <span className="eyebrow">Admin Access</span>
        <h1>Service Rating Dashboard</h1>
        <p>Enter the admin password to view user rating analytics.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter admin password"
          />
          {errorMessage ? <p className="form-error" role="alert">{errorMessage}</p> : null}
          <button className="button button--primary" type="submit">
            Login
          </button>
        </form>
      </section>
    </main>
  );
}
