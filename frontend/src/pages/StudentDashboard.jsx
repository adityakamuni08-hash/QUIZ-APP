import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizApi, analyticsApi } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import { 
  BookOpen, 
  Clock, 
  Award, 
  HelpCircle, 
  Search, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle, 
  Sparkles,
  BarChart2
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [selectedCategory]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [quizzesRes, analyticsRes] = await Promise.all([
        quizApi.getPublishedQuizzes(selectedCategory === 'All' ? null : selectedCategory),
        analyticsApi.getStudentAnalytics().catch(() => ({ data: null })),
      ]);
      setQuizzes(quizzesRes.data || []);
      if (analyticsRes?.data) {
        setAnalytics(analyticsRes.data);
      }
    } catch (err) {
      setError('Unable to load quizzes from the server. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(quizzes.map((q) => q.category).filter(Boolean))];

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.description && q.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.75rem',
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7), rgba(17, 24, 39, 0.95))',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#a5b4fc', fontWeight: 600 }}>Welcome back,</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{user?.name}</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Select an assessment below to test your subject comprehension.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/analytics" className="btn btn-outline btn-sm">
            <BarChart2 size={16} />
            <span>Score Insights</span>
          </Link>
          <Link to="/history" className="btn btn-secondary btn-sm">
            <span>Attempt History</span>
          </Link>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="stat-value">{analytics?.totalAttempts ?? 0}</div>
            <div className="stat-label">Quizzes Completed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-value">{analytics?.averageScorePercentage ?? 0}%</div>
            <div className="stat-label">Average Accuracy</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="stat-value">{analytics?.bestScorePercentage ?? 0}%</div>
            <div className="stat-label">Peak Score</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div className="stat-value">{quizzes.length}</div>
            <div className="stat-label">Available Quizzes</div>
          </div>
        </div>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {/* Quizzes Filter and Search Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.4rem', paddingRight: '0.75rem', height: '38px', fontSize: '0.85rem' }}
          />
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Quizzes List */}
      {loading ? (
        <LoadingSpinner message="Loading available quizzes..." />
      ) : filteredQuizzes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <HelpCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Quizzes Available</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {searchQuery ? 'No quizzes match your search filter.' : 'Check back shortly or switch categories.'}
          </p>
        </div>
      ) : (
        <div className="quiz-grid">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="card card-hover" style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1.5rem',
              gap: '1.25rem'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span className="badge badge-primary">{quiz.category || 'General'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <Clock size={14} />
                    <span>{quiz.durationMinutes} mins</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3 }}>
                  {quiz.title}
                </h3>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {quiz.description || 'Comprehensive assessment covering core domain questions.'}
                </p>
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)'
                }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{quiz.questionCount || 0}</span> Questions
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{quiz.totalMarks}</span> Total Marks
                  </div>
                </div>

                <Link
                  to={`/quiz/${quiz.id}/take`}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.65rem' }}
                >
                  <span>Start Quiz</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
