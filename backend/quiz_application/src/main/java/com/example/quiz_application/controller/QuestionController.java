package com.example.quiz_application.controller;

import com.example.quiz_application.dto.quiz.QuestionDto;
import com.example.quiz_application.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping("/quiz/{quizId}")
    public ResponseEntity<QuestionDto> addQuestion(
            @PathVariable Long quizId,
            @Valid @RequestBody QuestionDto dto) {
        QuestionDto created = questionService.addQuestion(quizId, dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{questionId}")
    public ResponseEntity<QuestionDto> updateQuestion(
            @PathVariable Long questionId,
            @Valid @RequestBody QuestionDto dto) {
        QuestionDto updated = questionService.updateQuestion(questionId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long questionId) {
        questionService.deleteQuestion(questionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<QuestionDto>> getQuestionsByQuizId(@PathVariable Long quizId) {
        List<QuestionDto> questions = questionService.getQuestionsByQuizId(quizId);
        return ResponseEntity.ok(questions);
    }
}
