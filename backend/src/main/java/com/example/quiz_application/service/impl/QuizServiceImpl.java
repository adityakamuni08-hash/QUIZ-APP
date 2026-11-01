package com.example.quiz_application.service.impl;

import com.example.quiz_application.dto.quiz.*;
import com.example.quiz_application.entity.AnswerOption;
import com.example.quiz_application.entity.Question;
import com.example.quiz_application.entity.Quiz;
import com.example.quiz_application.exception.BadRequestException;
import com.example.quiz_application.exception.ResourceNotFoundException;
import com.example.quiz_application.repository.QuizRepository;
import com.example.quiz_application.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;

    @Override
    @Transactional
    public QuizResponseDto createQuiz(QuizCreateDto dto) {
        Quiz quiz = Quiz.builder()
                .title(dto.getTitle().trim())
                .description(dto.getDescription())
                .category(dto.getCategory() != null ? dto.getCategory().trim() : "General")
                .durationMinutes(dto.getDurationMinutes())
                .totalMarks(0)
                .published(dto.isPublished())
                .build();

        if (dto.getQuestions() != null && !dto.getQuestions().isEmpty()) {
            int calculatedMarks = 0;
            for (int i = 0; i < dto.getQuestions().size(); i++) {
                QuestionDto qDto = dto.getQuestions().get(i);
                Question question = Question.builder()
                        .questionText(qDto.getQuestionText().trim())
                        .marks(qDto.getMarks() != null ? qDto.getMarks() : 1)
                        .questionOrder(qDto.getQuestionOrder() != null ? qDto.getQuestionOrder() : i + 1)
                        .build();

                calculatedMarks += question.getMarks();

                if (qDto.getOptions() != null) {
                    for (int j = 0; j < qDto.getOptions().size(); j++) {
                        OptionDto oDto = qDto.getOptions().get(j);
                        AnswerOption option = AnswerOption.builder()
                                .optionText(oDto.getOptionText().trim())
                                .optionOrder(oDto.getOptionOrder() != null ? oDto.getOptionOrder() : j + 1)
                                .correct(oDto.isCorrect())
                                .build();
                        question.addOption(option);
                    }
                }
                quiz.addQuestion(question);
            }
            quiz.setTotalMarks(calculatedMarks);
        } else if (dto.getTotalMarks() != null) {
            quiz.setTotalMarks(dto.getTotalMarks());
        }

        if (quiz.isPublished()) {
            validateQuizForPublish(quiz);
        }

        Quiz savedQuiz = quizRepository.save(quiz);
        return mapToResponseDto(savedQuiz, true);
    }

    @Override
    @Transactional
    public QuizResponseDto updateQuiz(Long id, QuizCreateDto dto) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));

        quiz.setTitle(dto.getTitle().trim());
        quiz.setDescription(dto.getDescription());
        quiz.setCategory(dto.getCategory() != null ? dto.getCategory().trim() : "General");
        quiz.setDurationMinutes(dto.getDurationMinutes());
        quiz.setPublished(dto.isPublished());

        // If questions are included in the update payload, replace them and recalculate marks
        if (dto.getQuestions() != null && !dto.getQuestions().isEmpty()) {
            quiz.getQuestions().clear();
            int calculatedMarks = 0;
            for (int i = 0; i < dto.getQuestions().size(); i++) {
                QuestionDto qDto = dto.getQuestions().get(i);
                Question question = Question.builder()
                        .questionText(qDto.getQuestionText().trim())
                        .marks(qDto.getMarks() != null ? qDto.getMarks() : 1)
                        .questionOrder(qDto.getQuestionOrder() != null ? qDto.getQuestionOrder() : i + 1)
                        .build();

                calculatedMarks += question.getMarks();

                if (qDto.getOptions() != null) {
                    for (int j = 0; j < qDto.getOptions().size(); j++) {
                        OptionDto oDto = qDto.getOptions().get(j);
                        AnswerOption option = AnswerOption.builder()
                                .optionText(oDto.getOptionText().trim())
                                .optionOrder(oDto.getOptionOrder() != null ? oDto.getOptionOrder() : j + 1)
                                .correct(oDto.isCorrect())
                                .build();
                        question.addOption(option);
                    }
                }
                quiz.addQuestion(question);
            }
            quiz.setTotalMarks(calculatedMarks);
        }

        if (quiz.isPublished()) {
            validateQuizForPublish(quiz);
        }

        Quiz updatedQuiz = quizRepository.save(quiz);
        return mapToResponseDto(updatedQuiz, true);
    }

    @Override
    @Transactional
    public void deleteQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));
        quizRepository.delete(quiz);
    }

    @Override
    @Transactional(readOnly = true)
    public QuizResponseDto getQuizById(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));
        return mapToResponseDto(quiz, true);
    }

    @Override
    @Transactional(readOnly = true)
    public QuizStudentDto getQuizForStudent(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));

        if (!quiz.isPublished()) {
            throw new BadRequestException("This quiz is not currently published.");
        }

        List<QuestionStudentDto> questionDtos = quiz.getQuestions().stream()
                .map(q -> QuestionStudentDto.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .marks(q.getMarks())
                        .questionOrder(q.getQuestionOrder())
                        .options(q.getOptions().stream()
                                .map(o -> OptionStudentDto.builder()
                                        .id(o.getId())
                                        .optionText(o.getOptionText())
                                        .optionOrder(o.getOptionOrder())
                                        .build()
                                ).collect(Collectors.toList())
                        )
                        .build()
                ).collect(Collectors.toList());

        return QuizStudentDto.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .category(quiz.getCategory())
                .durationMinutes(quiz.getDurationMinutes())
                .totalMarks(quiz.getTotalMarks())
                .questionCount(questionDtos.size())
                .questions(questionDtos)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizResponseDto> getAllQuizzes() {
        return quizRepository.findAll().stream()
                .map(q -> mapToResponseDto(q, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizResponseDto> getPublishedQuizzes(String category) {
        List<Quiz> quizzes;
        if (category != null && !category.trim().isEmpty() && !"all".equalsIgnoreCase(category)) {
            quizzes = quizRepository.findByPublishedTrueAndCategoryIgnoreCase(category.trim());
        } else {
            quizzes = quizRepository.findByPublishedTrue();
        }
        return quizzes.stream()
                .map(q -> mapToResponseDto(q, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public QuizResponseDto togglePublish(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));

        boolean newPublishedState = !quiz.isPublished();
        if (newPublishedState) {
            validateQuizForPublish(quiz);
        }

        quiz.setPublished(newPublishedState);
        Quiz savedQuiz = quizRepository.save(quiz);
        return mapToResponseDto(savedQuiz, true);
    }

    private void validateQuizForPublish(Quiz quiz) {
        if (quiz.getQuestions() == null || quiz.getQuestions().isEmpty()) {
            throw new BadRequestException("Cannot publish a quiz that has no questions.");
        }
        for (Question q : quiz.getQuestions()) {
            if (q.getOptions() == null || q.getOptions().size() < 2) {
                throw new BadRequestException("Every question must have at least 2 options to publish.");
            }
            boolean hasCorrect = q.getOptions().stream().anyMatch(AnswerOption::isCorrect);
            if (!hasCorrect) {
                throw new BadRequestException("Question '" + q.getQuestionText() + "' must have at least one correct answer designated.");
            }
        }
    }

    private QuizResponseDto mapToResponseDto(Quiz quiz, boolean includeQuestions) {
        List<QuestionDto> questions = new ArrayList<>();
        if (includeQuestions && quiz.getQuestions() != null) {
            questions = quiz.getQuestions().stream()
                    .map(q -> QuestionDto.builder()
                            .id(q.getId())
                            .questionText(q.getQuestionText())
                            .marks(q.getMarks())
                            .questionOrder(q.getQuestionOrder())
                            .options(q.getOptions().stream()
                                    .map(o -> OptionDto.builder()
                                            .id(o.getId())
                                            .optionText(o.getOptionText())
                                            .optionOrder(o.getOptionOrder())
                                            .correct(o.isCorrect())
                                            .build()
                                    ).collect(Collectors.toList())
                            )
                            .build()
                    ).collect(Collectors.toList());
        }

        return QuizResponseDto.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .category(quiz.getCategory())
                .durationMinutes(quiz.getDurationMinutes())
                .totalMarks(quiz.getTotalMarks())
                .published(quiz.isPublished())
                .createdAt(quiz.getCreatedAt())
                .questionCount(quiz.getQuestions() != null ? quiz.getQuestions().size() : 0)
                .questions(includeQuestions ? questions : null)
                .build();
    }
}
