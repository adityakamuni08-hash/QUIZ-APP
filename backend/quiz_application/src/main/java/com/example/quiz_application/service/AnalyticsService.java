package com.example.quiz_application.service;

import com.example.quiz_application.dto.analytics.AdminAnalyticsDto;
import com.example.quiz_application.dto.analytics.StudentAnalyticsDto;

public interface AnalyticsService {
    StudentAnalyticsDto getStudentAnalytics(Long studentId);
    AdminAnalyticsDto getAdminAnalytics();
}
