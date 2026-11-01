package com.example.quiz_application.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAnalyticsDto {
    private long totalAttempts;
    private Double averageScorePercentage;
    private Double bestScorePercentage;
    private long totalQuizzesAvailable;
    private int totalPassedQuizzes;
    private List<ScoreTrendDto> scoreTrend;
    private List<CategoryPerformanceDto> categoryPerformance;
}
