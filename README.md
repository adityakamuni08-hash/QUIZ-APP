# QuizPulse • Quiz Application with Score Analysis

A full-stack web application that empowers students to take timed multiple-choice assessments, receive immediate automated server-side evaluation, and visualize their score progression over time through rich charts. Administrators get a complete authoring hub to create quizzes, configure marks, designate correct answers, and control publication.

---

## 1. Key Features

- **Online Assessment Engine:** Students browse published assessments by category, view question limits, and take interactive timed exams.
- **Active Exam Simulator:** Real-time countdown timer with visual status shifts (< 2 mins amber warning), a question navigator palette (jumping between questions, tracking answered vs unvisited), and automatic submission when time concludes.
- **Server-Side Scoring:** Answers are strictly validated and scored on the Spring Boot backend against database entities. Correct answer keys are **never** transmitted to students before submission.
- **Detailed Evaluation Reports:** Instant score breakdowns displaying marks obtained, total marks, percentage, correct/incorrect/unanswered counts, and a question-by-question review highlighting student choices vs correct answers.
- **Visual Score Analytics:** Built with **Recharts** to present chronological score trajectory charts (Area/Line) and comparative category proficiency charts (Bar) alongside personalized improvement insights.
- **Attempt History:** Comprehensive tracking of all past student attempts with status filters and quick review links.
- **Administrator Hub:** Full CRUD operations for quizzes, question bank management, marks allocation, correct answer designation, and instant toggle between Draft and Published states.
- **Role-Based Security:** Stateless JWT authentication separating `ROLE_STUDENT` and `ROLE_ADMIN` permissions on both the backend API and React frontend routing.
- **Pre-Seeded Demo Data:** Built-in `DataInitializer` that seeds verified demo accounts, sample quizzes, and historical attempts on startup for immediate demonstration.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19 (JavaScript)
- **Tooling:** Vite
- **Routing:** React Router v7
- **HTTP Client:** Centralized Axios with JWT interceptors
- **Visual Analytics & Charting:** Recharts
- **Icons:** Lucide React
- **Styling:** Vanilla CSS design system with custom properties, glassmorphism, and responsive grid layouts

### Backend
- **Language & Runtime:** Java 17 (Adoptium / HotSpot)
- **Framework:** Spring Boot 4.1.x
- **Persistence:** Spring Data JPA / Hibernate
- **Security:** Spring Security with stateless JWT (`jjwt` 0.12.6) and BCrypt password encryption
- **Validation:** Bean Validation (`jakarta.validation`)
- **Build Tool:** Maven (via `mvnw` / `mvnw.cmd` wrapper — no local Maven install required)
- **Testing:** Spring Boot Starter Test, JUnit Jupiter, Mockito, H2 in-memory test database

### Database
- **Production & Local Dev:** MySQL Server 8.0 (default database: `quizapp`)
- **Automated Tests:** In-memory H2 database (non-destructive)

---

## 3. Pre-Configured Demo Credentials

The database automatically seeds the following accounts on first startup:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@quizapp.com` | `AdminPassword123!` |
| **Student** | `student@quizapp.com` | `StudentPassword123!` |

*(One-click demo login buttons are also provided directly on the Login page and Landing page.)*

---

## 4. Prerequisites

Verify that the following tools are installed on your machine:
- **Java:** JDK 17 or higher
- **Node.js:** v20.x or higher (includes `npm`)
- **MySQL Server:** 8.0 running locally on port `3306`

---

## 5. Local Setup & Running Instructions

### Step 1: Database Setup
Ensure your local MySQL service is running:
```powershell
# In Windows PowerShell, verify MySQL service status:
Get-Service *mysql*
```
By default, the backend connects to `jdbc:mysql://localhost:3306/quizapp`. The database and schema are **created automatically** on startup if your MySQL user has the appropriate permissions.

If your local MySQL root password is not `root`, set the environment variable before starting the backend:
```powershell
$env:SPRING_DATASOURCE_PASSWORD="your_mysql_password"
```

### Step 2: Start the Backend (Spring Boot)
Navigate to the backend directory and run the Maven wrapper:
```powershell
cd C:\Aditya_Project\backend
.\mvnw.cmd spring-boot:run
```
The backend server will start on **`http://localhost:8080`**.

> **Tip:** You'll see `DataInitializer` log lines confirming that demo accounts and sample quizzes were seeded.

### Step 3: Start the Frontend (React + Vite)
In a **separate terminal**, navigate to the frontend directory:
```powershell
cd C:\Aditya_Project\frontend
npm install
npm run dev
```
The React development server will start on **`http://localhost:5173`**.

Open your browser and navigate to `http://localhost:5173`.

---

## 6. Running Automated Tests

To execute the backend automated test suite:
```powershell
cd C:\Aditya_Project\backend
.\mvnw.cmd test
```
*All unit and service integration tests run against an isolated in-memory H2 database and do not touch your MySQL instance.*

To verify the frontend production build:
```powershell
cd C:\Aditya_Project\frontend
npm run build
```

---

## 7. Deploying the Backend on Render

### Required Environment Variables

When creating a **Web Service** on Render for the backend, set the following environment variables in the Render dashboard under **Environment → Environment Variables**:

| Key | Value / Description |
| :--- | :--- |
| `SPRING_DATASOURCE_URL` | Your MySQL connection string — e.g. `jdbc:mysql://your-db-host:3306/quizapp?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true` |
| `SPRING_DATASOURCE_USERNAME` | Your MySQL database username (e.g. `quizapp_user`) |
| `SPRING_DATASOURCE_PASSWORD` | Your MySQL database password |
| `JWT_SECRET` | A long random hex string — generate one with: `openssl rand -hex 32` |
| `JWT_EXPIRATION_MS` | Token expiry in milliseconds — `86400000` = 24 hours |
| `PORT` | Render sets this automatically — **do NOT set this manually** |

### Render Build & Start Settings

| Setting | Value |
| :--- | :--- |
| **Runtime** | `Java` |
| **Build Command** | `./mvnw package -DskipTests` |
| **Start Command** | `java -jar target/quiz_application-0.0.1-SNAPSHOT.jar` |
| **Root Directory** | `backend` |

### MySQL Database on Render (or PlanetScale / Railway)

Render provides a managed **MySQL** add-on (or you can use PlanetScale / Railway for free tiers). Once your database is provisioned:
1. Copy the **internal connection string** for the service on Render, or the external hostname for PlanetScale/Railway.
2. Set `SPRING_DATASOURCE_URL` to that connection string.
3. Set `SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD` to match.

> **Note:** On first start the application will auto-create all tables (`spring.jpa.hibernate.ddl-auto=update`) and seed the demo admin + student accounts via `DataInitializer`.

### Frontend Deployment (Vercel / Netlify)

After deploying the backend, set the frontend environment variable in your Vercel/Netlify project:

| Key | Value |
| :--- | :--- |
| `VITE_API_BASE_URL` | `https://your-render-service-name.onrender.com/api` |

Then build the frontend:
```bash
npm run build
```
Deploy the `dist/` folder to Vercel or Netlify.

---

## 8. REST API Overview

Base URL: `http://localhost:8080/api`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Authenticate user and obtain JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `GET` | `/api/quizzes/published` | Authenticated | List published quizzes for students |
| `GET` | `/api/quizzes/{id}/take` | Authenticated | Get quiz for examination (correct answers excluded) |
| `GET` | `/api/quizzes` | Admin | List all quizzes (including drafts) |
| `POST` | `/api/quizzes` | Admin | Create a new quiz with questions |
| `PUT` | `/api/quizzes/{id}` | Admin | Update quiz details |
| `DELETE` | `/api/quizzes/{id}` | Admin | Delete a quiz |
| `PATCH` | `/api/quizzes/{id}/publish` | Admin | Toggle published/draft status |
| `POST` | `/api/attempts/start/{quizId}` | Student | Initiate a quiz attempt |
| `POST` | `/api/attempts/submit` | Student | Submit selected answers for scoring |
| `GET` | `/api/attempts/{id}/result` | Student/Admin | View attempt evaluation and answer review |
| `GET` | `/api/attempts/history` | Student | List student's past attempts |
| `GET` | `/api/analytics/student` | Student | Get accuracy metrics, score trend, and category data |
| `GET` | `/api/analytics/admin` | Admin | Get platform-wide quiz statistics |

---

## 9. Project Structure

```
Aditya_Project/
├── backend/                         ← Spring Boot Maven project (root = pom.xml)
│   ├── src/main/java/com/example/quiz_application/
│   │   ├── config/          # SecurityConfig, DataInitializer, CORS
│   │   ├── controller/      # REST Endpoints (Auth, Quiz, Attempt, Analytics)
│   │   ├── dto/             # Request & Response Data Transfer Objects
│   │   ├── entity/          # JPA Entities (User, Quiz, Question, Attempt, …)
│   │   ├── exception/       # Global Exception Handler & Custom Errors
│   │   ├── repository/      # Spring Data JPA Repositories
│   │   ├── security/        # JWT Provider, Auth Filter, UserDetails
│   │   └── service/         # Business Logic, Scoring, Analytics
│   ├── src/main/resources/
│   │   └── application.properties   # All config via env-var with local fallbacks
│   ├── src/test/java/               # JUnit + Mockito test suites (H2 in-memory)
│   ├── pom.xml
│   └── mvnw / mvnw.cmd              # Maven wrapper (no local Maven required)
├── frontend/                        ← React + Vite project
│   ├── src/
│   │   ├── api/             # Centralized Axios client & all endpoint calls
│   │   ├── components/      # Navbar, Footer, ProtectedRoute, AdminRoute
│   │   ├── context/         # AuthContext — JWT token & user state
│   │   ├── pages/           # LandingPage, Login, Register, Dashboards,
│   │   │                    #   QuizTake, QuizResult, ScoreAnalysis, AttemptHistory,
│   │   │                    #   AdminDashboard, AdminQuizEditor, NotFoundPage
│   │   ├── App.jsx          # React Router route definitions
│   │   └── index.css        # Complete design system (custom properties, animations)
│   ├── .env                 # VITE_API_BASE_URL (not committed — see .env.example)
│   ├── package.json
│   └── vite.config.js
├── .env.example                     # Template for required environment variables
├── .gitignore
├── api_testing_checklist.md         # Postman / Thunder Client API testing guide
└── README.md
```
