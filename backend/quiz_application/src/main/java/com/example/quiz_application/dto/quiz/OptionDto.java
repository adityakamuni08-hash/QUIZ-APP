package com.example.quiz_application.dto.quiz;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptionDto {
    private Long id;

    @NotBlank(message = "Option text cannot be blank")
    private String optionText;

    private Integer optionOrder;
    private boolean correct;
}
