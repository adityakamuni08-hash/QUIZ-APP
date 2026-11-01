package com.example.quiz_application.dto.attempt;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmittedAnswerResultDto {
    private Long questionId;
    private String questionText;
    private Long selectedOptionId;
    private String selectedOptionText;
    private Long correctOptionId;
    private String correctOptionText;
    private Integer awardedMarks;
    private Integer questionMarks;
    private boolean correct;
    private boolean unanswered;
}
