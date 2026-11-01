package com.example.quiz_application.service;

import com.example.quiz_application.dto.auth.AuthResponse;
import com.example.quiz_application.dto.auth.LoginRequest;
import com.example.quiz_application.dto.auth.RegisterRequest;
import com.example.quiz_application.dto.auth.UserDto;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserDto getCurrentUser(String email);
}
