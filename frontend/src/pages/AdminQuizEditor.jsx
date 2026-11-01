import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quizApi } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';

const AdminQuizEditor = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Java');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [published, setPublished] = useState(false);

  const [questions, setQuestions] = useState([
    {
      id: null,
      questionText: '',
      marks: 10,
      options: [
        { optionText: '', correct: true },
        { optionText: '', correct: false },
        { optionText: '', correct: false },
        { optionText: '', correct: false },
      ],
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadQuizDetails();
    }
  }, [id]);

  const loadQuizDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await quizApi.getQuizById(id);
      const q = res.data;
      setTitle(q.title || '');
      setDescription(q.description || '');
      setCategory(q.category || 'General');
      setDurationMinutes(q.durationMinutes || 15);
      setPublished(q.published || false);

      if (q.questions && q.questions.length > 0) {
        setQuestions(
          q.questions.map((ques) => ({
            id: ques.id,
            questionText: ques.questionText,
            marks: ques.marks || 10,
            options: ques.options?.map((opt) => ({
              id: opt.id,
              optionText: opt.optionText,
              correct: opt.correct || false,
            })) || [],
          }))
        );
      }
    } catch (err) {
      setError('Unable to load quiz details for editing.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: null,
        questionText: '',
        marks: 10,
        options: [
          { optionText: '', correct: true },
          { optionText: '', correct: false },
          { optionText: '', correct: false },
          { optionText: '', correct: false },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (qIndex) => {
    if (questions.length <= 1) {
      setError('A quiz should have at least one question.');
      return;
    }
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIndex));
  };

  const handleQuestionChange = (qIndex, field, value) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex] = { ...copy[qIndex], [field]: value };
      return copy;
    });
  };

  const handleOptionChange = (qIndex, oIndex, field, value) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const qCopy = { ...copy[qIndex] };
      const optsCopy = [...qCopy.options];

      if (field === 'correct') {
        // Only one option can be marked correct per question
        optsCopy.forEach((opt, idx) => {
          optsCopy[idx] = { ...opt, correct: idx === oIndex };
        });
      } else {
        optsCopy[oIndex] = { ...optsCopy[oIndex], [field]: value };
      }

      qCopy.options = optsCopy;
      copy[qIndex] = qCopy;
      return copy;
    });
  };

  const handleAddOption = (qIndex) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const qCopy = { ...copy[qIndex] };
      if (qCopy.options.length >= 6) return copy;
      qCopy.options = [...qCopy.options, { optionText: '', correct: false }];
      copy[qIndex] = qCopy;
      return copy;
    });
  };

  const handleRemoveOption = (qIndex, oIndex) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const qCopy = { ...copy[qIndex] };
      if (qCopy.options.length <= 2) {
        setError('Each question must have at least 2 options.');
        return copy;
      }
      qCopy.options = qCopy.options.filter((_, idx) => idx !== oIndex);
      // Ensure at least one is correct
      if (!qCopy.options.some((o) => o.correct) && qCopy.options.length > 0) {
        qCopy.options[0].correct = true;
      }
      copy[qIndex] = qCopy;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!title.trim()) {
      setError('Quiz title is required.');
      return;
    }

    if (durationMinutes < 1) {
      setError('Duration must be at least 1 minute.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Question #${i + 1} text cannot be blank.`);
        return;
      }
      if (q.options.length < 2) {
        setError(`Question #${i + 1} must have at least 2 options.`);
        return;
      }
      const hasCorrect = q.options.some((o) => o.correct);
      if (!hasCorrect) {
        setError(`Question #${i + 1} must have a designated correct option.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].optionText.trim()) {
          setError(`Question #${i + 1}, Option #${j + 1} text cannot be empty.`);
          return;
        }
      }
    }

    setSaving(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      durationMinutes: Number(durationMinutes),
      published,
      questions: questions.map((q, idx) => ({
        id: q.id,
        questionText: q.questionText.trim(),
        marks: Number(q.marks) || 1,
        questionOrder: idx + 1,
        options: q.options.map((o, oIdx) => ({
          id: o.id,
          optionText: o.optionText.trim(),
          optionOrder: oIdx + 1,
          correct: o.correct,
        })),
      })),
    };

    try {
      if (isEditing) {
        await quizApi.updateQuiz(id, payload);
        setSuccess('Quiz updated successfully!');
      } else {
        await quizApi.createQuiz(payload);
        setSuccess('Quiz created successfully!');
      }
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save quiz configuration.');
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading quiz details..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '960px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
            <ArrowLeft size={16} />
            <span>Back to Admin Hub</span>
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {isEditing ? 'Edit Quiz & Questions' : 'Create New Assessment'}
          </h1>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="btn btn-primary"
          disabled={saving}
        >
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save Quiz'}</span>
        </button>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Core Quiz Details Card */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>General Information</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Quiz Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Data Structures & Algorithms"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Java, Python, Database, DevOps"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Time Limit (Minutes) *</label>
              <input
                type="number"
                min="1"
                max="180"
                className="form-input"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label className="form-label">Publishing Status</label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: published ? '#34d399' : 'var(--text-secondary)'
              }}>
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--success)' }}
                />
                <span>Publish Immediately (Available to Students)</span>
              </label>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows="3"
              placeholder="Brief summary outlining what topics or skills this quiz tests..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Question Bank Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Questions ({questions.length})</h2>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="btn btn-secondary btn-sm"
            >
              <Plus size={16} />
              <span>Add Question</span>
            </button>
          </div>

          {questions.map((q, qIndex) => (
            <div
              key={qIndex}
              className="card"
              style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              {/* Question Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>
                  Question #{qIndex + 1}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Marks:</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      style={{ width: '70px', padding: '0.35rem 0.5rem', height: '32px' }}
                      value={q.marks}
                      onChange={(e) => handleQuestionChange(qIndex, 'marks', e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="btn btn-danger btn-sm"
                    title="Delete Question"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Question Text *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter the question prompt..."
                  value={q.questionText}
                  onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                  required
                />
              </div>

              {/* Options Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Answer Options (Select the radio button for the correct answer)
                </label>

                {q.options.map((opt, oIndex) => (
                  <div
                    key={oIndex}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      background: opt.correct ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-input)',
                      border: `1px solid ${opt.correct ? 'var(--success-border)' : 'var(--border-subtle)'}`,
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    {/* Radio Button for designating the correct answer */}
                    <input
                      type="radio"
                      name={`correct_opt_${qIndex}`}
                      checked={opt.correct}
                      onChange={() => handleOptionChange(qIndex, oIndex, 'correct', true)}
                      title="Mark as correct answer"
                      style={{ width: '18px', height: '18px', accentColor: 'var(--success)', cursor: 'pointer' }}
                    />

                    <input
                      type="text"
                      className="form-input"
                      placeholder={`Option ${oIndex + 1} text...`}
                      value={opt.optionText}
                      onChange={(e) => handleOptionChange(qIndex, oIndex, 'optionText', e.target.value)}
                      style={{ height: '36px', border: 'none', background: 'transparent' }}
                      required
                    />

                    {opt.correct && (
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                        Correct
                      </span>
                    )}

                    {q.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(qIndex, oIndex)}
                        style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
                        title="Remove Option"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}

                {q.options.length < 6 && (
                  <button
                    type="button"
                    onClick={() => handleAddOption(qIndex)}
                    className="btn btn-outline btn-sm"
                    style={{ alignSelf: 'flex-start', marginTop: '0.35rem' }}
                  >
                    <Plus size={14} />
                    <span>Add Option</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddQuestion}
            className="btn btn-secondary"
            style={{ padding: '0.85rem', borderStyle: 'dashed' }}
          >
            <Plus size={18} />
            <span>Add Another Question</span>
          </button>
        </div>

        {/* Footer save buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ padding: '0.75rem 2rem' }}
          >
            <Save size={18} />
            <span>{saving ? 'Saving...' : 'Save & Finish'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminQuizEditor;
