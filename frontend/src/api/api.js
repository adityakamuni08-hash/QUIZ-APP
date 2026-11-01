import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const API_BASE_URL = rawBaseUrl.endsWith('/api')
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/+$/, '')}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if stored
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        // If unauthorized and not already on login page, remove stale credentials
        if (!window.location.pathname.includes('/login')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API Endpoints
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Quiz API Endpoints
export const quizApi = {
  getPublishedQuizzes: (category) => api.get('/quizzes/published', { params: { category } }),
  getQuizForTaking: (id) => api.get(`/quizzes/${id}/take`),
  getAllQuizzes: () => api.get('/quizzes'),
  getQuizById: (id) => api.get(`/quizzes/${id}`),
  createQuiz: (quizData) => api.post('/quizzes', quizData),
  updateQuiz: (id, quizData) => api.put(`/quizzes/${id}`, quizData),
  deleteQuiz: (id) => api.delete(`/quizzes/${id}`),
  togglePublish: (id) => api.patch(`/quizzes/${id}/publish`),
};

// Question API Endpoints
export const questionApi = {
  getQuestionsByQuiz: (quizId) => api.get(`/questions/quiz/${quizId}`),
  addQuestion: (quizId, questionData) => api.post(`/questions/quiz/${quizId}`, questionData),
  updateQuestion: (questionId, questionData) => api.put(`/questions/${questionId}`, questionData),
  deleteQuestion: (questionId) => api.delete(`/questions/${questionId}`),
};

// Attempt API Endpoints
export const attemptApi = {
  startAttempt: (quizId) => api.post(`/attempts/start/${quizId}`),
  submitAttempt: (submissionData) => api.post('/attempts/submit', submissionData),
  getAttemptResult: (attemptId) => api.get(`/attempts/${attemptId}/result`),
  getStudentHistory: () => api.get('/attempts/history'),
  getQuizAttemptsForAdmin: (quizId) => api.get(`/attempts/quiz/${quizId}/admin`),
};

// Analytics API Endpoints
export const analyticsApi = {
  getStudentAnalytics: () => api.get('/analytics/student'),
  getAdminAnalytics: () => api.get('/analytics/admin'),
};

export default api;
