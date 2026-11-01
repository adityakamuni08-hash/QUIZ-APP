import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizApi, analyticsApi } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import { 
  ShieldCheck, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Globe, 
  EyeOff, 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp,
  Clock
} from 'lucide-react';

const AdminDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [quizzesRes, analyticsRes] = await Promise.all([
        quizApi.getAllQuizzes(),
        analyticsApi.getAdminAnalytics().catch(() => ({ data: null })),
      ]);
      setQuizzes(quizzesRes.data || []);
      if (analyticsRes?.data) {
        setAnalytics(analyticsRes.data);
      }
    } catch (err) {
      setError('Unable to load administrator records.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id, currentPublished) => {
    try {
      const res = await quizApi.togglePublish(id);
      setQuizzes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, published: res.data.published } : q))
      );
      setSuccess(`Quiz is now ${res.data.published ? 'Published' : 'Unpublished (Draft)'}.`);
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quiz publication status.');
      setTimeout(() => setError(''), 4500);
    }
  };

  const handleDeleteQuiz = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await quizApi.deleteQuiz(id);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
      setSuccess(`Quiz "${title}" deleted successfully.`);
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete quiz.');
      setTimeout(() => setError(''), 4500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Admin Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <ShieldCheck size={18} style={{ color: '#a855f7' }} />
            <span style={{ fontSize: '0.85rem', color: '#c084fc', fontWeight: 600 }}>Administrator Portal</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Quiz Management Hub</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Configure assessments, manage question banks, and monitor platform metrics
          </p>
        </div>

        <Link to="/admin/create-quiz" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Create New Quiz</span>
        </Link>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {/* Admin Platform Metrics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div className="stat-value">{analytics?.totalQuizzes ?? quizzes.length}</div>
            <div className="stat-label">Total Quizzes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
            <Globe size={24} />
          </div>
          <div>
            <div className="stat-value">{analytics?.publishedQuizzes ?? quizzes.filter(q => q.published).length}</div>
            <div className="stat-label">Published Quizzes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{analytics?.totalStudents ?? 0}</div>
            <div className="stat-label">Registered Students</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-value">{analytics?.platformAverageScore ?? 0}%</div>
            <div className="stat-label">Platform Average Score</div>
          </div>
        </div>
      </div>

      {/* Quizzes Table */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>All System Quizzes</h2>

        {loading ? (
          <LoadingSpinner message="Fetching quizzes..." />
        ) : quizzes.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <BookOpen size={42} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Quizzes Found</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem', marginBottom: '1.25rem' }}>
              Create your first quiz with questions and multiple-choice answer options.
            </p>
            <Link to="/admin/create-quiz" className="btn btn-primary btn-sm">
              <PlusCircle size={16} />
              <span>Create Quiz</span>
            </Link>
          </div>
        ) : (
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Questions</th>
                  <th>Marks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz.id}>
                    <td style={{ fontWeight: 600 }}>{quiz.title}</td>
                    <td>
                      <span className="badge badge-primary">{quiz.category || 'General'}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {quiz.durationMinutes} mins
                    </td>
                    <td style={{ fontWeight: 600 }}>{quiz.questionCount || 0}</td>
                    <td style={{ fontWeight: 600 }}>{quiz.totalMarks}</td>
                    <td>
                      <button
                        onClick={() => handleTogglePublish(quiz.id, quiz.published)}
                        className={`badge ${quiz.published ? 'badge-success' : 'badge-warning'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to toggle publication"
                      >
                        {quiz.published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                          to={`/admin/quiz/${quiz.id}/edit`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.65rem' }}
                          title="Edit Quiz & Questions"
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.35rem 0.65rem' }}
                          title="Delete Quiz"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
