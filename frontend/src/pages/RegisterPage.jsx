import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';
import { UserPlus, User, Mail, Key, ShieldCheck, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ROLE_STUDENT');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const userData = await register(name, email, password, role);
      if (userData.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message 
        || (err.code === 'ERR_NETWORK' || !err.response 
            ? 'Cannot connect to the backend server. Please verify your backend URL in .env and make sure it is running.' 
            : 'Registration failed. Please try again.');
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '2rem auto', width: '100%' }}>
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
            <UserPlus size={24} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Create Your Account</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Register to participate in quizzes and track your performance
          </p>
        </div>

        <AlertMessage type="danger" message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Key size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Account Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: role === 'ROLE_STUDENT' ? 'var(--primary-light)' : 'var(--bg-input)',
                border: `1px solid ${role === 'ROLE_STUDENT' ? 'var(--primary)' : 'var(--border-card)'}`,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                <input
                  type="radio"
                  name="role"
                  value="ROLE_STUDENT"
                  checked={role === 'ROLE_STUDENT'}
                  onChange={() => setRole('ROLE_STUDENT')}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span>Student</span>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: role === 'ROLE_ADMIN' ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-input)',
                border: `1px solid ${role === 'ROLE_ADMIN' ? '#a855f7' : 'var(--border-card)'}`,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                <input
                  type="radio"
                  name="role"
                  value="ROLE_ADMIN"
                  checked={role === 'ROLE_ADMIN'}
                  onChange={() => setRole('ROLE_ADMIN')}
                  style={{ accentColor: '#a855f7' }}
                />
                <span>Admin</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
          >
            {isSubmitting ? 'Registering...' : 'Create Account'}
            <ArrowRight size={16} />
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
