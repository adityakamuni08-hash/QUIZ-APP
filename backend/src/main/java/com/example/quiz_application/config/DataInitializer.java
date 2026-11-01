package com.example.quiz_application.config;

import com.example.quiz_application.entity.*;
import com.example.quiz_application.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final PasswordEncoder passwordEncoder;
    private final QuizAttemptRepository attemptRepository;
    private final SubmittedAnswerRepository submittedAnswerRepository;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            log.info("Checking database initialization...");

            User admin = userRepository.findByEmail("admin@quizapp.com").orElse(null);
            if (admin == null) {
                admin = User.builder()
                        .name("System Administrator")
                        .email("admin@quizapp.com")
                        .password(passwordEncoder.encode("AdminPassword123!"))
                        .role(Role.ROLE_ADMIN)
                        .build();
                admin = userRepository.save(admin);
                log.info("Created default admin user: admin@quizapp.com / AdminPassword123!");
            }

            User student = userRepository.findByEmail("student@quizapp.com").orElse(null);
            if (student == null) {
                student = User.builder()
                        .name("Alex Student")
                        .email("student@quizapp.com")
                        .password(passwordEncoder.encode("StudentPassword123!"))
                        .role(Role.ROLE_STUDENT)
                        .build();
                student = userRepository.save(student);
                log.info("Created default student user: student@quizapp.com / StudentPassword123!");
            }

            if (quizRepository.count() == 0) {
                log.info("Seeding initial quizzes...");

                // Quiz 1: Core Java & OOP Fundamentals
                Quiz javaQuiz = Quiz.builder()
                        .title("Core Java & OOP Fundamentals")
                        .description("Test your knowledge of Java fundamentals, object-oriented concepts, JVM memory, and collections.")
                        .category("Java")
                        .durationMinutes(15)
                        .totalMarks(40)
                        .published(true)
                        .build();

                // Q1
                Question q1 = Question.builder()
                        .questionText("Which feature of Object-Oriented Programming allows a subclass to provide a specific implementation of a method already defined in its superclass?")
                        .marks(10)
                        .questionOrder(1)
                        .build();
                q1.addOption(AnswerOption.builder().optionText("Polymorphism (Method Overriding)").optionOrder(1).correct(true).build());
                q1.addOption(AnswerOption.builder().optionText("Encapsulation").optionOrder(2).correct(false).build());
                q1.addOption(AnswerOption.builder().optionText("Method Overloading").optionOrder(3).correct(false).build());
                q1.addOption(AnswerOption.builder().optionText("Abstraction").optionOrder(4).correct(false).build());
                javaQuiz.addQuestion(q1);

                // Q2
                Question q2 = Question.builder()
                        .questionText("Where are objects allocated in JVM memory during execution?")
                        .marks(10)
                        .questionOrder(2)
                        .build();
                q2.addOption(AnswerOption.builder().optionText("Stack Memory").optionOrder(1).correct(false).build());
                q2.addOption(AnswerOption.builder().optionText("Heap Memory").optionOrder(2).correct(true).build());
                q2.addOption(AnswerOption.builder().optionText("Program Counter Register").optionOrder(3).correct(false).build());
                q2.addOption(AnswerOption.builder().optionText("Native Method Stack").optionOrder(4).correct(false).build());
                javaQuiz.addQuestion(q2);

                // Q3
                Question q3 = Question.builder()
                        .questionText("Which interface in Java Collections does NOT inherit from the Collection interface?")
                .marks(10)
                .questionOrder(3)
                .build();
                q3.addOption(AnswerOption.builder().optionText("List").optionOrder(1).correct(false).build());
                q3.addOption(AnswerOption.builder().optionText("Set").optionOrder(2).correct(false).build());
                q3.addOption(AnswerOption.builder().optionText("Map").optionOrder(3).correct(true).build());
                q3.addOption(AnswerOption.builder().optionText("Queue").optionOrder(4).correct(false).build());
                javaQuiz.addQuestion(q3);

                // Q4
                Question q4 = Question.builder()
                        .questionText("What does the 'transient' keyword indicate when applied to a variable in Java?")
                        .marks(10)
                        .questionOrder(4)
                        .build();
                q4.addOption(AnswerOption.builder().optionText("The variable cannot be serialized").optionOrder(1).correct(true).build());
                q4.addOption(AnswerOption.builder().optionText("The variable cannot be modified").optionOrder(2).correct(false).build());
                q4.addOption(AnswerOption.builder().optionText("The variable is thread-safe").optionOrder(3).correct(false).build());
                q4.addOption(AnswerOption.builder().optionText("The variable is stored in the cache").optionOrder(4).correct(false).build());
                javaQuiz.addQuestion(q4);

                quizRepository.save(javaQuiz);

                // Quiz 2: Web Architecture & RESTful APIs
                Quiz webQuiz = Quiz.builder()
                        .title("Web Architecture & RESTful APIs")
                        .description("Evaluate your comprehension of HTTP methods, status codes, stateless communication, and REST principles.")
                        .category("Web Development")
                        .durationMinutes(10)
                        .totalMarks(30)
                        .published(true)
                        .build();

                Question wq1 = Question.builder()
                        .questionText("Which HTTP method is designated by RFC standards to be idempotent?")
                        .marks(10)
                        .questionOrder(1)
                        .build();
                wq1.addOption(AnswerOption.builder().optionText("PUT").optionOrder(1).correct(true).build());
                wq1.addOption(AnswerOption.builder().optionText("POST").optionOrder(2).correct(false).build());
                wq1.addOption(AnswerOption.builder().optionText("PATCH").optionOrder(3).correct(false).build());
                wq1.addOption(AnswerOption.builder().optionText("CONNECT").optionOrder(4).correct(false).build());
                webQuiz.addQuestion(wq1);

                Question wq2 = Question.builder()
                        .questionText("Which HTTP status code should be returned after successfully creating a new resource via a POST request?")
                        .marks(10)
                        .questionOrder(2)
                        .build();
                wq2.addOption(AnswerOption.builder().optionText("200 OK").optionOrder(1).correct(false).build());
                wq2.addOption(AnswerOption.builder().optionText("201 Created").optionOrder(2).correct(true).build());
                wq2.addOption(AnswerOption.builder().optionText("204 No Content").optionOrder(3).correct(false).build());
                wq2.addOption(AnswerOption.builder().optionText("202 Accepted").optionOrder(4).correct(false).build());
                webQuiz.addQuestion(wq2);

                Question wq3 = Question.builder()
                        .questionText("What is the primary purpose of CORS (Cross-Origin Resource Sharing)?")
                        .marks(10)
                        .questionOrder(3)
                        .build();
                wq3.addOption(AnswerOption.builder().optionText("Enables web browsers to safely load resources from different origins").optionOrder(1).correct(true).build());
                wq3.addOption(AnswerOption.builder().optionText("Encrypts data transmitted over websockets").optionOrder(2).correct(false).build());
                wq3.addOption(AnswerOption.builder().optionText("Compresses HTTP payloads before transit").optionOrder(3).correct(false).build());
                wq3.addOption(AnswerOption.builder().optionText("Manages server-side database replication").optionOrder(4).correct(false).build());
                webQuiz.addQuestion(wq3);

                quizRepository.save(webQuiz);

                // Seed an initial demo attempt for the student to enrich the score analytics display
                QuizAttempt demoAttempt = QuizAttempt.builder()
                        .student(student)
                        .quiz(javaQuiz)
                        .startedAt(LocalDateTime.now().minusHours(2))
                        .submittedAt(LocalDateTime.now().minusHours(1).minusMinutes(50))
                        .score(30)
                        .totalMarks(40)
                        .percentage(75.0)
                        .status(AttemptStatus.COMPLETED)
                        .correctAnswersCount(3)
                        .incorrectAnswersCount(1)
                        .unansweredCount(0)
                        .build();

                // Link sample submitted answers
                SubmittedAnswer sa1 = SubmittedAnswer.builder()
                        .attempt(demoAttempt)
                        .question(q1)
                        .selectedOption(q1.getOptions().get(0)) // correct
                        .awardedMarks(10)
                        .correct(true)
                        .build();
                SubmittedAnswer sa2 = SubmittedAnswer.builder()
                        .attempt(demoAttempt)
                        .question(q2)
                        .selectedOption(q2.getOptions().get(1)) // correct
                        .awardedMarks(10)
                        .correct(true)
                        .build();
                SubmittedAnswer sa3 = SubmittedAnswer.builder()
                        .attempt(demoAttempt)
                        .question(q3)
                        .selectedOption(q3.getOptions().get(2)) // correct
                        .awardedMarks(10)
                        .correct(true)
                        .build();
                SubmittedAnswer sa4 = SubmittedAnswer.builder()
                        .attempt(demoAttempt)
                        .question(q4)
                        .selectedOption(q4.getOptions().get(1)) // incorrect selection
                        .awardedMarks(0)
                        .correct(false)
                        .build();

                demoAttempt.setSubmittedAnswers(List.of(sa1, sa2, sa3, sa4));
                attemptRepository.save(demoAttempt);
                submittedAnswerRepository.saveAll(List.of(sa1, sa2, sa3, sa4));

                log.info("Successfully seeded demo quizzes and initial attempt.");
            }
        } catch (Exception e) {
            log.error("Warning: Error occurred during DataInitializer run: {}", e.getMessage(), e);
        }
    }
}
