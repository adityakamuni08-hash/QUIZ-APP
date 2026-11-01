package com.example.quiz_application.dto.quiz;

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
public class QuizResponseDto {
    private Long id;
    private String title;
    private String description;
    private String category;
    private Integer durationMinutes;
    private Integer totalMarks;
    private boolean published;
    private LocalDateTime createdAt;
    private int questionCount;
    private List<QuestionDto> questions;
}
