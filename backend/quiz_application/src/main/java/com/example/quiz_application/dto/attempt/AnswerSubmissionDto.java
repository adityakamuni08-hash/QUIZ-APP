package com.example.quiz_application.dto.attempt;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerSubmissionDto {
    @NotNull(message = "Question ID is required")
    private Long questionId;

    // Can be null if student leaves the question unanswered
    private Long selectedOptionId;
}
