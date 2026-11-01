package com.example.quiz_application.dto.quiz;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
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
public class QuestionDto {
    private Long id;

    @NotBlank(message = "Question text cannot be blank")
    private String questionText;

    @NotNull(message = "Marks must be specified")
    private Integer marks;

    private Integer questionOrder;

    @NotEmpty(message = "Question must have at least one option")
    private List<OptionDto> options;
}
