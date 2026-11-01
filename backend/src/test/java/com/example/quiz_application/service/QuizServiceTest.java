package com.example.quiz_application.service;

import com.example.quiz_application.dto.quiz.OptionDto;
import com.example.quiz_application.dto.quiz.QuestionDto;
import com.example.quiz_application.dto.quiz.QuizCreateDto;
import com.example.quiz_application.dto.quiz.QuizResponseDto;
import com.example.quiz_application.entity.Quiz;
import com.example.quiz_application.exception.BadRequestException;
import com.example.quiz_application.repository.QuizRepository;
import com.example.quiz_application.service.impl.QuizServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuizServiceTest {

    @Mock
    private QuizRepository quizRepository;

    @InjectMocks
    private QuizServiceImpl quizService;

    @Test
    @DisplayName("Should create quiz and compute total marks from questions")
    void testCreateQuiz_ComputesMarks() {
        QuestionDto q1 = QuestionDto.builder()
                .questionText("Question 1?")
                .marks(5)
                .options(List.of(
                        OptionDto.builder().optionText("A").correct(true).build(),
                        OptionDto.builder().optionText("B").correct(false).build()
                ))
                .build();

        QuizCreateDto createDto = QuizCreateDto.builder()
                .title("Sample Quiz")
                .description("Sample Desc")
                .category("Java")
                .durationMinutes(20)
                .published(false)
                .questions(List.of(q1))
                .build();

        when(quizRepository.save(any(Quiz.class))).thenAnswer(invocation -> {
            Quiz q = invocation.getArgument(0);
            q.setId(100L);
            return q;
        });

        QuizResponseDto response = quizService.createQuiz(createDto);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("Sample Quiz", response.getTitle());
        assertEquals(5, response.getTotalMarks());
    }

    @Test
    @DisplayName("Should throw BadRequestException when publishing quiz with no questions")
    void testCreateQuiz_PublishWithNoQuestions_ThrowsException() {
        QuizCreateDto createDto = QuizCreateDto.builder()
                .title("Empty Quiz")
                .durationMinutes(10)
                .published(true)
                .questions(List.of())
                .build();

        assertThrows(BadRequestException.class, () -> quizService.createQuiz(createDto));
        verify(quizRepository, never()).save(any(Quiz.class));
    }
}
