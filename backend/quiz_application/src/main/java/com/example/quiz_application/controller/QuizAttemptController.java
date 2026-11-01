package com.example.quiz_application.controller;

import com.example.quiz_application.dto.attempt.AttemptHistoryDto;
import com.example.quiz_application.dto.attempt.AttemptResultDto;
import com.example.quiz_application.dto.attempt.QuizSubmitRequest;
import com.example.quiz_application.security.UserPrincipal;
import com.example.quiz_application.service.QuizAttemptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attempts")
@RequiredArgsConstructor
public class QuizAttemptController {

    private final QuizAttemptService attemptService;

    @PostMapping("/start/{quizId}")
    public ResponseEntity<AttemptResultDto> startAttempt(
            @PathVariable Long quizId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AttemptResultDto result = attemptService.startAttempt(quizId, userPrincipal.getId());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/submit")
    public ResponseEntity<AttemptResultDto> submitAttempt(
            @Valid @RequestBody QuizSubmitRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AttemptResultDto result = attemptService.submitAttempt(request, userPrincipal.getId());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{attemptId}/result")
    public ResponseEntity<AttemptResultDto> getAttemptResult(
            @PathVariable Long attemptId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        AttemptResultDto result = attemptService.getAttemptResult(attemptId, userPrincipal.getId(), isAdmin);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/history")
    public ResponseEntity<List<AttemptHistoryDto>> getStudentHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<AttemptHistoryDto> history = attemptService.getStudentAttemptHistory(userPrincipal.getId());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/quiz/{quizId}/admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<AttemptHistoryDto>> getQuizAttemptsForAdmin(@PathVariable Long quizId) {
        List<AttemptHistoryDto> history = attemptService.getQuizAttemptHistoryForAdmin(quizId);
        return ResponseEntity.ok(history);
    }
}
