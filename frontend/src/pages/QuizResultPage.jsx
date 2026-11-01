import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { attemptApi } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  MinusCircle, 
  BarChart3, 
  RotateCcw, 
  Clock, 
  BookOpen,
  ArrowRight
} from 'lucide-react';

const QuizResultPage = () => {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResult();
  }, [attemptId]);

  const loadResult = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await attemptApi.getAttemptResult(attemptId);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to retrieve quiz evaluation results.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving your evaluation report..." />;
  }

  if (error || !result) {
    return (
      <div className="card" style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'center', padding: '2.5rem' }}>
        <AlertMessage type="danger" message={error || 'Result not found.'} />
        <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isPassed = (result.percentage || 0) >= 50.0;
  const formattedDate = result.submittedAt
    ? new Date(result.submittedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : 'Recently';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Top Banner & Main Score Card */}
      <div className="card" style={{
        padding: '2.5rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(30, 27, 75, 0.8))',
        border: `1px solid ${isPassed ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
        boxShadow: isPassed ? '0 0 25px rgba(16, 185, 129, 0.15)' : '0 0 25px rgba(239, 68, 68, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <span className="badge badge-primary">{result.category || 'General'}</span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{result.quizTitle}</h1>

        <div style={{
          width: '130px',
          height: '130px',
          borderRadius: '50%',
          border: `5px solid ${isPassed ? 'var(--success)' : 'var(--danger)'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0.75rem 0',
          background: isPassed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
        }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{result.percentage}%</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '0.25rem' }}>
            {isPassed ? 'Passed' : 'Needs Work'}
          </span>
        </div>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          {isPassed
            ? 'Commendable performance! You demonstrated sound grasp of the evaluated concepts.'
            : 'Review the detailed question analysis below to target areas for improvement.'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <Clock size={14} />
          <span>Evaluated on {formattedDate}</span>
        </div>
      </div>

      {/* Numerical Metrics Summary */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="stat-value">{result.score} / {result.totalMarks}</div>
            <div className="stat-label">Marks Obtained</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="stat-value">{result.correctAnswersCount}</div>
            <div className="stat-label">Correct Answers</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--danger-bg)', color: '#f87171' }}>
            <XCircle size={24} />
          </div>
          <div>
            <div className="stat-value">{result.incorrectAnswersCount}</div>
            <div className="stat-label">Incorrect Answers</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: '#fbbf24' }}>
            <MinusCircle size={24} />
          </div>
          <div>
            <div className="stat-value">{result.unansweredCount}</div>
            <div className="stat-label">Unanswered</div>
          </div>
        </div>
      </div>

      {/* Navigation Quick Actions */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/analytics" className="btn btn-primary">
          <BarChart3 size={16} />
          <span>View Performance Analytics</span>
        </Link>
        <Link to="/dashboard" className="btn btn-secondary">
          <BookOpen size={16} />
          <span>Take Another Quiz</span>
        </Link>
        <Link to="/history" className="btn btn-outline">
          <span>Attempt History</span>
        </Link>
      </div>

      {/* Detailed Question Review */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Question-by-Question Breakdown</h2>

        {result.questionResults?.map((qr, index) => {
          let borderColor = 'var(--border-subtle)';
          let statusBadge = <span className="badge badge-warning">Unanswered</span>;

          if (qr.correct) {
            borderColor = 'rgba(16, 185, 129, 0.4)';
            statusBadge = <span className="badge badge-success">Correct (+{qr.awardedMarks})</span>;
          } else if (!qr.unanswered) {
            borderColor = 'rgba(239, 68, 68, 0.4)';
            statusBadge = <span className="badge badge-danger">Incorrect (0)</span>;
          }

          return (
            <div
              key={qr.questionId || index}
              className="card"
              style={{
                border: `1.5px solid ${borderColor}`,
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Question {index + 1}
                </span>
                {statusBadge}
              </div>

              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {qr.questionText}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '0.85rem',
                fontSize: '0.875rem'
              }}>
                <div style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: qr.correct ? 'var(--success-bg)' : qr.unanswered ? 'var(--bg-input)' : 'var(--danger-bg)',
                  border: `1px solid ${qr.correct ? 'var(--success-border)' : qr.unanswered ? 'var(--border-subtle)' : 'var(--danger-border)'}`
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Your Selection:
                  </div>
                  <div style={{ fontWeight: 600, color: qr.correct ? '#34d399' : qr.unanswered ? 'var(--text-muted)' : '#f87171' }}>
                    {qr.selectedOptionText}
                  </div>
                </div>

                {!qr.correct && (
                  <div style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--success-bg)',
                    border: '1px solid var(--success-border)'
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Correct Answer:
                    </div>
                    <div style={{ fontWeight: 600, color: '#34d399' }}>
                      {qr.correctOptionText}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizResultPage;
