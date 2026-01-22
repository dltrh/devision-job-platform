# DEVision Job Platform

A **cloud-native, microservices-based recruitment management platform** for companies to post jobs, manage applicants, purchase subscriptions, and receive real-time notifications.

Originally created as part of **RMIT EEET2582 – Systems Architecture & Design**, this repository now represents my **independent continuation, refactoring, and production-focused extension** of the system.

> **Focus areas:** scalable architecture, service isolation, event-driven design, and production deployment practices.

---

# Project Background

The original system was developed in a **squad-based engineering format** designed to simulate real-world team structures.

Each squad consisted of:

- **5 engineers — Job Manager (company platform)**
- **5 engineers — Job Applicant (candidate platform)**

Both teams developed their subsystems independently while coordinating API contracts and integrations to form a unified ecosystem.

This repository continues the **Job Manager subsystem**, extended and maintained independently.

### Original repositories

- Organization: https://github.com/ISYS3461-2025C-Mulan-DEVision  
- Frontend: https://github.com/ISYS3461-2025C-Mulan-DEVision/JobManager_FE  
- Backend: https://github.com/ISYS3461-2025C-Mulan-DEVision/JobManager_BE  

---

# Architecture Overview

## System Style

- Microservices
- Database-per-service
- Event-driven communication (Kafka)
- API Gateway pattern
- Service discovery (Eureka)

## High-Level Design

```
Client (React)
      ↓
API Gateway
      ↓
Independent Spring Boot Services
      ↓
PostgreSQL (per service) + Redis + Kafka
```

---

# Tech Stack

## Backend

- Java 21
- Spring Boot 3.5.x
- Spring Cloud 2025
- PostgreSQL (Neon)
- Redis (Upstash)
- Kafka
- Docker
- Maven
- GitHub Actions (CI/CD)

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Redux Toolkit + Redux Saga
- Axios
- React Router

---

# Core Features

## Platform

- Company registration & authentication (JWT + OAuth2 Google SSO)
- Job posting & management
- Applicant search with full-text indexing
- Subscription tiers & premium features
- Stripe payment integration
- Real-time notifications (Kafka + email)

## Engineering

- Independent service scaling
- Database isolation per service
- Asynchronous messaging
- Cloud deployment ready
- Dockerized infrastructure
- CI/CD automated builds & deployments
- Sharding-ready design for future geo scaling

---

# Services

| Service | Responsibility |
|--------|---------------|
| Auth | Authentication, JWT, OAuth2 |
| Company | Company profiles & management |
| JobPost | Job creation & lifecycle |
| Applicant Search | Search & indexing |
| Subscription | Plans & feature gating |
| Payment | Stripe integration |
| Notification | Email & event notifications |
| Gateway | Routing & entry point |
| Discovery | Service registry (Eureka) |

---

# Repository Structure

```
devision-job-platform/
├── JobManager_BE/     # Spring Boot microservices
├── JobManager_FE/     # React frontend
└── README.md
```

---

# Local Development

## Backend

```bash
mvn clean package -DskipTests
docker compose up -d --build
```

API Gateway:
```
http://localhost:8080
```

---

## Frontend

```bash
cd JobManager_FE
npm install
npm run dev
```

---

# Deployment

Production deployment uses:

- Docker Compose
- AWS EC2 (Edge + Core separation)
- Neon PostgreSQL (managed)
- Upstash Redis
- GitHub Actions CI/CD

See:

- `JobManager_BE/DEPLOYMENT_PLAN.md`
- `JobManager_BE/DEPLOYMENT_REVIEW.md`

---

# Engineering Highlights

Key improvements and extensions made in this continuation:

- Refactored services for clearer domain boundaries
- Hardened configuration & environment management
- Improved Docker orchestration
- Added production-ready deployment pipeline
- Enhanced scalability and modularity
- Cleaned frontend architecture & state management
- Added payment + subscription workflow
- Improved reliability with async messaging

---

# Attribution

This project originated from a university squad project at **RMIT University**.

The initial implementation was developed collaboratively by the **Mulan – JobManager team**.  
All ongoing development, enhancements, and maintenance in this repository are independently implemented by **Hanh Do**.

---

# License

For educational and portfolio use.
