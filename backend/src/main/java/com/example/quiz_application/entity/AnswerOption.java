package com.example.quiz_application.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "answer_options")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false, length = 500)
    private String optionText;

    @Column(name = "option_order")
    private Integer optionOrder;

    @Column(nullable = false)
    private boolean correct;
}
