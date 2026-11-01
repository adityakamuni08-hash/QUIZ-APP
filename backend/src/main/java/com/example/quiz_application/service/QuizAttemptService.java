package com.example.quiz_application.service;

import com.example.quiz_application.dto.attempt.AttemptHistoryDto;
import com.example.quiz_application.dto.attempt.AttemptResultDto;
import com.example.quiz_application.dto.attempt.QuizSubmitRequest;

import java.util.List;

public interface QuizAttemptService {
    AttemptResultDto startAttempt(Long quizId, Long studentId);
    AttemptResultDto submitAttempt(QuizSubmitRequest request, Long studentId);
    AttemptResultDto getAttemptResult(Long attemptId, Long studentId, boolean isAdmin);
    List<AttemptHistoryDto> getStudentAttemptHistory(Long studentId);
    List<AttemptHistoryDto> getQuizAttemptHistoryForAdmin(Long quizId);
}
