package com.example.quiz_application.service;

import com.example.quiz_application.dto.auth.AuthResponse;
import com.example.quiz_application.dto.auth.LoginRequest;
import com.example.quiz_application.dto.auth.RegisterRequest;
import com.example.quiz_application.entity.Role;
import com.example.quiz_application.entity.User;
import com.example.quiz_application.exception.BadRequestException;
import com.example.quiz_application.repository.UserRepository;
import com.example.quiz_application.security.JwtTokenProvider;
import com.example.quiz_application.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .name("Alice")
                .email("alice@example.com")
                .password("encoded_pass")
                .role(Role.ROLE_STUDENT)
                .build();
    }

    @Test
    @DisplayName("Should successfully register new user")
    void testRegister_Success() {
        RegisterRequest req = new RegisterRequest("Alice", "alice@example.com", "Secret123!", Role.ROLE_STUDENT);

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Secret123!")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(tokenProvider.generateTokenFromDetails(eq(1L), eq("alice@example.com"), eq("ROLE_STUDENT"))).thenReturn("mock_token");

        AuthResponse resp = authService.register(req);

        assertNotNull(resp);
        assertEquals("mock_token", resp.getToken());
        assertEquals("alice@example.com", resp.getUser().getEmail());
    }

    @Test
    @DisplayName("Should reject registration with duplicate email")
    void testRegister_DuplicateEmail_ThrowsException() {
        RegisterRequest req = new RegisterRequest("Alice", "alice@example.com", "Secret123!", Role.ROLE_STUDENT);
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any(User.class));
    }
}
