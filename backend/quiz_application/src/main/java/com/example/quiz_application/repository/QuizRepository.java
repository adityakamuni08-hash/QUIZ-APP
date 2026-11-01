package com.example.quiz_application.repository;

import com.example.quiz_application.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByPublishedTrue();
    List<Quiz> findByPublishedTrueAndCategoryIgnoreCase(String category);
}
