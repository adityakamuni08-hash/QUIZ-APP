package com.example.quiz_application.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryPerformanceDto {
    private String category;
    private long attemptsCount;
    private Double averagePercentage;
}
