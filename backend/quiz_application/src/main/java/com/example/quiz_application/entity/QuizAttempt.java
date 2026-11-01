package com.example.quiz_application.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quiz_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    private LocalDateTime submittedAt;

    @Column(nullable = false)
    private Integer score;

    @Column(nullable = false)
    private Integer totalMarks;

    @Column(nullable = false)
    private Double percentage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttemptStatus status;

    private Integer correctAnswersCount;
    private Integer incorrectAnswersCount;
    private Integer unansweredCount;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<SubmittedAnswer> submittedAnswers = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (this.startedAt == null) {
            this.startedAt = LocalDateTime.now();
        }
        if (this.score == null) {
            this.score = 0;
        }
        if (this.totalMarks == null) {
            this.totalMarks = 0;
        }
        if (this.percentage == null) {
            this.percentage = 0.0;
        }
        if (this.status == null) {
            this.status = AttemptStatus.IN_PROGRESS;
        }
    }

    public void addSubmittedAnswer(SubmittedAnswer answer) {
        submittedAnswers.add(answer);
        answer.setAttempt(this);
    }
}
