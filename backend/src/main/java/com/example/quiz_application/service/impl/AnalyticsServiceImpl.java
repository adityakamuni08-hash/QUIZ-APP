package com.example.quiz_application.service.impl;

import com.example.quiz_application.dto.analytics.*;
import com.example.quiz_application.entity.AttemptStatus;
import com.example.quiz_application.entity.QuizAttempt;
import com.example.quiz_application.entity.Role;
import com.example.quiz_application.repository.QuizAttemptRepository;
import com.example.quiz_application.repository.QuizRepository;
import com.example.quiz_application.repository.UserRepository;
import com.example.quiz_application.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final QuizAttemptRepository attemptRepository;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public StudentAnalyticsDto getStudentAnalytics(Long studentId) {
        List<QuizAttempt> completedAttempts = attemptRepository.findByStudentIdOrderByStartedAtDesc(studentId).stream()
                .filter(a -> a.getStatus() == AttemptStatus.COMPLETED || a.getStatus() == AttemptStatus.TIMED_OUT)
                .collect(Collectors.toList());

        long totalAttempts = completedAttempts.size();
        double avgScore = 0.0;
        double bestScore = 0.0;
        int passedQuizzes = 0;

        if (totalAttempts > 0) {
            avgScore = completedAttempts.stream().mapToDouble(QuizAttempt::getPercentage).average().orElse(0.0);
            bestScore = completedAttempts.stream().mapToDouble(QuizAttempt::getPercentage).max().orElse(0.0);
            passedQuizzes = (int) completedAttempts.stream().filter(a -> a.getPercentage() >= 50.0).count();
        }

        avgScore = Math.round(avgScore * 100.0) / 100.0;
        bestScore = Math.round(bestScore * 100.0) / 100.0;

        // Score trend chronologically
        List<ScoreTrendDto> trend = completedAttempts.stream()
                .sorted(Comparator.comparing(QuizAttempt::getStartedAt))
                .map(a -> ScoreTrendDto.builder()
                        .attemptId(a.getId())
                        .quizTitle(a.getQuiz().getTitle())
                        .percentage(a.getPercentage())
                        .score(a.getScore())
                        .totalMarks(a.getTotalMarks())
                        .date(a.getSubmittedAt() != null ? a.getSubmittedAt() : a.getStartedAt())
                        .build()
                ).collect(Collectors.toList());

        // Category breakdown
        Map<String, List<QuizAttempt>> byCategory = completedAttempts.stream()
                .collect(Collectors.groupingBy(a -> a.getQuiz().getCategory() != null ? a.getQuiz().getCategory() : "General"));

        List<CategoryPerformanceDto> categoryPerformance = byCategory.entrySet().stream()
                .map(entry -> {
                    double catAvg = entry.getValue().stream().mapToDouble(QuizAttempt::getPercentage).average().orElse(0.0);
                    return CategoryPerformanceDto.builder()
                            .category(entry.getKey())
                            .attemptsCount(entry.getValue().size())
                            .averagePercentage(Math.round(catAvg * 100.0) / 100.0)
                            .build();
                })
                .sorted(Comparator.comparing(CategoryPerformanceDto::getAttemptsCount).reversed())
                .collect(Collectors.toList());

        long totalQuizzesAvailable = quizRepository.findByPublishedTrue().size();

        return StudentAnalyticsDto.builder()
                .totalAttempts(totalAttempts)
                .averageScorePercentage(avgScore)
                .bestScorePercentage(bestScore)
                .totalQuizzesAvailable(totalQuizzesAvailable)
                .totalPassedQuizzes(passedQuizzes)
                .scoreTrend(trend)
                .categoryPerformance(categoryPerformance)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminAnalyticsDto getAdminAnalytics() {
        long totalQuizzes = quizRepository.count();
        long publishedQuizzes = quizRepository.findByPublishedTrue().size();
        long totalStudents = userRepository.countByRole(Role.ROLE_STUDENT);

        List<QuizAttempt> allAttempts = attemptRepository.findByStatusIn(
                List.of(AttemptStatus.COMPLETED, AttemptStatus.TIMED_OUT)
        );

        long totalAttempts = allAttempts.size();
        double platformAvg = allAttempts.stream().mapToDouble(QuizAttempt::getPercentage).average().orElse(0.0);
        platformAvg = Math.round(platformAvg * 100.0) / 100.0;

        Map<String, List<QuizAttempt>> byCategory = allAttempts.stream()
                .collect(Collectors.groupingBy(a -> a.getQuiz().getCategory() != null ? a.getQuiz().getCategory() : "General"));

        List<CategoryPerformanceDto> categoryBreakdown = byCategory.entrySet().stream()
                .map(entry -> {
                    double catAvg = entry.getValue().stream().mapToDouble(QuizAttempt::getPercentage).average().orElse(0.0);
                    return CategoryPerformanceDto.builder()
                            .category(entry.getKey())
                            .attemptsCount(entry.getValue().size())
                            .averagePercentage(Math.round(catAvg * 100.0) / 100.0)
                            .build();
                })
                .sorted(Comparator.comparing(CategoryPerformanceDto::getAttemptsCount).reversed())
                .collect(Collectors.toList());

        return AdminAnalyticsDto.builder()
                .totalQuizzes(totalQuizzes)
                .publishedQuizzes(publishedQuizzes)
                .totalStudents(totalStudents)
                .totalAttempts(totalAttempts)
                .platformAverageScore(platformAvg)
                .categoryBreakdown(categoryBreakdown)
                .build();
    }
}
