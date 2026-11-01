import React from 'react';
import { Award, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      padding: '2rem 1.5rem',
      background: 'rgba(11, 15, 25, 0.95)',
      marginTop: 'auto',
      fontSize: '0.85rem',
      color: 'var(--text-muted)'
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={18} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>QuizPulse</span>
          <span>• Interactive Online Assessment & Performance Insights</span>
        </div>
        <div>
          <span>Full-Stack Architecture: React + Spring Boot + JPA + MySQL</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
