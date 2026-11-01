package com.example.quiz_application.repository;

import com.example.quiz_application.entity.AttemptStatus;
import com.example.quiz_application.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByStudentIdOrderByStartedAtDesc(Long studentId);
    List<QuizAttempt> findByQuizIdOrderByStartedAtDesc(Long quizId);
    Optional<QuizAttempt> findByIdAndStudentId(Long id, Long studentId);

    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.student.id = :studentId AND qa.quiz.id = :quizId AND qa.status = :status")
    List<QuizAttempt> findActiveAttempts(
            @Param("studentId") Long studentId,
            @Param("quizId") Long quizId,
            @Param("status") AttemptStatus status
    );

    @Query("SELECT COUNT(qa) FROM QuizAttempt qa WHERE qa.student.id = :studentId AND qa.status = 'COMPLETED'")
    long countCompletedByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT AVG(qa.percentage) FROM QuizAttempt qa WHERE qa.student.id = :studentId AND qa.status = 'COMPLETED'")
    Double getAveragePercentageByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT MAX(qa.percentage) FROM QuizAttempt qa WHERE qa.student.id = :studentId AND qa.status = 'COMPLETED'")
    Double getMaxPercentageByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.status IN ('COMPLETED', 'TIMED_OUT')")
    List<QuizAttempt> findAllCompletedOrTimedOut();
}
