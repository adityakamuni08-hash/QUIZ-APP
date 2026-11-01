import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div style={{
      maxWidth: '480px',
      margin: '4rem auto',
      textAlign: 'center',
      padding: '3rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem'
    }} className="card">
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'var(--primary-light)',
        color: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <HelpCircle size={36} />
      </div>

      <h1 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
        The assessment or link you are seeking doesn't exist or has been relocated.
      </p>

      <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
        <Home size={16} />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
