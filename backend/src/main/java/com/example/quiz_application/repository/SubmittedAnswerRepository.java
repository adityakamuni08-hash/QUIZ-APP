package com.example.quiz_application.repository;

import com.example.quiz_application.entity.SubmittedAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmittedAnswerRepository extends JpaRepository<SubmittedAnswer, Long> {
    List<SubmittedAnswer> findByAttemptId(Long attemptId);
}
