package com.example.quiz_application.service;

import com.example.quiz_application.dto.quiz.QuestionDto;

import java.util.List;

public interface QuestionService {
    QuestionDto addQuestion(Long quizId, QuestionDto dto);
    QuestionDto updateQuestion(Long questionId, QuestionDto dto);
    void deleteQuestion(Long questionId);
    List<QuestionDto> getQuestionsByQuizId(Long quizId);
}
