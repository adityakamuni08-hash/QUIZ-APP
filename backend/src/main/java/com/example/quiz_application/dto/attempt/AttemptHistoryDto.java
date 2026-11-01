package com.example.quiz_application.dto.attempt;

import com.example.quiz_application.entity.AttemptStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptHistoryDto {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private String category;
    private Integer score;
    private Integer totalMarks;
    private Double percentage;
    private AttemptStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer correctAnswersCount;
    private Integer incorrectAnswersCount;
    private Integer unansweredCount;
}
