package com.example.quiz_application.dto.attempt;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmitRequest {
    @NotNull(message = "Attempt ID is required")
    private Long attemptId;

    private List<AnswerSubmissionDto> answers;
}
