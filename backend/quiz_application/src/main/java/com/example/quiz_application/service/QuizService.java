package com.example.quiz_application.service;

import com.example.quiz_application.dto.quiz.QuizCreateDto;
import com.example.quiz_application.dto.quiz.QuizResponseDto;
import com.example.quiz_application.dto.quiz.QuizStudentDto;

import java.util.List;

public interface QuizService {
    QuizResponseDto createQuiz(QuizCreateDto dto);
    QuizResponseDto updateQuiz(Long id, QuizCreateDto dto);
    void deleteQuiz(Long id);
    QuizResponseDto getQuizById(Long id);
    QuizStudentDto getQuizForStudent(Long id);
    List<QuizResponseDto> getAllQuizzes();
    List<QuizResponseDto> getPublishedQuizzes(String category);
    QuizResponseDto togglePublish(Long id);
}
