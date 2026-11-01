import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { attemptApi } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import { History, Calendar, CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';

const AttemptHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await attemptApi.getStudentHistory();
      setHistory(res.data || []);
    } catch (err) {
      setError('Unable to load attempt history.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(history.map((h) => h.category).filter(Boolean))];

  const filteredHistory = history.filter(
    (h) => categoryFilter === 'All' || h.category === categoryFilter
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Attempt History</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Review past quiz sessions and monitor score outcomes
          </p>
        </div>

        <Link to="/dashboard" className="btn btn-secondary btn-sm">
          <BookOpen size={16} />
          <span>Browse Quizzes</span>
        </Link>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {/* Filter toolbar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your attempt records..." />
      ) : filteredHistory.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <History size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Attempts Recorded</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem', marginBottom: '1.25rem' }}>
            You haven't completed any quizzes under this category yet.
          </p>
          <Link to="/dashboard" className="btn btn-primary btn-sm">
            Take Your First Quiz
          </Link>
        </div>
      ) : (
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Quiz Title</th>
                <th>Category</th>
                <th>Submitted On</th>
                <th>Score</th>
                <th>Accuracy</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item) => {
                const isPassed = (item.percentage || 0) >= 50.0;
                const formattedDate = item.submittedAt
                  ? new Date(item.submittedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
                  : '—';

                return (
                  <tr key={item.attemptId}>
                    <td style={{ fontWeight: 600 }}>{item.quizTitle}</td>
                    <td>
                      <span className="badge badge-primary">{item.category || 'General'}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {formattedDate}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {item.score} / {item.totalMarks}
                    </td>
                    <td>
                      <span className={`badge ${isPassed ? 'badge-success' : 'badge-danger'}`}>
                        {typeof item.percentage === 'number' ? item.percentage.toFixed(1) : item.percentage}%
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: item.status === 'COMPLETED' ? 'var(--success)' : '#f87171' }}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/quiz/result/${item.attemptId}`}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.3rem 0.65rem' }}
                      >
                        <span>Review</span>
                        <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttemptHistoryPage;
