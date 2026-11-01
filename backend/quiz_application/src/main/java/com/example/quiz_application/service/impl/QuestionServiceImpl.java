package com.example.quiz_application.service.impl;

import com.example.quiz_application.dto.quiz.OptionDto;
import com.example.quiz_application.dto.quiz.QuestionDto;
import com.example.quiz_application.entity.AnswerOption;
import com.example.quiz_application.entity.Question;
import com.example.quiz_application.entity.Quiz;
import com.example.quiz_application.exception.BadRequestException;
import com.example.quiz_application.exception.ResourceNotFoundException;
import com.example.quiz_application.repository.QuestionRepository;
import com.example.quiz_application.repository.QuizRepository;
import com.example.quiz_application.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;

    @Override
    @Transactional
    public QuestionDto addQuestion(Long quizId, QuestionDto dto) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));

        if (dto.getOptions() == null || dto.getOptions().size() < 2) {
            throw new BadRequestException("A question must have at least 2 options.");
        }

        boolean hasCorrectOption = dto.getOptions().stream().anyMatch(OptionDto::isCorrect);
        if (!hasCorrectOption) {
            throw new BadRequestException("At least one option must be marked as correct.");
        }

        int nextOrder = dto.getQuestionOrder() != null ? dto.getQuestionOrder() : quiz.getQuestions().size() + 1;

        Question question = Question.builder()
                .questionText(dto.getQuestionText().trim())
                .marks(dto.getMarks() != null ? dto.getMarks() : 1)
                .questionOrder(nextOrder)
                .build();

        for (int i = 0; i < dto.getOptions().size(); i++) {
            OptionDto oDto = dto.getOptions().get(i);
            AnswerOption option = AnswerOption.builder()
                    .optionText(oDto.getOptionText().trim())
                    .optionOrder(oDto.getOptionOrder() != null ? oDto.getOptionOrder() : i + 1)
                    .correct(oDto.isCorrect())
                    .build();
            question.addOption(option);
        }

        quiz.addQuestion(question);
        recalculateQuizTotalMarks(quiz);
        Question savedQuestion = questionRepository.save(question);
        quizRepository.save(quiz);

        return mapToDto(savedQuestion);
    }

    @Override
    @Transactional
    public QuestionDto updateQuestion(Long questionId, QuestionDto dto) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));

        if (dto.getOptions() == null || dto.getOptions().size() < 2) {
            throw new BadRequestException("A question must have at least 2 options.");
        }

        boolean hasCorrectOption = dto.getOptions().stream().anyMatch(OptionDto::isCorrect);
        if (!hasCorrectOption) {
            throw new BadRequestException("At least one option must be marked as correct.");
        }

        question.setQuestionText(dto.getQuestionText().trim());
        question.setMarks(dto.getMarks() != null ? dto.getMarks() : 1);
        if (dto.getQuestionOrder() != null) {
            question.setQuestionOrder(dto.getQuestionOrder());
        }

        question.getOptions().clear();
        for (int i = 0; i < dto.getOptions().size(); i++) {
            OptionDto oDto = dto.getOptions().get(i);
            AnswerOption option = AnswerOption.builder()
                    .optionText(oDto.getOptionText().trim())
                    .optionOrder(oDto.getOptionOrder() != null ? oDto.getOptionOrder() : i + 1)
                    .correct(oDto.isCorrect())
                    .build();
            question.addOption(option);
        }

        recalculateQuizTotalMarks(question.getQuiz());
        Question savedQuestion = questionRepository.save(question);
        quizRepository.save(question.getQuiz());

        return mapToDto(savedQuestion);
    }

    @Override
    @Transactional
    public void deleteQuestion(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));
        Quiz quiz = question.getQuiz();
        quiz.removeQuestion(question);
        recalculateQuizTotalMarks(quiz);
        questionRepository.delete(question);
        quizRepository.save(quiz);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionDto> getQuestionsByQuizId(Long quizId) {
        return questionRepository.findByQuizIdOrderByQuestionOrderAsc(quizId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private void recalculateQuizTotalMarks(Quiz quiz) {
        int total = quiz.getQuestions().stream()
                .mapToInt(Question::getMarks)
                .sum();
        quiz.setTotalMarks(total);
    }

    private QuestionDto mapToDto(Question q) {
        return QuestionDto.builder()
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
                .build();
    }
}
