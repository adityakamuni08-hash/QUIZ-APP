package com.example.quiz_application.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "submitted_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmittedAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private QuizAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_option_id")
    private AnswerOption selectedOption;

    @Column(nullable = false)
    private Integer awardedMarks;

    @Column(nullable = false)
    private boolean correct;
}
