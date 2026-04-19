import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api';
import { useAuth } from '../auth-context';

export function RegisterPage() {
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { accessToken } = await register(email, password);
      setToken(accessToken);
      navigate('/documents', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '48px auto', padding: 16 }}>
      <h1>Register</h1>
      <p style={{ color: '#555', fontSize: 14 }}>
        Create an account. Password must be at least 8 characters.
      </p>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="reg-email">Email</label>
          <br />
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="reg-password">Password</label>
          <br />
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        {error ? (
          <p style={{ color: 'crimson', fontSize: 14 }} role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p style={{ marginTop: 16, fontSize: 14 }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
