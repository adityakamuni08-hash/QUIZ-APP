import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';
import { LogIn, Key, Mail, Shield, User, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const userData = await login(email, password);
      if (userData.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message 
        || (err.code === 'ERR_NETWORK' || !err.response 
            ? 'Cannot connect to the backend server. Please verify your backend URL in .env and make sure it is running.' 
            : 'Invalid email or password. Please verify your credentials.');
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div style={{ maxWidth: '440px', margin: '2rem auto', width: '100%' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem'
          }}>
            <LogIn size={24} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Sign In to QuizPulse</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Enter your credentials to access your quiz portal
          </p>
        </div>

        <AlertMessage type="danger" message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Key size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Credentials Quick Fill */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Quick Demo Autofill
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={() => setDemoCredentials('student@quizapp.com', 'StudentPassword123!')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '0.5rem' }}
            >
              <User size={14} />
              <span>Fill Student</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('admin@quizapp.com', 'AdminPassword123!')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '0.5rem' }}
            >
              <Shield size={14} style={{ color: '#a855f7' }} />
              <span>Fill Admin</span>
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1.5rem' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
