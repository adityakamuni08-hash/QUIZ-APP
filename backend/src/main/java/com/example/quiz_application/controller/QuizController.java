package com.example.quiz_application.controller;

import com.example.quiz_application.dto.quiz.QuizCreateDto;
import com.example.quiz_application.dto.quiz.QuizResponseDto;
import com.example.quiz_application.dto.quiz.QuizStudentDto;
import com.example.quiz_application.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<QuizResponseDto> createQuiz(@Valid @RequestBody QuizCreateDto dto) {
        QuizResponseDto created = quizService.createQuiz(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<QuizResponseDto> updateQuiz(@PathVariable Long id, @Valid @RequestBody QuizCreateDto dto) {
        QuizResponseDto updated = quizService.updateQuiz(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<QuizResponseDto>> getAllQuizzes() {
        List<QuizResponseDto> quizzes = quizService.getAllQuizzes();
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<QuizResponseDto> getQuizById(@PathVariable Long id) {
        QuizResponseDto quiz = quizService.getQuizById(id);
        return ResponseEntity.ok(quiz);
    }

    @GetMapping("/published")
    public ResponseEntity<List<QuizResponseDto>> getPublishedQuizzes(
            @RequestParam(required = false) String category) {
        List<QuizResponseDto> quizzes = quizService.getPublishedQuizzes(category);
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/{id}/take")
    public ResponseEntity<QuizStudentDto> getQuizForTaking(@PathVariable Long id) {
        QuizStudentDto quiz = quizService.getQuizForStudent(id);
        return ResponseEntity.ok(quiz);
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<QuizResponseDto> togglePublish(@PathVariable Long id) {
        QuizResponseDto updated = quizService.togglePublish(id);
        return ResponseEntity.ok(updated);
    }
}
