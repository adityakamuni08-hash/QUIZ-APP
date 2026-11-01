package com.example.quiz_application.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoreTrendDto {
    private Long attemptId;
    private String quizTitle;
    private Double percentage;
    private Integer score;
    private Integer totalMarks;
    private LocalDateTime date;
}
