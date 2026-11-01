package com.example.quiz_application.controller;

import com.example.quiz_application.dto.analytics.AdminAnalyticsDto;
import com.example.quiz_application.dto.analytics.StudentAnalyticsDto;
import com.example.quiz_application.security.UserPrincipal;
import com.example.quiz_application.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/student")
    public ResponseEntity<StudentAnalyticsDto> getStudentAnalytics(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        StudentAnalyticsDto analytics = analyticsService.getStudentAnalytics(userPrincipal.getId());
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<AdminAnalyticsDto> getAdminAnalytics() {
        AdminAnalyticsDto analytics = analyticsService.getAdminAnalytics();
        return ResponseEntity.ok(analytics);
    }
}
