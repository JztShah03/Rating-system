import { useState } from 'react';
import './PasswordProtection.css';

const REQUIRED_PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'P@ss1234';

export default function PasswordProtection({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === REQUIRED_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
      localStorage.setItem('appPassword', password);
    } else {
      setError('Invalid password');
      setPassword('');
    }
  };

  // Check if password is already stored in localStorage (for session persistence)
  if (!isAuthenticated && localStorage.getItem('appPassword') === REQUIRED_PASSWORD) {
    setIsAuthenticated(true);
  }

  if (!isAuthenticated) {
    return (
      <div className="password-protection-container">
        <div className="password-protection-box">
          <h1>Access Protected</h1>
          <p>Enter password to continue</p>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
            />
            <button type="submit">Unlock</button>
          </form>
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    );
  }

  return children;
}
