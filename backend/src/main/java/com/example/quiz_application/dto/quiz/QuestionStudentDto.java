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
public class QuestionStudentDto {
    private Long id;
    private String questionText;
    private Integer marks;
    private Integer questionOrder;
    private List<OptionStudentDto> options;
}
