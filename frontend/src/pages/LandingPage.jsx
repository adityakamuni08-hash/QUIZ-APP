import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Award, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  UserCheck
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (email, password) => {
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      navigate('/login');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', paddingBottom: '2rem' }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '3rem 1rem 1rem',
        maxWidth: '850px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.9rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#a5b4fc',
          fontSize: '0.825rem',
          fontWeight: 600
        }}>
          <Sparkles size={16} />
          <span>Interactive Online Quiz & Score Analytics Platform</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          background: 'linear-gradient(to right, #ffffff, #c7d2fe, #a5b4fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Assess Knowledge with Instant Automated Evaluation
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          lineHeight: 1.6
        }}>
          Test your skills across technical categories, receive verified server-side score calculation, and review comprehensive visual performance analytics.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.85rem 1.85rem', fontSize: '1rem' }}>
              <span>Go to Student Dashboard</span>
              <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 1.85rem', fontSize: '1rem' }}>
                <span>Create Student Account</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.85rem 1.85rem', fontSize: '1rem' }}>
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Demo Credentials Quick-Access Card */}
      {!isAuthenticated && (
        <section style={{ maxWidth: '850px', margin: '0 auto', width: '100%' }}>
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(30, 27, 75, 0.5))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={20} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Quick One-Click Demo Access</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Pre-configured demo users are available in the local database. Click below to sign in instantly:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div style={{
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Demo Student (Alex)</span>
                  <span className="badge badge-primary">Student</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  student@quizapp.com / StudentPassword123!
                </div>
                <button
                  onClick={() => handleQuickLogin('student@quizapp.com', 'StudentPassword123!')}
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '0.35rem' }}
                >
                  Sign in as Student
                </button>
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Administrator</span>
                  <span className="badge badge-warning">Admin</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  admin@quizapp.com / AdminPassword123!
                </div>
                <button
                  onClick={() => handleQuickLogin('admin@quizapp.com', 'AdminPassword123!')}
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '0.35rem' }}
                >
                  Sign in as Administrator
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Feature Pillars */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Automatic Scoring</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Responses are securely evaluated on the server. Correct answers remain protected until submission is verified.
            </p>
          </div>

          <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart3 size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Visual Score Analytics</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Track score progression trends over time and compare category proficiencies with interactive charts.
            </p>
          </div>

          <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Timed Exam Simulator</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Live countdown timer with real-time question navigation palette and automatic submission when time concludes.
            </p>
          </div>

          <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(168, 85, 247, 0.15)',
              color: 'var(--accent-purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Admin Management Hub</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Administrators can draft, configure question marks, set correct options, and publish validated quizzes seamlessly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
