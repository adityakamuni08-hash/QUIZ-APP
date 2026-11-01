package com.example.quiz_application.service.impl;

import com.example.quiz_application.dto.attempt.*;
import com.example.quiz_application.entity.*;
import com.example.quiz_application.exception.BadRequestException;
import com.example.quiz_application.exception.ResourceNotFoundException;
import com.example.quiz_application.exception.UnauthorizedException;
import com.example.quiz_application.repository.*;
import com.example.quiz_application.service.QuizAttemptService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizAttemptServiceImpl implements QuizAttemptService {

    private final QuizAttemptRepository attemptRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final AnswerOptionRepository optionRepository;
    private final UserRepository userRepository;
    private final SubmittedAnswerRepository submittedAnswerRepository;

    @Override
    @Transactional
    public AttemptResultDto startAttempt(Long quizId, Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));

        if (!quiz.isPublished()) {
            throw new BadRequestException("Cannot attempt an unpublished quiz.");
        }

        if (quiz.getQuestions() == null || quiz.getQuestions().isEmpty()) {
            throw new BadRequestException("This quiz has no questions available.");
        }

        // Check if an existing IN_PROGRESS attempt exists within time limit
        List<QuizAttempt> activeAttempts = attemptRepository.findActiveAttempts(studentId, quizId, AttemptStatus.IN_PROGRESS);
        if (!activeAttempts.isEmpty()) {
            QuizAttempt existing = activeAttempts.get(0);
            long elapsedMinutes = Duration.between(existing.getStartedAt(), LocalDateTime.now()).toMinutes();
            // Allow resuming if within duration + 2 min grace
            if (elapsedMinutes < (quiz.getDurationMinutes() + 2)) {
                return mapToResultDto(existing, false);
            } else {
                // Auto mark timed out — score submitted answers that already exist
                existing.setStatus(AttemptStatus.TIMED_OUT);
                existing.setSubmittedAt(existing.getStartedAt().plusMinutes(quiz.getDurationMinutes()));
                // Recalculate score from any already-submitted answers
                if (existing.getSubmittedAnswers() != null && !existing.getSubmittedAnswers().isEmpty()) {
                    int scored = existing.getSubmittedAnswers().stream()
                            .mapToInt(SubmittedAnswer::getAwardedMarks)
                            .sum();
                    int correct = (int) existing.getSubmittedAnswers().stream().filter(SubmittedAnswer::isCorrect).count();
                    int incorrect = (int) existing.getSubmittedAnswers().stream()
                            .filter(a -> !a.isCorrect() && a.getSelectedOption() != null).count();
                    int unanswered = (int) existing.getSubmittedAnswers().stream()
                            .filter(a -> a.getSelectedOption() == null).count();
                    double pct = existing.getTotalMarks() > 0 ? (scored * 100.0) / existing.getTotalMarks() : 0.0;
                    existing.setScore(scored);
                    existing.setPercentage(Math.round(pct * 100.0) / 100.0);
                    existing.setCorrectAnswersCount(correct);
                    existing.setIncorrectAnswersCount(incorrect);
                    existing.setUnansweredCount(unanswered);
                }
                attemptRepository.save(existing);
            }
        }

        QuizAttempt attempt = QuizAttempt.builder()
                .student(student)
                .quiz(quiz)
                .startedAt(LocalDateTime.now())
                .status(AttemptStatus.IN_PROGRESS)
                .score(0)
                .totalMarks(quiz.getTotalMarks())
                .percentage(0.0)
                .correctAnswersCount(0)
                .incorrectAnswersCount(0)
                .unansweredCount(quiz.getQuestions().size())
                .build();

        QuizAttempt savedAttempt = attemptRepository.save(attempt);
        return mapToResultDto(savedAttempt, false);
    }

    @Override
    @Transactional
    public AttemptResultDto submitAttempt(QuizSubmitRequest request, Long studentId) {
        QuizAttempt attempt = attemptRepository.findById(request.getAttemptId())
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + request.getAttemptId()));

        if (!attempt.getStudent().getId().equals(studentId)) {
            throw new UnauthorizedException("You are not authorized to submit this attempt.");
        }

        // Idempotency: if already completed, return existing result without re-evaluating
        if (attempt.getStatus() == AttemptStatus.COMPLETED || attempt.getStatus() == AttemptStatus.TIMED_OUT) {
            return mapToResultDto(attempt, true);
        }

        Quiz quiz = attempt.getQuiz();
        LocalDateTime now = LocalDateTime.now();
        long elapsedMinutes = Duration.between(attempt.getStartedAt(), now).toMinutes();

        // 3 minutes grace period for network latency
        boolean isTimedOut = elapsedMinutes > (quiz.getDurationMinutes() + 3);

        Map<Long, Long> answersMap = new HashMap<>();
        if (request.getAnswers() != null) {
            for (AnswerSubmissionDto ans : request.getAnswers()) {
                if (ans.getQuestionId() != null) {
                    answersMap.put(ans.getQuestionId(), ans.getSelectedOptionId());
                }
            }
        }

        List<Question> questions = questionRepository.findByQuizIdOrderByQuestionOrderAsc(quiz.getId());
        int calculatedScore = 0;
        int totalMarks = 0;
        int correctCount = 0;
        int incorrectCount = 0;
        int unansweredCount = 0;

        List<SubmittedAnswer> submittedAnswers = new ArrayList<>();

        for (Question q : questions) {
            totalMarks += q.getMarks();
            Long selectedOptionId = answersMap.get(q.getId());

            AnswerOption correctOption = q.getOptions().stream()
                    .filter(AnswerOption::isCorrect)
                    .findFirst()
                    .orElse(null);

            AnswerOption selectedOption = null;
            if (selectedOptionId != null) {
                selectedOption = q.getOptions().stream()
                        .filter(o -> o.getId().equals(selectedOptionId))
                        .findFirst()
                        .orElse(null);
            }

            boolean isCorrect = false;
            int marksAwarded = 0;

            if (selectedOption == null) {
                unansweredCount++;
            } else if (correctOption != null && selectedOption.getId().equals(correctOption.getId())) {
                isCorrect = true;
                marksAwarded = q.getMarks();
                calculatedScore += marksAwarded;
                correctCount++;
            } else {
                incorrectCount++;
            }

            SubmittedAnswer subAnswer = SubmittedAnswer.builder()
                    .attempt(attempt)
                    .question(q)
                    .selectedOption(selectedOption)
                    .awardedMarks(marksAwarded)
                    .correct(isCorrect)
                    .build();

            submittedAnswers.add(subAnswer);
        }

        double percentage = totalMarks > 0 ? (calculatedScore * 100.0) / totalMarks : 0.0;
        percentage = Math.round(percentage * 100.0) / 100.0; // round to 2 decimals

        attempt.setSubmittedAt(now);
        attempt.setStatus(isTimedOut ? AttemptStatus.TIMED_OUT : AttemptStatus.COMPLETED);
        attempt.setScore(calculatedScore);
        attempt.setTotalMarks(totalMarks);
        attempt.setPercentage(percentage);
        attempt.setCorrectAnswersCount(correctCount);
        attempt.setIncorrectAnswersCount(incorrectCount);
        attempt.setUnansweredCount(unansweredCount);

        if (attempt.getSubmittedAnswers() == null) {
            attempt.setSubmittedAnswers(new ArrayList<>());
        } else {
            attempt.getSubmittedAnswers().clear();
        }
        attempt.getSubmittedAnswers().addAll(submittedAnswers);
        submittedAnswerRepository.saveAll(submittedAnswers);
        QuizAttempt savedAttempt = attemptRepository.save(attempt);

        return mapToResultDto(savedAttempt, true);
    }

    @Override
    @Transactional(readOnly = true)
    public AttemptResultDto getAttemptResult(Long attemptId, Long studentId, boolean isAdmin) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        if (!isAdmin && !attempt.getStudent().getId().equals(studentId)) {
            throw new UnauthorizedException("You are not authorized to view this result.");
        }

        return mapToResultDto(attempt, true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttemptHistoryDto> getStudentAttemptHistory(Long studentId) {
        return attemptRepository.findByStudentIdOrderByStartedAtDesc(studentId).stream()
                .filter(a -> a.getStatus() != AttemptStatus.IN_PROGRESS)
                .map(this::mapToHistoryDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttemptHistoryDto> getQuizAttemptHistoryForAdmin(Long quizId) {
        return attemptRepository.findByQuizIdOrderByStartedAtDesc(quizId).stream()
                .map(this::mapToHistoryDto)
                .collect(Collectors.toList());
    }

    private AttemptResultDto mapToResultDto(QuizAttempt attempt, boolean includeAnswers) {
        List<SubmittedAnswerResultDto> questionResults = new ArrayList<>();

        if (includeAnswers && attempt.getSubmittedAnswers() != null) {
            for (SubmittedAnswer sa : attempt.getSubmittedAnswers()) {
                Question q = sa.getQuestion();
                AnswerOption correctOpt = q.getOptions().stream()
                        .filter(AnswerOption::isCorrect)
                        .findFirst()
                        .orElse(null);

                questionResults.add(SubmittedAnswerResultDto.builder()
                        .questionId(q.getId())
                        .questionText(q.getQuestionText())
                        .selectedOptionId(sa.getSelectedOption() != null ? sa.getSelectedOption().getId() : null)
                        .selectedOptionText(sa.getSelectedOption() != null ? sa.getSelectedOption().getOptionText() : "Not answered")
                        .correctOptionId(correctOpt != null ? correctOpt.getId() : null)
                        .correctOptionText(correctOpt != null ? correctOpt.getOptionText() : "")
                        .awardedMarks(sa.getAwardedMarks())
                        .questionMarks(q.getMarks())
                        .correct(sa.isCorrect())
                        .unanswered(sa.getSelectedOption() == null)
                        .build()
                );
            }
        }

        int durationMins = (attempt.getQuiz() != null && attempt.getQuiz().getDurationMinutes() != null)
                ? attempt.getQuiz().getDurationMinutes()
                : 15;
        long elapsedSeconds = attempt.getStartedAt() != null
                ? Math.max(0, Duration.between(attempt.getStartedAt(), LocalDateTime.now()).getSeconds())
                : 0;
        int remainingSeconds = attempt.getStatus() == AttemptStatus.IN_PROGRESS
                ? (int) Math.max(0, (durationMins * 60L) - elapsedSeconds)
                : 0;

        return AttemptResultDto.builder()
                .attemptId(attempt.getId())
                .quizId(attempt.getQuiz().getId())
                .quizTitle(attempt.getQuiz().getTitle())
                .category(attempt.getQuiz().getCategory())
                .durationMinutes(durationMins)
                .remainingSeconds(remainingSeconds)
                .score(attempt.getScore())
                .totalMarks(attempt.getTotalMarks())
                .percentage(attempt.getPercentage())
                .status(attempt.getStatus())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .correctAnswersCount(attempt.getCorrectAnswersCount())
                .incorrectAnswersCount(attempt.getIncorrectAnswersCount())
                .unansweredCount(attempt.getUnansweredCount())
                .questionResults(questionResults)
                .build();
    }

    private AttemptHistoryDto mapToHistoryDto(QuizAttempt a) {
        return AttemptHistoryDto.builder()
                .attemptId(a.getId())
                .quizId(a.getQuiz().getId())
                .quizTitle(a.getQuiz().getTitle())
                .category(a.getQuiz().getCategory())
                .score(a.getScore())
                .totalMarks(a.getTotalMarks())
                .percentage(a.getPercentage())
                .status(a.getStatus())
                .startedAt(a.getStartedAt())
                .submittedAt(a.getSubmittedAt())
                .correctAnswersCount(a.getCorrectAnswersCount())
                .incorrectAnswersCount(a.getIncorrectAnswersCount())
                .unansweredCount(a.getUnansweredCount())
                .build();
    }
}
