# API Testing Checklist (Postman / Thunder Client)

**Base URL:** `http://localhost:8080/api`

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register New Student
- **Method:** `POST`
- **URL:** `{{base_url}}/auth/register`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "Jane Student",
    "email": "jane@example.com",
    "password": "Password123!",
    "role": "ROLE_STUDENT"
  }
  ```
- **Expected Status:** `201 Created`
- **Expected Behavior:** Returns JWT token and user details without password.

### 1.2 Student Login
- **Method:** `POST`
- **URL:** `{{base_url}}/auth/login`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "student@quizapp.com",
    "password": "StudentPassword123!"
  }
  ```
- **Expected Status:** `200 OK`
- **Expected Behavior:** Returns JWT `token` and user object with `ROLE_STUDENT`.

### 1.3 Administrator Login
- **Method:** `POST`
- **URL:** `{{base_url}}/auth/login`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "admin@quizapp.com",
    "password": "AdminPassword123!"
  }
  ```
- **Expected Status:** `200 OK`
- **Expected Behavior:** Returns JWT `token` and user object with `ROLE_ADMIN`.

### 1.4 Get Current User Profile
- **Method:** `GET`
- **URL:** `{{base_url}}/auth/me`
- **Headers:** `Authorization: Bearer {{token}}`
- **Expected Status:** `200 OK`

---

## 2. Quiz Endpoints (`/api/quizzes`)

### 2.1 Get Published Quizzes (Student)
- **Method:** `GET`
- **URL:** `{{base_url}}/quizzes/published`
- **Headers:** `Authorization: Bearer {{student_token}}`
- **Expected Status:** `200 OK`
- **Expected Behavior:** Returns only published quizzes. Questions in listing do not expose answers.

### 2.2 Get Quiz for Taking (Student)
- **Method:** `GET`
- **URL:** `{{base_url}}/quizzes/1/take`
- **Headers:** `Authorization: Bearer {{student_token}}`
- **Expected Status:** `200 OK`
- **Expected Behavior:** Returns quiz with questions and options. **CRITICAL:** The `correct` field is completely stripped from options.

### 2.3 Get All Quizzes (Admin Only)
- **Method:** `GET`
- **URL:** `{{base_url}}/quizzes`
- **Headers:** `Authorization: Bearer {{admin_token}}`
- **Expected Status:** `200 OK` (or `403 Forbidden` if called with student token).

### 2.4 Create Quiz (Admin Only)
- **Method:** `POST`
- **URL:** `{{base_url}}/quizzes`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{admin_token}}`
- **Request Body:**
  ```json
  {
    "title": "Spring Boot Fundamentals",
    "description": "Assessment of Spring core annotations and IOC containers.",
    "category": "Java",
    "durationMinutes": 10,
    "published": false,
    "questions": [
      {
        "questionText": "What annotation marks a class as a Spring Boot entry point?",
        "marks": 5,
        "questionOrder": 1,
        "options": [
          { "optionText": "@SpringBootApplication", "correct": true, "optionOrder": 1 },
          { "optionText": "@Configuration", "correct": false, "optionOrder": 2 },
          { "optionText": "@EnableAutoConfiguration", "correct": false, "optionOrder": 3 }
        ]
      }
    ]
  }
  ```
- **Expected Status:** `201 Created`

### 2.5 Toggle Publish Status (Admin Only)
- **Method:** `PATCH`
- **URL:** `{{base_url}}/quizzes/1/publish`
- **Headers:** `Authorization: Bearer {{admin_token}}`
- **Expected Status:** `200 OK`

---

## 3. Quiz Attempt & Scoring Endpoints (`/api/attempts`)

### 3.1 Start an Attempt (Student)
- **Method:** `POST`
- **URL:** `{{base_url}}/attempts/start/1`
- **Headers:** `Authorization: Bearer {{student_token}}`
- **Expected Status:** `200 OK`
- **Expected Behavior:** Creates or returns active `IN_PROGRESS` attempt with `attemptId` and `startedAt`.

### 3.2 Submit Quiz Answers (Student)
- **Method:** `POST`
- **URL:** `{{base_url}}/attempts/submit`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{student_token}}`
- **Request Body:**
  ```json
  {
    "attemptId": 1,
    "answers": [
      { "questionId": 1, "selectedOptionId": 1 },
      { "questionId": 2, "selectedOptionId": 6 }
    ]
  }
  ```
- **Expected Status:** `200 OK`
- **Expected Behavior:** Evaluates score strictly on server, returns calculated `score`, `totalMarks`, `percentage`, `correctAnswersCount`, and question breakdown.

### 3.3 Get Attempt Result
- **Method:** `GET`
- **URL:** `{{base_url}}/attempts/1/result`
- **Headers:** `Authorization: Bearer {{student_token}}`
- **Expected Status:** `200 OK`

### 3.4 Get Student Attempt History
- **Method:** `GET`
- **URL:** `{{base_url}}/attempts/history`
- **Headers:** `Authorization: Bearer {{student_token}}`
- **Expected Status:** `200 OK`

---

## 4. Analytics Endpoints (`/api/analytics`)

### 4.1 Student Performance Analytics
- **Method:** `GET`
- **URL:** `{{base_url}}/analytics/student`
- **Headers:** `Authorization: Bearer {{student_token}}`
- **Expected Status:** `200 OK`
- **Expected Behavior:** Returns `averageScorePercentage`, `bestScorePercentage`, `totalAttempts`, `scoreTrend` array, and `categoryPerformance` array for charting.

### 4.2 Platform Analytics (Admin Only)
- **Method:** `GET`
- **URL:** `{{base_url}}/analytics/admin`
- **Headers:** `Authorization: Bearer {{admin_token}}`
- **Expected Status:** `200 OK`
