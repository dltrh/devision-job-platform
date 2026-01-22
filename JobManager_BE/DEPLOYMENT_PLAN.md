# Multi-Machine Deployment Plan for JobManager

## Overview

This document outlines the architecture and deployment strategy for hosting the JobManager microservices across **2 EC2 machines** with optimized separation of concerns.

## Infrastructure Specifications

**AMI**: Amazon Linux  
**Java Version**: 21  
**Build Tool**: Maven  
**Build Command**: `mvn clean package -DskipTests`  
**Artifact Type**: Fat JAR  
**VPC**: Default VPC

---

## Architecture Summary

### Machine 1: **Edge & Control Plane** (Public-Facing)

**Purpose**: Public-facing services, traffic management, and service orchestration  
**Network**: Default VPC - Public subnet with Public IPv4 enabled  
**Role**: Frontend, API Gateway, Service Discovery

### Machine 2: **Core Application Plane** (Private)

**Purpose**: Business logic, data processing, and infrastructure services  
**Network**: Default VPC - Private subnet (No public IP assigned)  
**Role**: Microservices, Databases, Message Queue, Cache

---

## Detailed Service Distribution

### EC2-1: Edge & Control Plane

| Service              | Port    | Purpose                                  | Image                 |
| -------------------- | ------- | ---------------------------------------- | --------------------- |
| **Frontend**         | 80, 443 | React application (Nginx)                | `jm-frontend:latest`  |
| **API Gateway**      | 8080    | Central entry point for all API requests | `jm-gateway:latest`   |
| **Discovery Server** | 8761    | Eureka service registry                  | `jm-discovery:latest` |

**Name:** mulan-jobmanager-edge-prod

**Key name:** ultimo.pem

**Responsibilities:**

-   Handle all incoming HTTP/HTTPS requests
-   SSL termination
-   Load balancing and routing
-   Service discovery and health monitoring
-   Authentication token validation (via gateway)

**Resource Requirements:**

-   **Actual**: m7i-flex.large (2 vCPU, 8GB RAM)
-   **Storage**: 30GB gp3 SSD

---

### EC2-2: Core Application Plane

**Name:** mulan-jobmanager-core-prod

**Key name:** ultimo.pem

#### A. Microservices

| Service                  | Port | Database                       | Image                        |
| ------------------------ | ---- | ------------------------------ | ---------------------------- |
| **Auth Service**         | 8081 | postgres-auth:5432             | `jm-auth:latest`             |
| **Company Service**      | 8082 | postgres-company:5432          | `jm-company:latest`          |
| **JobPost Service**      | 8083 | postgres-jobpost:5432          | `jm-jobpost:latest`          |
| **Applicant Search**     | 8084 | postgres-applicant-search:5432 | `jm-applicant-search:latest` |
| **Subscription Service** | 8085 | postgres-subscription:5432     | `jm-subscription:latest`     |
| **Payment Service**      | 8086 | postgres-payment:5432          | `jm-payment:latest`          |
| **Notification Service** | 8087 | postgres-notification:5432     | `jm-notification:latest`     |

#### B. Infrastructure Services

| Service       | Port | Purpose                           |
| ------------- | ---- | --------------------------------- |
| **Zookeeper** | 2181 | Kafka coordination                |
| **Kafka**     | 9092 | Event streaming & async messaging |
| **Redis**     | 6379 | Caching & session management      |

#### C. Databases (PostgreSQL)

| Database          | Container                 | Data Volume                    |
| ----------------- | ------------------------- | ------------------------------ |
| authdb            | postgres-auth             | postgres-auth-data             |
| companydb         | postgres-company          | postgres-company-data          |
| jobpostdb         | postgres-jobpost          | postgres-jobpost-data          |
| applicantsearchdb | postgres-applicant-search | postgres-applicant-search-data |
| subscriptiondb    | postgres-subscription     | postgres-subscription-data     |
| paymentdb         | postgres-payment          | postgres-payment-data          |
| notificationdb    | postgres-notification     | postgres-notification-data     |

**Resource Requirements:**

-   **Actual**: m7i-flex.large (2 vCPU, 8GB RAM)
-   **Storage**: 30GB gp3 SSD + Docker volumes for databases
-   **⚠️ WARNING**: This configuration may be insufficient for 7 microservices + infrastructure
-   **Recommended Minimum**: m7i-flex.xlarge or m7i-flex.2xlarge for production workloads

---

## Network Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Internet                              │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ HTTPS/HTTP
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  EC2-1 (Public)                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Frontend (Nginx)         :80, :443              │   │
│  └──────────────────┬───────────────────────────────┘   │
│                     │                                    │
│  ┌──────────────────▼───────────────────────────────┐   │
│  │  API Gateway              :8080                   │   │
│  └──────────────────┬───────────────────────────────┘   │
│                     │                                    │
│  ┌──────────────────▼───────────────────────────────┐   │
│  │  Discovery Server (Eureka)  :8761                │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Network: jm-edge-network                                │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ Private IP Communication
                     │
┌────────────────────▼─────────────────────────────────────┐
│                  EC2-2 (Private)                          │
│                                                           │
│  ┌─────────────────────────────────────────────────┐     │
│  │  Microservices Layer                            │     │
│  │  ┌───────────┐ ┌───────────┐ ┌──────────────┐  │     │
│  │  │   Auth    │ │  Company  │ │   JobPost    │  │     │
│  │  │   :8081   │ │   :8082   │ │    :8083     │  │     │
│  │  └─────┬─────┘ └─────┬─────┘ └──────┬───────┘  │     │
│  │  ┌─────▼─────┐ ┌─────▼─────┐ ┌──────▼───────┐  │     │
│  │  │  Search   │ │Applicant  │ │ Subscription │  │     │
│  │  │   :8084   │ │   :8085   │ │    :8086     │  │     │
│  │  └─────┬─────┘ └─────┬─────┘ └──────┬───────┘  │     │
│  │  ┌─────▼─────┐ ┌─────▼─────┐ ┌──────▼───────┐  │     │
│  │  │  Payment  │ │Notification│ │   Premium    │  │     │
│  │  │   :8087   │ │   :8088   │ │    :8089     │  │     │
│  │  └───────────┘ └───────────┘ └──────────────┘  │     │
│  └──────────────────────┬──────────────────────────┘     │
│                         │                                │
│  ┌──────────────────────▼──────────────────────────┐     │
│  │  Infrastructure Layer                           │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │     │
│  │  │  Kafka   │  │  Redis   │  │  Zookeeper   │  │     │
│  │  │  :9092   │  │  :6379   │  │    :2181     │  │     │
│  │  └──────────┘  └──────────┘  └──────────────┘  │     │
│  └──────────────────────┬──────────────────────────┘     │
│                         │                                │
│  ┌──────────────────────▼──────────────────────────┐     │
│  │  Database Layer (PostgreSQL 16)                 │     │
│  │  ┌─────────┐┌─────────┐┌────────┐┌─────────┐   │     │
│  │  │ auth-db ││comp-db  ││job-db  ││srch-db  │   │     │
│  │  └─────────┘└─────────┘└────────┘└─────────┘   │     │
│  │  ┌─────────┐┌─────────┐┌────────┐┌─────────┐   │     │
│  │  │ appl-db ││subs-db  ││pay-db  ││notif-db │   │     │
│  │  └─────────┘└─────────┘└────────┘└─────────┘   │     │
│  └─────────────────────────────────────────────────┘     │
│                                                           │
│  Network: jm-core-network                                 │
└───────────────────────────────────────────────────────────┘
```

---

## Communication Flow

### 1. External Request Flow

```
User → HTTPS (443) → EC2-1 Frontend → API Gateway (8080)
     → EC2-1 Gateway checks Eureka → Routes to EC2-2 Service
     → EC2-2 Microservice processes → Returns response
```

### 2. Inter-Service Communication

```
EC2-2 Service A → Kafka (async) → EC2-2 Service B
EC2-2 Service A → Direct HTTP (sync) → EC2-2 Service B
EC2-2 Service → Redis → Cache Hit/Miss → PostgreSQL
```

### 3. Service Discovery

```
EC2-2 Services → Register → EC2-1 Eureka (8761)
EC2-1 Gateway → Query → EC2-1 Eureka → Get Service Location
EC2-1 Gateway → Route → EC2-2 Service (Private IP)
```

---

## Configuration Requirements

### Environment Variables (Required in .env)

#### EC2-1 Configuration

```bash
# Docker Hub
DOCKERHUB_USERNAME=hanhdau
IMAGE_TAG=latest

# EC2-2 Private IP (for service communication)
EC2_2_PRIVATE_IP=10.0.2.x

# OAuth Configuration
OAUTH2_REDIRECT_URI=https://your-domain.com/oauth2/callback

# Frontend
VITE_API_GATEWAY_URL=http://52.76.250.138:8080
```

#### EC2-2 Configuration

```bash
# Docker Hub
DOCKERHUB_USERNAME=hanhdau
IMAGE_TAG=latest

# EC2-1 Private IP (for Eureka registration)
EC2_1_PRIVATE_IP=10.0.1.x

# Database Credentials
AUTH_DB_NAME=authdb
AUTH_DB_USER=authuser
AUTH_DB_PASSWORD=<secure-password>

COMPANY_DB_NAME=companydb
COMPANY_DB_USER=companyuser
COMPANY_DB_PASSWORD=<secure-password>

JOBPOST_DB_NAME=jobpostdb
JOBPOST_DB_USER=jobpostuser
JOBPOST_DB_PASSWORD=<secure-password>

APPLICANT_SEARCH_DB_NAME=applicantsearchdb
APPLICANT_SEARCH_DB_USER=applicantsearchuser
APPLICANT_SEARCH_DB_PASSWORD=<secure-password>

SUBSCRIPTION_DB_NAME=subscriptiondb
SUBSCRIPTION_DB_USER=subscriptionuser
SUBSCRIPTION_DB_PASSWORD=<secure-password>

PAYMENT_DB_NAME=paymentdb
PAYMENT_DB_USER=paymentuser
PAYMENT_DB_PASSWORD=<secure-password>

NOTIFICATION_DB_NAME=notificationdb
NOTIFICATION_DB_USER=notificationuser
NOTIFICATION_DB_PASSWORD=<secure-password>

# Redis
REDIS_PASSWORD=<secure-password>

# OAuth
OAUTH2_REDIRECT_URI=https://your-domain.com/oauth2/callback
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## Security Configuration

### AWS Security Groups

#### EC2-1 Security Group (Public)

**Inbound Rules:**
| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| HTTP | TCP | 80 | 0.0.0.0/0 | Public web traffic |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Secure web traffic |
| SSH | TCP | 22 | 0.0.0.0/0 | Admin access |
| Custom TCP | TCP | 8080 | 0.0.0.0/0 | API Gateway |
| Custom TCP | TCP | 8761 | CORE-SG | Eureka from CORE |

**Outbound Rules:**
| Type | Protocol | Port | Destination | Description |
|------|----------|------|-------------|-------------|
| All Traffic | All | All | 0.0.0.0/0 | All outbound traffic allowed |

#### EC2-2 Security Group (Private)

**Inbound Rules:**
| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| Custom TCP | TCP | 8000-8100 | EDGE-SG | Spring microservices from EDGE |
| SSH | TCP | 22 | 0.0.0.0/0 | Admin access |

**Outbound Rules:**
| Type | Protocol | Port | Destination | Description |
|------|----------|------|-------------|-------------|
| All Traffic | All | All | 0.0.0.0/0 | All outbound traffic allowed |

---

## Build Process

All microservices are built using Maven and packaged as fat JARs:

```bash
# Build command for each service
mvn clean package -DskipTests

# Artifact output
target/<service-name>-0.0.1-SNAPSHOT.jar
```

Docker images are created from these fat JARs and pushed to Docker Hub.

---

## Deployment Steps

### Prerequisites

1. Two EC2 instances provisioned:
    - **EDGE**: m7i-flex.large, Amazon Linux, Public subnet, Public IPv4
    - **CORE**: m7i-flex.large, Amazon Linux, Private subnet, No public IP
2. Java 21 installed on both machines
3. Docker and Docker Compose installed on both machines
4. Git repository access configured
5. `.env` file configured on both machines
6. Docker Hub credentials configured

### Step 1: Deploy EC2-2 (Core Services First)

```bash
# SSH to EC2-2
ssh -i your-key.pem ubuntu@<EC2-2-IP>

# Clone repository
cd /home/ubuntu
git clone https://github.com/your-org/JobManager_BE.git job-manager
cd job-manager

# Checkout deployment branch
git checkout production

# Configure environment
cp .env.example .env
nano .env  # Edit with EC2-2 configuration

# Login to Docker Hub
docker login

# Make scripts executable
chmod +x scripts/*.sh

# Deploy
./scripts/deploy-ec2-core.sh
```

**Verify EC2-2 Services:**

```bash
# Check all containers are running
docker compose -f docker-compose.ec2-core.yml ps

# Check logs
docker compose -f docker-compose.ec2-core.yml logs -f auth-service
docker compose -f docker-compose.ec2-core.yml logs -f kafka

# Test database connections
docker exec -it jm-postgres-auth psql -U authuser -d authdb -c "SELECT 1;"
```

### Step 2: Deploy EC2-1 (Edge Services)

```bash
# SSH to EC2-1
ssh -i your-key.pem ubuntu@<EC2-1-IP>

# Clone repository
cd /home/ubuntu
git clone https://github.com/your-org/JobManager_BE.git job-manager
cd job-manager

# Checkout deployment branch
git checkout production

# Configure environment (with EC2-2 private IP)
cp .env.example .env
nano .env  # Edit with EC2-1 configuration

# Login to Docker Hub
docker login

# Make scripts executable
chmod +x scripts/*.sh

# Deploy
./scripts/deploy-ec2-edge.sh
```

**Verify EC2-1 Services:**

```bash
# Check containers
docker compose -f docker-compose.ec2-edge.yml ps

# Test Eureka
curl http://localhost:8761/actuator/health

# Test Gateway
curl http://localhost:8080/actuator/health

# Test Frontend
curl http://localhost/
```

### Step 3: End-to-End Testing

```bash
# From your local machine or EC2-1

# Check service registration
curl http://<EC2-1-PUBLIC-IP>:8761/eureka/apps | grep -i status

# Test API through Gateway
curl http://<EC2-1-PUBLIC-IP>:8080/api/auth/health
curl http://<EC2-1-PUBLIC-IP>:8080/api/company/health
curl http://<EC2-1-PUBLIC-IP>:8080/api/jobpost/health

# Access Frontend
open http://<EC2-1-PUBLIC-IP>
```

---

## Monitoring & Maintenance

### Health Check Endpoints

All services expose Spring Boot Actuator endpoints:

-   `http://<service>:<port>/actuator/health` - Service health
-   `http://<service>:<port>/actuator/info` - Service info
-   `http://localhost:8761/` - Eureka dashboard (EC2-1)

### Logging

Logs are stored in JSON format with rotation:

-   **Max Size**: 10MB per file
-   **Max Files**: 3 files kept
-   **Location**: Docker container logs

View logs:

```bash
# EC2-1 (Edge)
docker compose -f docker-compose.ec2-edge.yml logs -f [service-name]

# EC2-2 (Core)
docker compose -f docker-compose.ec2-core.yml logs -f [service-name]
```

### Database Backups

```bash
# Backup script (run on EC2-2)
#!/bin/bash
BACKUP_DIR="/backup/postgres"
DATE=$(date +%Y%m%d_%H%M%S)

databases=("authdb" "companydb" "jobpostdb" "applicantsearchdb"
           "subscriptiondb" "paymentdb" "notificationdb")

for db in "${databases[@]}"; do
    docker exec jm-postgres-${db%-db} pg_dump -U ${db}user ${db} > \
        ${BACKUP_DIR}/${db}_${DATE}.sql
done
```

### Monitoring Tools (Recommended)

1. **Prometheus + Grafana** - Metrics collection and visualization
2. **ELK Stack** - Centralized logging
3. **AWS CloudWatch** - EC2 and application monitoring
4. **PagerDuty/OpsGenie** - Alerting

---

## Scaling Strategies

### Vertical Scaling

1. **EC2-1**: Upgrade to c6i.large for better network performance
2. **EC2-2**: Upgrade to r6i.2xlarge for memory-intensive workloads

### Horizontal Scaling

1. **Add EC2-3**: Duplicate EC2-2 for active-active setup
    - Use load balancer between EC2-2 and EC2-3
    - Separate databases or implement read replicas
2. **Database Sharding**: Already prepared in codebase
    - Geographical sharding by Country enum
    - Shard keys defined in auth service
3. **Service-Level Scaling**:
    - Run multiple instances of high-traffic services
    - Use Docker Swarm or Kubernetes for orchestration

---

## Disaster Recovery

### Backup Strategy

1. **Daily**: PostgreSQL database dumps
2. **Weekly**: Full system snapshots (EBS)
3. **Monthly**: Long-term archive to S3

### Recovery Plan

1. **Service Failure**: Docker restart policies handle container crashes
2. **EC2-1 Failure**:
    - DNS failover to backup EC2-1
    - Restore from latest image
3. **EC2-2 Failure**:
    - Provision new EC2-2
    - Restore database from latest backup
    - Deploy services
4. **Database Corruption**:
    - Restore from latest backup
    - Replay Kafka events if available

---

## Cost Optimization

### Current Estimated Monthly Cost (AWS US-East-1)

| Resource      | Type       | Cost            |
| ------------- | ---------- | --------------- |
| EC2-1         | t3.large   | ~$60            |
| EC2-2         | t3.2xlarge | ~$245           |
| EBS Volumes   | 130GB gp3  | ~$13            |
| Data Transfer | 100GB      | ~$9             |
| **Total**     |            | **~$327/month** |

### Optimization Tips

1. Use **Reserved Instances** (1-year) for 40% savings
2. Use **Spot Instances** for non-production environments (up to 90% savings)
3. Implement **Auto Scaling** to reduce off-peak costs
4. Use **S3 for logs** instead of EBS volumes
5. Optimize **Docker images** to reduce pull costs

---

## Troubleshooting Guide

### Common Issues

#### 1. Services Can't Register with Eureka

**Symptom**: Services on EC2-2 not appearing in Eureka dashboard

**Solution**:

```bash
# Check EC2_1_PRIVATE_IP is set correctly
echo $EC2_1_PRIVATE_IP

# Verify network connectivity
curl http://${EC2_1_PRIVATE_IP}:8761/eureka/apps

# Check security group allows port 8761
```

#### 2. Gateway Can't Route to Services

**Symptom**: 503 Service Unavailable from Gateway

**Solution**:

```bash
# Check service health
curl http://${EC2_2_PRIVATE_IP}:8081/actuator/health

# Verify Gateway can resolve service names
docker exec -it jm-gateway nslookup auth-service

# Check Eureka registration
curl http://localhost:8761/eureka/apps/AUTH-SERVICE
```

#### 3. Database Connection Failures

**Symptom**: Services fail to start with DB connection errors

**Solution**:

```bash
# Verify database is running
docker ps | grep postgres

# Test connection from service container
docker exec -it jm-auth-service nc -zv postgres-auth 5432

# Check credentials match
docker exec -it jm-postgres-auth psql -U authuser -d authdb
```

#### 4. Kafka Connection Issues

**Symptom**: Services can't publish/consume events

**Solution**:

```bash
# Check Kafka is healthy
docker exec -it jm-kafka kafka-broker-api-versions \
    --bootstrap-server localhost:9092

# Verify Zookeeper is running
docker exec -it jm-zookeeper nc -zv localhost 2181

# List topics
docker exec -it jm-kafka kafka-topics --list \
    --bootstrap-server localhost:9092
```

---

## Next Steps & Recommendations

### Immediate Actions (Week 1)

-   [ ] Provision EC2 instances with correct sizes
-   [ ] Configure security groups as specified
-   [ ] Set up VPC and subnets (if not already done)
-   [ ] Deploy to EC2-2 first, verify all services healthy
-   [ ] Deploy to EC2-1, verify connectivity
-   [ ] Run end-to-end tests

### Short-term Improvements (Week 2-4)

-   [ ] Set up SSL/TLS certificates (Let's Encrypt or ACM)
-   [ ] Configure domain name and Route53
-   [ ] Implement database backup automation
-   [ ] Set up basic CloudWatch monitoring
-   [ ] Configure log aggregation

### Medium-term Enhancements (Month 2-3)

-   [ ] Implement sharding as documented in codebase
-   [ ] Add read replicas for high-traffic databases
-   [ ] Set up CI/CD pipeline (GitHub Actions)
-   [ ] Implement comprehensive monitoring (Prometheus + Grafana)
-   [ ] Add API rate limiting and DDoS protection

### Long-term Strategy (3-6 months)

-   [ ] Migrate to Kubernetes for better orchestration
-   [ ] Implement multi-region deployment
-   [ ] Add CDN for frontend assets
-   [ ] Implement advanced observability (distributed tracing)
-   [ ] Optimize costs with auto-scaling and reserved instances

---

## Support & Contacts

### Documentation

-   Architecture Report: `sharding_feature_implementation_report.md`
-   API Documentation: Postman collection in each service folder
-   Testing Guide: `TESTING_SETUP_GUIDE.md`

### Useful Commands Cheat Sheet

```bash
# EC2-1 (Edge) Commands
docker compose -f docker-compose.ec2-edge.yml up -d
docker compose -f docker-compose.ec2-edge.yml down
docker compose -f docker-compose.ec2-edge.yml logs -f gateway
docker compose -f docker-compose.ec2-edge.yml restart discovery-server

# EC2-2 (Core) Commands
docker compose -f docker-compose.ec2-core.yml up -d
docker compose -f docker-compose.ec2-core.yml down
docker compose -f docker-compose.ec2-core.yml logs -f auth-service
docker compose -f docker-compose.ec2-core.yml restart kafka

# Health Checks
curl http://localhost:8761/actuator/health  # Eureka (EC2-1)
curl http://localhost:8080/actuator/health  # Gateway (EC2-1)
curl http://localhost:8081/actuator/health  # Auth (EC2-2)

# Database Access
docker exec -it jm-postgres-auth psql -U authuser -d authdb
docker exec -it jm-postgres-company psql -U companyuser -d companydb

# Kafka Management
docker exec -it jm-kafka kafka-topics --list --bootstrap-server localhost:9092
docker exec -it jm-kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic your-topic

# Cleanup
docker system prune -a --volumes  # WARNING: Removes all unused data
docker volume ls  # List all volumes
docker network ls  # List all networks
```

---

**Last Updated**: January 12, 2026  
**Version**: 1.0  
**Branch**: production
