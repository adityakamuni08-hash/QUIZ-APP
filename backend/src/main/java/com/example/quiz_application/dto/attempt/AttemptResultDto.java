package com.example.quiz_application.dto.attempt;

import com.example.quiz_application.entity.AttemptStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptResultDto {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private String category;
    private Integer durationMinutes;
    private Integer remainingSeconds;
    private Integer score;
    private Integer totalMarks;
    private Double percentage;
    private AttemptStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer correctAnswersCount;
    private Integer incorrectAnswersCount;
    private Integer unansweredCount;
    private List<SubmittedAnswerResultDto> questionResults;
}
