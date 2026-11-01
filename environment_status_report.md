# Phase 1 & 2: Environment & Project Audit Report

**Project Name:** Quiz Application with Score Analysis  
**Inspection Date:** 2026-11-01  
**Workspace:** `C:\Aditya_Project`

---

## A. Already Installed

| Software / Tool | Detected Version | Status / Notes |
| :--- | :--- | :--- |
| **Java Development Kit** | 17.0.16 (Adoptium) & 25.0.2 (Oracle) | Verified. Maven Wrapper uses JDK 17 (target for Spring Boot). |
| **Maven** | Apache Maven 3.10.0 (via `mvnw.cmd`) | Verified. `mvnw.cmd` wrapper is functional in `backend/quiz_application`. (Global `mvn` CLI not in PATH). |
| **Node.js** | v24.19.0 | Verified in system PATH. |
| **npm** | 11.17.0 | Verified in system PATH. |
| **Git** | 2.52.0.windows.1 | Verified in system PATH. |
| **MySQL Server** | 8.0.46 (`MySQL80` service) | Verified. Service is **Running**; TCP port 3306 is open and accepting socket connections. Binary located at `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`. |
| **Python** | 3.12+ | Available on Windows system. |

---

## B. Already Configured

- **Backend Project Skeleton:** Located in `backend/quiz_application`.
  - Spring Boot parent `4.1.2` with Java 17 configuration.
  - Existing `pom.xml` configured with:
    - `spring-boot-starter-data-jpa`
    - `spring-boot-starter-validation`
    - `spring-boot-starter-webmvc`
    - `spring-boot-devtools`
    - `mysql-connector-j` (9.7.0)
    - `lombok` (1.18.48)
    - Test starters: `spring-boot-starter-data-jpa-test`, `spring-boot-starter-validation-test`, `spring-boot-starter-webmvc-test`
  - Maven compiler plugin configured with Lombok annotation processor.
  - `QuizApplication.java` entry point exists and compiles successfully with `.\mvnw.cmd compile`.

---

## C. Missing Dependencies

### Backend (`pom.xml`)
1. **Spring Security:** `org.springframework.boot:spring-boot-starter-security` for securing endpoints, password hashing (BCrypt), and role-based access control (`ROLE_STUDENT`, `ROLE_ADMIN`).
2. **JWT (JSON Web Token):** `io.jsonwebtoken:jjwt-api:0.12.6`, `io.jsonwebtoken:jjwt-impl:0.12.6`, `io.jsonwebtoken:jjwt-jackson:0.12.6` for stateless authentication tokens.
3. **In-Memory Test Database:** `com.h2database:h2` (test scope) to enable automated unit and integration tests to execute non-destructively without dependency on live MySQL credentials during test runs.

### Frontend (`package.json`)
The `frontend/` directory is currently completely empty. The following dependencies are required:
1. `react` and `react-dom`
2. `vite` and `@vitejs/plugin-react`
3. `axios` (HTTP requests & interceptors)
4. `react-router-dom` (client-side routing)
5. `lucide-react` (icons)
6. `recharts` (score analysis and performance trend visualization)

---

## D. Missing Software

- Global `mvn` command is not in system PATH (mitigated completely by the project's included `mvnw.cmd`).
- `mysql.exe` is not in system PATH (located at `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`).
- No software is critically absent.

---

## E. Existing Errors

1. **`application.properties` is Empty:** Contains only `spring.application.name=quiz_application`. Missing all MySQL connection configuration, JPA dialect/ddl-auto settings, server port, CORS mapping, and JWT secret/expiration parameters.
2. **Missing Database Credentials:** MySQL root access rejected passwordless login (`Access denied for user 'root'@'localhost' (using password: NO)`). The application requires parameterized credentials (`SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`).
3. **Empty Frontend:** The `frontend` folder has no files or project structure.
4. **Git Repository:** `c:\Aditya_Project` is not yet initialized as a Git repository (`fatal: not a git repository`).

---

## F. Development Work Remaining

### Backend
1. Update `pom.xml` with Spring Security, JJWT, and H2 test scope.
2. Configure `application.properties` with environment variable fallbacks for MySQL (`quizapp` database, auto-creation), JPA, server port `8080`, and JWT secrets.
3. Design and implement JPA Entities:
   - `User` (roles: `ROLE_STUDENT`, `ROLE_ADMIN`)
   - `Quiz` (title, description, category, durationMinutes, totalMarks, published, createdAt)
   - `Question` (questionText, marks, questionOrder)
   - `AnswerOption` (optionText, optionOrder, correct)
   - `QuizAttempt` (student, quiz, startedAt, submittedAt, score, totalMarks, percentage, status)
   - `SubmittedAnswer` (attempt, question, selectedOption, awardedMarks)
4. Implement Spring Data JPA Repositories for each entity.
5. Implement Security components:
   - `JwtTokenProvider`
   - `JwtAuthenticationFilter`
   - `CustomUserDetailsService`
   - `SecurityConfig` (BCrypt password encoder, CORS configuration for `http://localhost:5173`, stateless session management, role-based URL protection)
6. Implement DTOs:
   - Auth: `LoginRequest`, `RegisterRequest`, `AuthResponse`, `UserDto`
   - Quiz: `QuizCreateDto`, `QuizResponseDto`, `QuizStudentDto` (strictly excluding `correct` answer flags so students cannot inspect correct answers before submitting!)
   - Attempt & Submission: `QuizSubmissionDto`, `SubmittedAnswerDto`, `AttemptResultDto`, `AttemptHistoryDto`
   - Analytics: `StudentAnalyticsDto`, `AdminQuizAnalyticsDto`
7. Implement Business Service layer:
   - `AuthService`
   - `QuizService` & `QuestionService`
   - `QuizAttemptService` (server-side scoring, attempt verification, time limit checking, duplicate submission prevention, transactional integrity)
   - `AnalyticsService` (score percentage, attempt progression, category breakdown)
8. Implement REST Controllers:
   - `/api/auth` (register, login, me)
   - `/api/quizzes` (CRUD for admin, published listing for students)
   - `/api/questions` (CRUD for quiz questions & options)
   - `/api/attempts` (start attempt, submit attempt, get result, get history)
   - `/api/analytics` (student analytics, admin overview)
9. Implement Global Exception Handling with `@RestControllerAdvice`.
10. Implement automated JUnit & Mockito unit/integration tests.

### Frontend
1. Scaffold Vite React app in `frontend/`.
2. Configure dependencies (`axios`, `react-router-dom`, `lucide-react`, `recharts`).
3. Build responsive styling system with CSS custom properties (clean academic dashboard design, glassmorphism, badges, cards, progress bars).
4. Implement Centralized Axios client (`api.js`) with request interceptor for JWT authorization header and response error handler.
5. Implement Authentication Context (`AuthContext.jsx`) managing user state, tokens in `localStorage`, and logout.
6. Implement Navigation and Protected Routes (`ProtectedRoute.jsx`, `AdminRoute.jsx`).
7. Build Pages:
   - `Navbar` & layout components.
   - `LoginPage` & `RegisterPage` with validation and demo quick-fill credentials.
   - `StudentDashboard`: Available published quizzes, search/filter by category, recent attempts summary, performance cards.
   - `QuizTakePage`: Active timer, question progression, option selection, warning dialog before submit.
   - `QuizResultPage`: Score breakdown (marks obtained, total marks, percentage, correct/incorrect/unanswered count, pass/fail badge).
   - `AttemptHistoryPage`: Tabular history and filters.
   - `ScoreAnalysisPage`: Recharts score progression over time, quiz-by-quiz performance comparisons, accuracy rates.
   - `AdminDashboard`: Statistics overview, quiz list, quick publish/unpublish toggle, delete button.
   - `AdminQuizEditorPage`: Create/edit quiz, add/edit questions, options, mark correct option, marks allocation.
   - `NotFoundPage`.

---

## G. User Actions Required

1. **MySQL Credentials:**
   - Default configured fallback:
     - URL: `jdbc:mysql://localhost:3306/quizapp?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true`
     - Username: `root`
     - Password: `${SPRING_DATASOURCE_PASSWORD:root}`
   - If your local MySQL root password is not `root`, set the environment variable:
     - Windows PowerShell: `$env:SPRING_DATASOURCE_PASSWORD="your_password"`
     - Or update the local `application.properties` / `.env` file before running the backend.
