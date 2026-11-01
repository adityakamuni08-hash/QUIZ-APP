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
public class AdminAnalyticsDto {
    private long totalQuizzes;
    private long publishedQuizzes;
    private long totalStudents;
    private long totalAttempts;
    private Double platformAverageScore;
    private List<CategoryPerformanceDto> categoryBreakdown;
}
