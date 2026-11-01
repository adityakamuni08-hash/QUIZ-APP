package com.example.quiz_application.dto.quiz;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
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
public class QuizCreateDto {
    @NotBlank(message = "Quiz title is required")
    private String title;

    private String description;
    private String category;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    private Integer totalMarks;
    private boolean published;

    private List<QuestionDto> questions;
}
