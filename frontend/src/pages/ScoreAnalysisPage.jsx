import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  BookOpen, 
  Lightbulb, 
  Target 
} from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(17, 24, 39, 0.95)',
        border: '1px solid var(--border-card)',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        fontSize: '0.85rem'
      }}>
        <p style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>{label}</p>
        <p style={{ color: '#818cf8', fontWeight: 600 }}>
          Score: {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

const ScoreAnalysisPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await analyticsApi.getStudentAnalytics();
      setData(res.data);
    } catch (err) {
      setError('Unable to load performance metrics from the server.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Synthesizing score analytics and trajectory charts..." />;
  }

  if (error || !data) {
    return (
      <div className="card" style={{ maxWidth: '550px', margin: '2rem auto', textAlign: 'center', padding: '2.5rem' }}>
        <AlertMessage type="danger" message={error || 'No analytics available.'} />
        <Link to="/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Format trend data for Recharts
  const trendChartData = (data.scoreTrend || []).map((item, idx) => ({
    name: item.quizTitle ? (item.quizTitle.length > 16 ? item.quizTitle.substring(0, 16) + '...' : item.quizTitle) : `Quiz #${idx + 1}`,
    fullTitle: item.quizTitle,
    percentage: item.percentage,
    score: item.score,
    totalMarks: item.totalMarks,
  }));

  // Format category data for Recharts
  const categoryChartData = (data.categoryPerformance || []).map((cat) => ({
    category: cat.category,
    average: cat.averagePercentage,
    attempts: cat.attemptsCount,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Score Analysis & Performance</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Visual representation of your accuracy trends and category strengths
          </p>
        </div>

        <Link to="/dashboard" className="btn btn-secondary btn-sm">
          <BookOpen size={16} />
          <span>Take a Quiz</span>
        </Link>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {/* Primary KPI Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-value">{data.averageScorePercentage ?? 0}%</div>
            <div className="stat-label">Overall Average</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="stat-value">{data.bestScorePercentage ?? 0}%</div>
            <div className="stat-label">Peak Score</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="stat-value">{data.totalPassedQuizzes ?? 0}</div>
            <div className="stat-label">Passed Quizzes (≥50%)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
            <Target size={24} />
          </div>
          <div>
            <div className="stat-value">{data.totalAttempts ?? 0}</div>
            <div className="stat-label">Completed Attempts</div>
          </div>
        </div>
      </div>

      {trendChartData.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <BarChart3 size={42} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Performance Data Yet</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem', marginBottom: '1.25rem' }}>
            Complete at least one quiz to populate real-time visual score analysis and trajectory charts.
          </p>
          <Link to="/dashboard" className="btn btn-primary btn-sm">
            Take Your First Quiz
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem' }}>
          {/* Chart 1: Score Trajectory Over Time */}
          <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Score Progression Over Attempts</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Historical accuracy trend (%) across completed quiz sessions
            </p>

            <div style={{ width: '100%', height: '280px', marginTop: '0.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="percentage"
                    stroke="#818cf8"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                    dot={{ r: 4, fill: '#6366f1' }}
                    activeDot={{ r: 6, fill: '#ffffff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Category Proficiency Breakdown */}
          <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} style={{ color: 'var(--accent-cyan)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Category Proficiency Comparison</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Average accuracy (%) achieved across distinct knowledge domains
            </p>

            <div style={{ width: '100%', height: '280px', marginTop: '0.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="average" fill="#06b6d4" radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Actionable Insights / Recommendation Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.5), rgba(17, 24, 39, 0.85))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        padding: '1.5rem'
      }}>
        <div style={{
          background: 'rgba(99, 102, 241, 0.2)',
          color: 'var(--primary)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)'
        }}>
          <Lightbulb size={24} />
        </div>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            Personalized Performance Insight
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {(data.averageScorePercentage || 0) >= 75
              ? 'Excellent mastery! You have demonstrated high accuracy across your attempts. Consider attempting longer exams to test endurance.'
              : (data.averageScorePercentage || 0) >= 50
              ? 'Solid progression! You are meeting benchmark passing criteria. Review questions you marked incorrectly to push your score above 80%.'
              : 'Keep practicing! Review incorrect answers in the attempt history to identify specific concepts needing revision before retaking quizzes.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScoreAnalysisPage;
