# ========================================
# Auth Service Dockerfile
# ========================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy pre-built jar
COPY target/*.jar app.jar

# Expose port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -q --spider http://localhost:8081/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
