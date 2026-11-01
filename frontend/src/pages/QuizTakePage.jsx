import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizApi, attemptApi } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import { 
  Clock, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Send, 
  RotateCcw,
  HelpCircle,
  X
} from 'lucide-react';

const QuizTakePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionId }
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const timerRef = useRef(null);
  const selectedAnswersRef = useRef({});

  useEffect(() => {
    initQuizAttempt();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  const initQuizAttempt = async () => {
    setLoading(true);
    setError('');
    try {
      const [quizRes, attemptRes] = await Promise.all([
        quizApi.getQuizForTaking(id),
        attemptApi.startAttempt(id),
      ]);

      const quizData = quizRes.data;
      const attemptData = attemptRes.data;

      setQuiz(quizData);
      setAttemptId(attemptData.attemptId);

      // If attempt is already completed or timed out, navigate to result immediately
      if (attemptData.status === 'COMPLETED' || attemptData.status === 'TIMED_OUT') {
        navigate(`/quiz/result/${attemptData.attemptId}`);
        return;
      }

      // Use durationMinutes from attempt response (authoritative) falling back to quiz data
      const durationMinutes = attemptData.durationMinutes || quizData.durationMinutes || 15;

      // Calculate initial remaining seconds: prefer server-computed remainingSeconds to prevent timezone/clock skew
      let remaining;
      if (typeof attemptData.remainingSeconds === 'number') {
        remaining = attemptData.remainingSeconds;
      } else {
        const rawStarted = attemptData.startedAt || new Date().toISOString();
        const startedIso = (!rawStarted.endsWith('Z') && !rawStarted.includes('+')) ? `${rawStarted}Z` : rawStarted;
        const startedAt = new Date(startedIso).getTime();
        const now = Date.now();
        const elapsedSeconds = Math.max(0, Math.floor((now - startedAt) / 1000));
        const totalSeconds = durationMinutes * 60;
        remaining = Math.max(0, totalSeconds - elapsedSeconds);
      }
      setTimeLeftSeconds(remaining);

      // If time is already up, auto-submit immediately
      if (remaining === 0) {
        handleAutoSubmit(attemptData.attemptId);
        return;
      }

      // Start countdown timer
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit(attemptData.attemptId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to start quiz attempt. Quiz may be unpublished or expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionId) => {
    setSelectedAnswers((prev) => {
      const updated = { ...prev, [questionId]: optionId };
      selectedAnswersRef.current = updated;
      return updated;
    });
  };

  const handleClearAnswer = (questionId) => {
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      selectedAnswersRef.current = copy;
      return copy;
    });
  };

  const handleAutoSubmit = async (attemptIdToSubmit) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Use the ref to get the latest answers, avoiding stale closure from setInterval
      const latestAnswers = selectedAnswersRef.current;
      const answersPayload = Object.entries(latestAnswers).map(([qId, oId]) => ({
        questionId: Number(qId),
        selectedOptionId: Number(oId),
      }));

      await attemptApi.submitAttempt({
        attemptId: attemptIdToSubmit || attemptId,
        answers: answersPayload,
      });

      navigate(`/quiz/result/${attemptIdToSubmit || attemptId}`);
    } catch (err) {
      const targetId = attemptIdToSubmit || attemptId;
      if (targetId && (err.response?.status === 400 || err.response?.status === 409 || err.response?.data?.message?.toLowerCase().includes('already'))) {
        navigate(`/quiz/result/${targetId}`);
        return;
      }
      setError('Time expired and auto-submission encountered an issue: ' + (err.response?.data?.message || err.message));
      setSubmitting(false);
    }
  };

  const handleManualSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setShowConfirmModal(false);

    try {
      const answersPayload = (quiz?.questions || []).map((q) => ({
        questionId: q.id,
        selectedOptionId: selectedAnswers[q.id] || null,
      }));

      const res = await attemptApi.submitAttempt({
        attemptId,
        answers: answersPayload,
      });

      navigate(`/quiz/result/${attemptId}`);
    } catch (err) {
      if (attemptId && (err.response?.status === 400 || err.response?.status === 409 || err.response?.data?.message?.toLowerCase().includes('already'))) {
        navigate(`/quiz/result/${attemptId}`);
        return;
      }
      setError(err.response?.data?.message || 'Failed to submit quiz. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Preparing your quiz session..." />;
  }

  if (error && !quiz) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '2.5rem 1.5rem' }}>
        <AlertTriangle size={42} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Cannot Start Quiz</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const questions = quiz?.questions || [];
  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Format time MM:SS
  const minutes = Math.floor((timeLeftSeconds || 0) / 60);
  const seconds = (timeLeftSeconds || 0) % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isTimeCritical = (timeLeftSeconds || 0) < 120;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header & Sticky Countdown Bar */}
      <div className="card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1rem 1.5rem',
        background: 'rgba(17, 24, 39, 0.95)',
        position: 'sticky',
        top: '68px',
        zIndex: 40
      }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.25rem' }}>{quiz?.category}</span>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{quiz?.title}</h2>
        </div>

        {/* Live Timer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: isTimeCritical ? 'var(--danger-bg)' : 'var(--bg-elevated)',
          border: `1px solid ${isTimeCritical ? 'var(--danger-border)' : 'var(--border-subtle)'}`,
          color: isTimeCritical ? '#f87171' : 'var(--text-primary)',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          fontSize: '1.15rem'
        }}>
          <Clock size={18} className={isTimeCritical ? 'pulse' : ''} />
          <span>{formattedTime}</span>
        </div>

        {/* Finish button */}
        <button
          onClick={() => setShowConfirmModal(true)}
          className="btn btn-primary"
          disabled={submitting}
        >
          <Send size={16} />
          <span>Submit Quiz</span>
        </button>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {/* Main Examination Grid: Question Navigator on Left/Top, Question Card on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {/* Question Interactive Card */}
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Question Index & Marks */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="badge badge-warning">
              {currentQ?.marks || 1} Marks
            </span>
          </div>

          {/* Question Prompt */}
          <div style={{ fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.5, color: 'var(--text-primary)' }}>
            {currentQ?.questionText}
          </div>

          {/* Answer Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {currentQ?.options?.map((opt, idx) => {
              const isSelected = selectedAnswers[currentQ.id] === opt.id;
              const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(currentQ.id, opt.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'var(--primary-light)' : 'var(--bg-input)',
                    border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.825rem',
                    background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: isSelected ? '#fff' : 'var(--text-secondary)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`
                  }}>
                    {optionLetters[idx] || idx + 1}
                  </div>
                  <span style={{ fontSize: '0.95rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isSelected ? 600 : 400 }}>
                    {opt.optionText}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Actions & Question Navigation Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <button
              onClick={() => handleClearAnswer(currentQ.id)}
              className="btn btn-outline btn-sm"
              disabled={!selectedAnswers[currentQ.id]}
              style={{ color: 'var(--text-muted)' }}
            >
              <RotateCcw size={14} />
              <span>Clear Choice</span>
            </button>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="btn btn-secondary"
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="btn btn-secondary"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="btn btn-primary"
                >
                  <span>Finish & Submit</span>
                  <Send size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Question Palette */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Question Navigator
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {questions.map((q, idx) => {
              const isAnswered = !!selectedAnswers[q.id];
              const isCurrent = idx === currentIndex;

              let bg = 'var(--bg-input)';
              let border = 'var(--border-subtle)';
              let color = 'var(--text-secondary)';

              if (isAnswered) {
                bg = 'rgba(16, 185, 129, 0.15)';
                border = 'var(--success-border)';
                color = '#34d399';
              }

              if (isCurrent) {
                border = '2px solid var(--primary)';
                color = '#fff';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    padding: '0.65rem 0',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    background: bg,
                    border: border,
                    color: color,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Progress Summary Legend */}
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Answered:</span>
              <span style={{ fontWeight: 700, color: 'var(--success)' }}>{answeredCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Unanswered:</span>
              <span style={{ fontWeight: 700, color: 'var(--warning)' }}>{unansweredCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Questions:</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{totalQuestions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal Before Final Submission */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 100
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Send size={22} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Submit Your Quiz?</h3>
              </div>
              <button onClick={() => setShowConfirmModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Are you sure you want to finalize your submission? Once submitted, your answers will be automatically evaluated by the server.
            </p>

            <div style={{
              background: 'var(--bg-input)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Answered Questions:</span>
                <span style={{ fontWeight: 700, color: 'var(--success)' }}>{answeredCount} of {totalQuestions}</span>
              </div>
              {unansweredCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171' }}>
                  <span>Unanswered Questions:</span>
                  <span style={{ fontWeight: 700 }}>{unansweredCount}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Continue Quiz
              </button>
              <button
                onClick={handleManualSubmit}
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Evaluating...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizTakePage;
