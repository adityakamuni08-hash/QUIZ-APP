# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and pom first (layer cache — only re-downloads deps when pom changes)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -q

# Copy source and build the JAR
COPY src ./src
RUN ./mvnw package -DskipTests -q

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy only the built JAR from the builder stage
COPY --from=builder /app/target/quiz_application-0.0.1-SNAPSHOT.jar app.jar

# Expose the port Spring Boot listens on (Render injects $PORT)
EXPOSE 8080

# Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]
