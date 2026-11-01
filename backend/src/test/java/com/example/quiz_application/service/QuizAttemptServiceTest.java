package com.example.quiz_application.service;

import com.example.quiz_application.dto.attempt.AnswerSubmissionDto;
import com.example.quiz_application.dto.attempt.AttemptResultDto;
import com.example.quiz_application.dto.attempt.QuizSubmitRequest;
import com.example.quiz_application.entity.*;
import com.example.quiz_application.exception.BadRequestException;
import com.example.quiz_application.exception.UnauthorizedException;
import com.example.quiz_application.repository.*;
import com.example.quiz_application.service.impl.QuizAttemptServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuizAttemptServiceTest {

    @Mock
    private QuizAttemptRepository attemptRepository;
    @Mock
    private QuizRepository quizRepository;
    @Mock
    private QuestionRepository questionRepository;
    @Mock
    private AnswerOptionRepository optionRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private SubmittedAnswerRepository submittedAnswerRepository;

    @InjectMocks
    private QuizAttemptServiceImpl quizAttemptService;

    private User student;
    private Quiz quiz;
    private Question q1;
    private AnswerOption opt1Correct;
    private AnswerOption opt2Wrong;

    @BeforeEach
    void setUp() {
        student = User.builder()
                .id(1L)
                .name("Test Student")
                .email("student@test.com")
                .password("encoded_pass")
                .role(Role.ROLE_STUDENT)
                .build();

        quiz = Quiz.builder()
                .id(10L)
                .title("Java Basics")
                .durationMinutes(15)
                .totalMarks(10)
                .published(true)
                .questions(new ArrayList<>())
                .build();

        opt1Correct = AnswerOption.builder().id(101L).optionText("Correct Option").correct(true).build();
        opt2Wrong = AnswerOption.builder().id(102L).optionText("Wrong Option").correct(false).build();

        q1 = Question.builder()
                .id(50L)
                .quiz(quiz)
                .questionText("Sample Question?")
                .marks(10)
                .options(List.of(opt1Correct, opt2Wrong))
                .build();

        quiz.getQuestions().add(q1);
    }

    @Test
    @DisplayName("Should successfully start an attempt for published quiz")
    void testStartAttempt_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(student));
        when(quizRepository.findById(10L)).thenReturn(Optional.of(quiz));
        when(attemptRepository.findActiveAttempts(1L, 10L, AttemptStatus.IN_PROGRESS)).thenReturn(List.of());

        QuizAttempt saved = QuizAttempt.builder()
                .id(200L)
                .student(student)
                .quiz(quiz)
                .startedAt(LocalDateTime.now())
                .status(AttemptStatus.IN_PROGRESS)
                .score(0)
                .totalMarks(10)
                .percentage(0.0)
                .build();

        when(attemptRepository.save(any(QuizAttempt.class))).thenReturn(saved);

        AttemptResultDto result = quizAttemptService.startAttempt(10L, 1L);

        assertNotNull(result);
        assertEquals(200L, result.getAttemptId());
        assertEquals("Java Basics", result.getQuizTitle());
        assertEquals(AttemptStatus.IN_PROGRESS, result.getStatus());
    }

    @Test
    @DisplayName("Should reject starting attempt for unpublished quiz")
    void testStartAttempt_Unpublished_ThrowsException() {
        quiz.setPublished(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(student));
        when(quizRepository.findById(10L)).thenReturn(Optional.of(quiz));

        assertThrows(BadRequestException.class, () -> quizAttemptService.startAttempt(10L, 1L));
    }

    @Test
    @DisplayName("Should accurately calculate score on submission")
    void testSubmitAttempt_CorrectCalculation() {
        QuizAttempt attempt = QuizAttempt.builder()
                .id(200L)
                .student(student)
                .quiz(quiz)
                .startedAt(LocalDateTime.now().minusMinutes(5))
                .status(AttemptStatus.IN_PROGRESS)
                .score(0)
                .totalMarks(10)
                .percentage(0.0)
                .build();

        when(attemptRepository.findById(200L)).thenReturn(Optional.of(attempt));
        when(questionRepository.findByQuizIdOrderByQuestionOrderAsc(10L)).thenReturn(List.of(q1));
        when(attemptRepository.save(any(QuizAttempt.class))).thenAnswer(i -> i.getArguments()[0]);

        QuizSubmitRequest submitRequest = QuizSubmitRequest.builder()
                .attemptId(200L)
                .answers(List.of(
                        AnswerSubmissionDto.builder().questionId(50L).selectedOptionId(101L).build()
                ))
                .build();

        AttemptResultDto result = quizAttemptService.submitAttempt(submitRequest, 1L);

        assertNotNull(result);
        assertEquals(10, result.getScore());
        assertEquals(10, result.getTotalMarks());
        assertEquals(100.0, result.getPercentage());
        assertEquals(AttemptStatus.COMPLETED, result.getStatus());
        assertEquals(1, result.getCorrectAnswersCount());
        assertEquals(0, result.getIncorrectAnswersCount());
        assertEquals(0, result.getUnansweredCount());
    }

    @Test
    @DisplayName("Should award 0 marks when incorrect answer is selected")
    void testSubmitAttempt_IncorrectAnswer() {
        QuizAttempt attempt = QuizAttempt.builder()
                .id(200L)
                .student(student)
                .quiz(quiz)
                .startedAt(LocalDateTime.now().minusMinutes(5))
                .status(AttemptStatus.IN_PROGRESS)
                .score(0)
                .totalMarks(10)
                .percentage(0.0)
                .build();

        when(attemptRepository.findById(200L)).thenReturn(Optional.of(attempt));
        when(questionRepository.findByQuizIdOrderByQuestionOrderAsc(10L)).thenReturn(List.of(q1));
        when(attemptRepository.save(any(QuizAttempt.class))).thenAnswer(i -> i.getArguments()[0]);

        QuizSubmitRequest submitRequest = QuizSubmitRequest.builder()
                .attemptId(200L)
                .answers(List.of(
                        AnswerSubmissionDto.builder().questionId(50L).selectedOptionId(102L).build()
                ))
                .build();

        AttemptResultDto result = quizAttemptService.submitAttempt(submitRequest, 1L);

        assertNotNull(result);
        assertEquals(0, result.getScore());
        assertEquals(0.0, result.getPercentage());
        assertEquals(0, result.getCorrectAnswersCount());
        assertEquals(1, result.getIncorrectAnswersCount());
    }

    @Test
    @DisplayName("Should prevent unauthorized submission from different student")
    void testSubmitAttempt_UnauthorizedStudent() {
        QuizAttempt attempt = QuizAttempt.builder()
                .id(200L)
                .student(student) // student.getId() == 1L
                .quiz(quiz)
                .startedAt(LocalDateTime.now().minusMinutes(5))
                .status(AttemptStatus.IN_PROGRESS)
                .build();

        when(attemptRepository.findById(200L)).thenReturn(Optional.of(attempt));

        QuizSubmitRequest submitRequest = QuizSubmitRequest.builder().attemptId(200L).build();

        assertThrows(UnauthorizedException.class, () -> quizAttemptService.submitAttempt(submitRequest, 999L));
    }
}
