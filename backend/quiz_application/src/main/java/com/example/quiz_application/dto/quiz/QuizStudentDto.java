package com.example.quiz_application.dto.quiz;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizStudentDto {
    private Long id;
    private String title;
    private String description;
    private String category;
    private Integer durationMinutes;
    private Integer totalMarks;
    private int questionCount;
    private List<QuestionStudentDto> questions;
}
