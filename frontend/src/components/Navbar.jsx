import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Award, 
  BarChart3, 
  BookOpen, 
  History, 
  LogOut, 
  ShieldCheck, 
  PlusCircle, 
  User 
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.45rem 0.85rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.88rem',
    fontWeight: 500,
    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
    background: isActive ? 'var(--bg-elevated)' : 'transparent',
    border: isActive ? '1px solid var(--border-card)' : '1px solid transparent',
    transition: 'all var(--transition-fast)'
  });

  return (
    <header style={{
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-card)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--accent-purple))',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--shadow-primary)'
          }}>
            <Award size={20} />
          </div>
          <div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #c7d2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              QuizPulse
            </span>
            <span style={{ fontSize: '0.68rem', display: 'block', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Score Analysis Platform
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        {isAuthenticated && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <NavLink to="/dashboard" style={navLinkStyle}>
              <BookOpen size={16} />
              <span>Quizzes</span>
            </NavLink>

            <NavLink to="/history" style={navLinkStyle}>
              <History size={16} />
              <span>History</span>
            </NavLink>

            <NavLink to="/analytics" style={navLinkStyle}>
              <BarChart3 size={16} />
              <span>Analytics</span>
            </NavLink>

            {isAdmin && (
              <>
                <NavLink to="/admin" style={navLinkStyle}>
                  <ShieldCheck size={16} style={{ color: '#a855f7' }} />
                  <span>Admin Hub</span>
                </NavLink>
                <NavLink to="/admin/create-quiz" style={navLinkStyle}>
                  <PlusCircle size={16} style={{ color: '#38bdf8' }} />
                  <span>Create Quiz</span>
                </NavLink>
              </>
            )}
          </nav>
        )}

        {/* User Badge / Auth CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.75rem',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-card)'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isAdmin ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#fff'
                }}>
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user?.name}
                </span>
                <span className={`badge ${isAdmin ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                  {isAdmin ? 'ADMIN' : 'STUDENT'}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log out"
                style={{ padding: '0.45rem 0.7rem' }}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
