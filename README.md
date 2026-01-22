# DEVision Job Platform
This project originated as part of RMIT EEET2582 – Systems Architecture and Design, where development followed a squad-based team structure to simulate real-world software engineering environments.

In this course, students were organized into squads of 10, with each squad split into:

Job Manager team (5 students) – company-side recruitment management system

Job Applicant team (5 students) – applicant-facing job application platform

Both teams developed their subsystems independently while coordinating APIs, contracts, and integration so the two systems could communicate as a unified platform.

The initial Job Manager subsystem was built collaboratively by the Mulan – JobManager team under the course organization:

GitHub Organization: https://github.com/ISYS3461-2025C-Mulan-DEVision

Frontend repository: https://github.com/ISYS3461-2025C-Mulan-DEVision/JobManager_FE

Backend repository: https://github.com/ISYS3461-2025C-Mulan-DEVision/JobManager_BE

This repository represents my independent continuation and extension of the Job Manager system, including architectural improvements, new features, refactoring, production hardening, and ongoing maintenance.

## Overview

DEVision Job Platform is a full-stack, microservices-based recruitment management system. It enables company registration, job posting, applicant search, premium subscriptions, and real-time notifications. The platform leverages modern cloud-native technologies and is designed for scalability, modularity, and production deployment.

---

## Architecture

The system is split into two main parts:

- **Backend (JobManager_BE):**
    - Built with Java 21, Spring Boot 3.5.x, and Spring Cloud 2025.0.0
    - Microservices: Auth, Company, JobPost, Applicant Search, Subscription, Payment, Notification, API Gateway, Discovery (Eureka)
    - Each service uses its own PostgreSQL database (cloud-hosted via Neon)
    - Redis (Upstash) for caching/session, Kafka for async messaging, Docker for containerization
    - API Gateway as the single entry point
    - Service discovery via Eureka

- **Frontend (JobManager_FE):**
    - Built with React 19, TypeScript, Vite, and Tailwind CSS
    - Modular component architecture with headless UI patterns
    - State management via Redux Toolkit and Redux Saga
    - Axios for API calls, React Router for routing

---

## Key Features

- **Microservices**: Each business domain is a separate service, enabling independent scaling and deployment.
- **Database-per-service**: Every service has its own isolated PostgreSQL instance.
- **Authentication & Security**: JWT, OAuth2 (Google SSO), Spring Security.
- **Premium Subscriptions**: Stripe integration for payment processing.
- **Real-time Notifications**: Kafka-based event streaming, email notifications.
- **Applicant Search**: Full-text search and indexing.
- **Sharding-ready**: Architecture supports future database sharding for geo-distribution.
- **Cloud-Native**: Designed for AWS EC2 deployment, Dockerized for portability.

---

## Deployment & Infrastructure

- **Multi-EC2 Architecture**: Edge (public) and Core (private) separation for security and scalability.
- **Docker Compose**: Orchestrates all services locally and in production.
- **CI/CD**: GitHub Actions for automated build, Docker image push, and EC2 deployment.
- **Environment Variables**: All secrets/configs managed via `.env` files (see `.env.example` in JobManager_BE).

### Quick Start (Backend)

```bash
# Build all backend services
mvn clean package -DskipTests
# Start all containers
docker compose up -d --build
```

### Quick Start (Frontend)

```bash
# Install dependencies
cd JobManager_FE
npm install
# Start development server
npm run dev
```

---

## Project Structure

```
devision-job-platform/
├── JobManager_BE/   # Backend microservices (Java, Spring Boot)
│   ├── docker-compose.yaml
│   ├── pom.xml
│   ├── job-manager-auth/
│   ├── job-manager-company/
│   ├── job-manager-jobpost/
│   ├── job-manager-applicant-search/
│   ├── job-manager-subscription/
│   ├── job-manager-payment/
│   ├── job-manager-notification/
│   ├── job-manager-gateway/
│   └── job-manager-discovery/
├── JobManager_FE/   # Frontend (React, TypeScript)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Tech Stack

**Backend:**

- Java 21, Spring Boot 3.5.x, Spring Cloud 2025.0.0
- PostgreSQL (Neon cloud), Redis (Upstash), Kafka, Docker
- Maven, GitHub Actions (CI/CD)

**Frontend:**

- React 19, TypeScript, Vite, Tailwind CSS
- Redux Toolkit, Redux Saga, Axios, React Router

---

## API Gateway & Endpoints

All backend APIs are routed through the API Gateway (`http://localhost:8080`).

**Example Endpoints:**

- `POST /api/auth/register` – Register new company
- `POST /api/auth/login` – Login
- `GET /api/companies/{id}` – Get company details
- `POST /api/job-posts` – Create job post

See backend service READMEs and Postman collections for full API documentation.

---

## Development & Testing

**Backend:**

- Run services with Docker Compose or locally via Maven
- Each service has its own test suite (see `src/test/` in each microservice)
- Postman collections provided for API testing (see `job-manager-jobpost/JobPost_API.postman_collection.json`)

**Frontend:**

- Modular, scalable codebase with clear separation of concerns
- Headless UI pattern for reusable logic
- Path aliases for clean imports (see `tsconfig.json`)
- ESLint, Prettier, and Tailwind for code quality and styling

---

## Deployment

**Production deployment** is via Docker Compose on AWS EC2. See `JobManager_BE/DEPLOYMENT_PLAN.md` and `JobManager_BE/DEPLOYMENT_REVIEW.md` for detailed infrastructure and deployment strategies.

---

## Credits & License

- Original university group project (RMIT EEET2582)
- Independently extended and maintained by Hanh Do

---

For detailed service-level documentation, see the `README.md` files in each subproject.
