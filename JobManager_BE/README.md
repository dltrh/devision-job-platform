# Job Manager Backend

A microservices-based backend for the Job Manager application, built with Spring Boot and Spring Cloud.

## Architecture

| Service              | Port | Description                             |
| -------------------- | ---- | --------------------------------------- |
| Discovery Server     | 8761 | Eureka service registry                 |
| API Gateway          | 8080 | Single entry point for all API requests |
| Auth Service         | 8081 | Authentication and authorization        |
| Company Service      | 8082 | Company management                      |
| JobPost Service      | 8083 | Job posting management                  |
| Applicant Search     | 8084 | Applicant search and indexing           |
| Subscription Service | 8085 | Subscription management                 |
| Payment Service      | 8086 | Payment processing (Stripe)             |
| Notification Service | 8087 | Email notifications                     |

## Tech Stack

- **Java**: 21
- **Spring Boot**: 3.5.7
- **Spring Cloud**: 2025.0.0
- **Database**: Neon PostgreSQL (cloud)
- **Cache**: Upstash Redis (cloud)
- **Message Broker**: Apache Kafka
- **Containerization**: Docker

## Prerequisites

- Java 21
- Maven 3.8+
- Docker & Docker Compose
- A `.env` file with required environment variables (see `.env.example`)

## Quick Start (Docker)

Run all services with just two commands:

```bash
# Build all services
mvn clean package -DskipTests

# Start all containers
docker compose up -d --build
```

## Service Endpoints

| Endpoint         | URL                   |
| ---------------- | --------------------- |
| Eureka Dashboard | http://localhost:8761 |
| API Gateway      | http://localhost:8080 |
| Kafka UI         | http://localhost:8090 |

## Docker Commands

```bash
# Start all services
docker compose up -d --build

# View logs for a specific service
docker compose logs -f auth-service

# Stop all services
docker compose down

# Restart a specific service
docker compose restart gateway

# Check container status
docker compose ps
```

## Local Development (Without Docker)

If you prefer to run services locally without Docker:

1. **Start infrastructure** (Kafka):

   ```bash
   docker compose up -d zookeeper kafka
   ```

2. **Start Discovery Server first**:

   ```bash
   cd job-manager-discovery
   mvn spring-boot:run
   ```

3. **Start other services** (in separate terminals):
   ```bash
   cd job-manager-gateway && mvn spring-boot:run
   cd job-manager-auth && mvn spring-boot:run
   cd job-manager-company && mvn spring-boot:run
   # ... repeat for other services
   ```

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

### Required Variables

| Variable                                     | Description                          |
| -------------------------------------------- | ------------------------------------ |
| `NEON_USERNAME`, `NEON_PASSWORD`             | Neon PostgreSQL credentials          |
| `SHARD_*_URL`                                | Database shard URLs for auth service |
| `POSTGRES_*_URL`                             | Database URLs for other services     |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` | Upstash Redis config                 |
| `JWE_PRIVATE_KEY`, `JWE_PUBLIC_KEY`          | JWT encryption keys                  |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`   | OAuth2 credentials                   |
| `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`    | Stripe payment config                |
| `MAIL_USERNAME`, `MAIL_PASSWORD`             | Email service credentials            |

## Project Structure

```
JobManager_BE/
├── docker-compose.yaml          # Docker configuration
├── pom.xml                      # Parent POM
├── .env.example                 # Environment template
├── job-manager-discovery/       # Eureka server
├── job-manager-gateway/         # API Gateway
├── job-manager-auth/            # Auth service
├── job-manager-company/         # Company service
├── job-manager-jobpost/         # Job posting service
├── job-manager-applicant-search/# Applicant search service
├── job-manager-subscription/    # Subscription service
├── job-manager-payment/         # Payment service
└── job-manager-notification/    # Notification service
```

## API Documentation

All API requests should go through the API Gateway at `http://localhost:8080`.

### Authentication Endpoints (Public)

- `POST /api/auth/register` - Register new company
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Password reset request

### Protected Endpoints (Require Bearer Token)

- `GET /api/companies/{id}` - Get company details
- `PUT /api/companies/{id}` - Update company
- `GET /api/job-posts` - List job posts
- `POST /api/job-posts` - Create job post
- ... and more

## Troubleshooting

### Services not registering with Eureka

Wait 30-60 seconds after startup for services to register. Check the Eureka dashboard at http://localhost:8761.

### 401 Unauthorized errors

1. Ensure your `.env` file has valid JWT keys
2. Check that the auth-service is running and healthy
3. Verify the token is being sent in the `Authorization: Bearer <token>` header

### Database connection issues

Verify your Neon PostgreSQL URLs and credentials in the `.env` file.

### Kafka connection issues

Ensure Zookeeper and Kafka containers are healthy:

```bash
docker compose ps
docker compose logs kafka
```

## CI/CD Pipeline

The project uses GitHub Actions for automated deployment:

```
Push to main → Build Docker images → Push to Docker Hub → SSH to EC2 → Pull & Restart
```

### Setup Requirements

1. **Docker Hub**: Create repositories for each service
2. **EC2 Instance**: With Docker and Docker Compose installed
3. **GitHub Secrets**: Configure the following:

| Secret               | Description               |
| -------------------- | ------------------------- |
| `DOCKERHUB_USERNAME` | Your Docker Hub username  |
| `DOCKERHUB_TOKEN`    | Docker Hub access token   |
| `EC2_HOST`           | EC2 public IP or hostname |
| `EC2_USER`           | SSH user (e.g., `ubuntu`) |
| `EC2_SSH_KEY`        | Private SSH key for EC2   |

### Production Deployment

On your EC2 server:

```bash
# Create project directory
mkdir -p ~/job-manager
cd ~/job-manager

# Copy docker-compose.prod.yml and .env file
# Then set your Docker Hub username
export DOCKERHUB_USERNAME=your-username

# Pull and start services
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

To trigger deployment manually:

```bash
# On EC2
cd ~/job-manager
./scripts/deploy.sh
```
