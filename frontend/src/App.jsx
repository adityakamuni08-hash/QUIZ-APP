import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import QuizTakePage from './pages/QuizTakePage';
import QuizResultPage from './pages/QuizResultPage';
import AttemptHistoryPage from './pages/AttemptHistoryPage';
import ScoreAnalysisPage from './pages/ScoreAnalysisPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminQuizEditor from './pages/AdminQuizEditor';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Student & Authenticated Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/:id/take"
                element={
                  <ProtectedRoute>
                    <QuizTakePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/result/:attemptId"
                element={
                  <ProtectedRoute>
                    <QuizResultPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <AttemptHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <ScoreAnalysisPage />
                  </ProtectedRoute>
                }
              />

              {/* Administrator Protected Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/create-quiz"
                element={
                  <AdminRoute>
                    <AdminQuizEditor />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/quiz/:id/edit"
                element={
                  <AdminRoute>
                    <AdminQuizEditor />
                  </AdminRoute>
                }
              />

              {/* 404 Not Found Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
