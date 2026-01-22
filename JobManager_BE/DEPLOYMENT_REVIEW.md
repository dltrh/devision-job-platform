# Deployment Configuration Review
**Date**: January 12, 2026  
**Reviewed Against**: AWS Infrastructure Specifications

---

## Executive Summary

✅ **Overall Assessment**: Configuration is mostly aligned with specifications with **critical resource constraint warnings**

⚠️ **Critical Issue**: m7i-flex.large (8GB RAM) may be insufficient for CORE instance workload

---

## Infrastructure Specifications vs. Current Configuration

### EDGE Instance (EC2-1)

| Specification | Value | Status |
|---------------|-------|--------|
| **AMI** | Amazon Linux | ✅ Compatible with scripts |
| **Java Version** | 21 | ✅ Matches build target |
| **Instance Type** | m7i-flex.large | ⚠️ See notes below |
| **vCPU** | 2 | ✅ Adequate for 3 services |
| **RAM** | 8GB | ✅ Adequate for Gateway/Eureka/Frontend |
| **Root Volume** | 30GB gp3 | ✅ Sufficient |
| **Subnet** | Public | ✅ Configured correctly |
| **Public IPv4** | Enabled | ✅ Required for access |

**Estimated Resource Usage (EDGE)**:
- Discovery Server: ~512MB
- API Gateway: ~1GB
- Frontend (Nginx): ~100MB
- System overhead: ~500MB
- **Total**: ~2.1GB / 8GB ✅ **Comfortable margin**

---

### CORE Instance (EC2-2)

| Specification | Value | Status |
|---------------|-------|--------|
| **AMI** | Amazon Linux | ✅ Compatible |
| **Java Version** | 21 | ✅ Matches build target |
| **Instance Type** | m7i-flex.large | 🔴 **INSUFFICIENT** |
| **vCPU** | 2 | 🔴 Bottleneck for 15+ containers |
| **RAM** | 8GB | 🔴 **Critical constraint** |
| **Root Volume** | 30GB gp3 | ⚠️ Monitor Docker volume usage |
| **Subnet** | Private | ✅ Configured correctly |
| **Public IP** | None | ✅ Security best practice |

**Estimated Resource Usage (CORE)** - *This is problematic*:
- 7 Microservices: ~5GB (avg 700MB each)
- 7 PostgreSQL DBs: ~2.1GB (avg 300MB each)
- Kafka + Zookeeper: ~1.5GB
- Redis: ~512MB
- System overhead: ~500MB
- **Total**: ~9.6GB / 8GB 🔴 **EXCEEDS CAPACITY**

---

## Port Mapping Review

### ✅ EDGE Services (EC2-1)
| Service | Port | Configured | Firewall Rule |
|---------|------|------------|---------------|
| Frontend | 80/443 | ✅ | Allow 0.0.0.0/0 ✅ |
| API Gateway | 8080 | ✅ | Allow 0.0.0.0/0 ✅ |
| Eureka Server | 8761 | ✅ | Allow from CORE SG ✅ |

### ✅ CORE Services (EC2-2)
| Service | Port | Configured | Within Range 8000-8100 |
|---------|------|------------|------------------------|
| Auth | 8081 | ✅ | ✅ |
| Company | 8082 | ✅ | ✅ |
| JobPost | 8083 | ✅ | ✅ |
| Applicant Search | 8084 | ✅ Fixed | ✅ |
| Subscription | 8085 | ✅ Fixed | ✅ |
| Payment | 8086 | ✅ Fixed | ✅ |
| Notification | 8087 | ✅ Fixed | ✅ |

**Changes Made**:
- ✅ Fixed port check in deploy-ec2-2.sh (was checking wrong ports)
- ✅ Updated deployment plan to reflect correct port assignments
- ✅ Removed non-existent services (Search-8084, Premium-8089)

---

## Security Group Configuration

### EDGE Security Group ✅

**Inbound Rules - Correct**:
```
Port 80    (HTTP)   ← 0.0.0.0/0       ✅ Public web access
Port 443   (HTTPS)  ← 0.0.0.0/0       ✅ Secure web access
Port 22    (SSH)    ← 0.0.0.0/0       ⚠️ Consider restricting to your IP
Port 8080  (API)    ← 0.0.0.0/0       ✅ Public API access
Port 8761  (Eureka) ← CORE SG         ✅ Service registration
```

**Outbound Rules - Correct**:
```
All Traffic → 0.0.0.0/0              ✅ Internet access for updates
```

### CORE Security Group ✅

**Inbound Rules - Correct**:
```
Port 8000-8100  ← EDGE SG            ✅ Covers all microservices
Port 22 (SSH)   ← 0.0.0.0/0          ⚠️ Consider using Session Manager instead
Port 8761       ← EDGE SG            ✅ Eureka registration to EDGE
```

**Outbound Rules - Correct**:
```
All Traffic → 0.0.0.0/0              ✅ Required for Docker Hub, Maven Central
```

---

## Network Architecture ✅

```
                    Internet
                       ↓
                  [IGW - VPC]
                       ↓
        ┌──────────────┴──────────────┐
        ↓                             ↓
   PUBLIC SUBNET              PRIVATE SUBNET
        │                             │
   [EC2-1 EDGE]                  [EC2-2 CORE]
   - Gateway :8080               - Auth :8081
   - Eureka  :8761               - Company :8082
   - Frontend:80                 - JobPost :8083
        │                        - 7 Services total
        │                        - Kafka, Redis
        │                        - 7 PostgreSQL DBs
        │                             │
        └─────── Private IP ──────────┘
          (Service Communication)
```

**Validation**: ✅ Architecture aligns with specifications

---

## Critical Issues & Recommendations

### 🔴 ISSUE #1: CORE Instance Undersized

**Problem**: 
- m7i-flex.large (2 vCPU, 8GB RAM) must run 15+ containers
- Estimated memory requirement: 9.6GB (exceeds 8GB capacity)
- High risk of OOM kills, service crashes, and slow performance

**Impact**:
- Frequent container restarts
- Failed health checks
- Database connection pool exhaustion
- Kafka consumer lag
- Poor response times

**Recommended Solutions** (Choose one):

#### Option A: Upgrade Instance Type (Recommended)
```
Current:  m7i-flex.large    (2 vCPU, 8GB RAM)   ~$45/mo
Upgrade:  m7i-flex.xlarge   (4 vCPU, 16GB RAM)  ~$90/mo
Better:   m7i-flex.2xlarge  (8 vCPU, 32GB RAM)  ~$180/mo
```

**Best Choice**: m7i-flex.xlarge provides adequate headroom at reasonable cost.

#### Option B: Reduce Services on CORE
Split deployment across 2 CORE instances:
- **CORE-1**: Auth, Company, JobPost, Kafka, Redis, 3 DBs
- **CORE-2**: Applicant Search, Subscription, Payment, Notification, 4 DBs

#### Option C: Optimize Containers (Partial Solution)
Add resource limits to docker-compose:
```yaml
services:
  auth-service:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

**Note**: This only prevents OOM, doesn't solve insufficient total capacity.

### ⚠️ ISSUE #2: SSH Access from Anywhere

**Problem**: Both instances allow SSH (port 22) from 0.0.0.0/0

**Security Risk**: High - brute force attacks, unauthorized access attempts

**Recommended Solution**:
1. **Best**: Use AWS Systems Manager Session Manager (no open SSH port needed)
2. **Good**: Restrict SSH to your company's IP range
3. **Acceptable**: Use a bastion host in public subnet

**Implementation**:
```bash
# Remove SSH rule from security groups
# Add to EDGE only if needed:
Type: SSH
Protocol: TCP
Port: 22
Source: YOUR_COMPANY_IP/32
```

### ⚠️ ISSUE #3: No SSL/TLS Certificate

**Current**: HTTP only on port 80
**Required for Production**: HTTPS on port 443

**Implementation Steps**:
1. Obtain SSL certificate (Let's Encrypt or ACM)
2. Update nginx.conf in frontend to handle HTTPS
3. Redirect all HTTP traffic to HTTPS
4. Update API Gateway configuration

### ⚠️ ISSUE #4: No Application Monitoring

**Missing**:
- CloudWatch metrics for EC2 instances
- Application-level monitoring (APM)
- Log aggregation
- Alerting on failures

**Recommended Additions**:
```bash
# Install CloudWatch agent on both instances
sudo yum install amazon-cloudwatch-agent

# Configure log shipping
# Add Prometheus exporter to each Spring Boot service
# Set up CloudWatch alarms for:
#   - CPU > 80%
#   - Memory > 85%
#   - Disk > 80%
#   - Service health check failures
```

---

## Build Configuration ✅

**Specified**:
- Build Tool: Maven ✅
- Command: `mvn clean package -DskipTests` ✅
- Artifact: Fat JAR ✅

**Validation**: All services configured with correct Maven builds in Dockerfiles.

---

## Docker Configuration Review

### ✅ Verified Configurations

1. **Java 21 Base Images**: ✅ All Dockerfiles use `eclipse-temurin:21-jre`
2. **Fat JAR Packaging**: ✅ Spring Boot maven plugin configured
3. **Health Checks**: ✅ All services expose `/actuator/health`
4. **Log Rotation**: ✅ JSON file driver with 10MB max size, 3 files
5. **Restart Policy**: ✅ `unless-stopped` for resilience
6. **Networks**: ✅ Isolated bridge networks for each instance

### 📋 docker-compose.ec2-1.yml (EDGE)
```yaml
Services: 3
  - discovery-server:8761
  - gateway:8080
  - frontend:80,443
Network: jm-edge-network
Health Checks: All configured ✅
```

### 📋 docker-compose.ec2-2.yml (CORE)
```yaml
Services: 17
  Infrastructure:
    - zookeeper:2181
    - kafka:9092
    - redis:6379
  Databases: 7x PostgreSQL:5432
  Microservices: 7x Spring Boot apps
Network: jm-core-network
Volumes: 10 persistent volumes ✅
Health Checks: All configured ✅
```

---

## Deployment Script Review

### deploy-ec2-1.sh (EDGE) ✅
**Status**: Ready for production

**Flow**:
1. Load environment variables ✅
2. Pull latest code ✅
3. Pull Docker images ✅
4. Stop old containers ✅
5. Start new containers ✅
6. Health checks (3 services) ✅
7. Cleanup ✅

**Improvements Applied**: None needed

### deploy-ec2-2.sh (CORE) ✅
**Status**: Ready for production (after port fix)

**Flow**:
1. Load environment ✅
2. Pull code and images ✅
3. Graceful shutdown (30s timeout) ✅
4. Start infrastructure first (Kafka, Redis, DBs) ✅
5. Wait 60s for infrastructure ✅
6. Start microservices ✅
7. Wait 45s for services ✅
8. Health checks (7 services + infra) ✅
9. Database connectivity tests ✅
10. Eureka registration check ✅
11. Cleanup ✅

**Improvements Applied**: 
- ✅ Fixed health check ports (8084-8087)
- ✅ Corrected service endpoint documentation

---

## Environment Variables Required

### .env for EDGE (EC2-1)
```bash
# Docker Hub
DOCKERHUB_USERNAME=your-username
IMAGE_TAG=latest

# EC2-2 Connection
EC2_2_PRIVATE_IP=10.0.x.x          # Replace with actual private IP

# OAuth
OAUTH2_REDIRECT_URI=https://your-domain.com/oauth2/callback
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Frontend
VITE_API_GATEWAY_URL=http://<EC2-1-PUBLIC-IP>:8080
```

### .env for CORE (EC2-2)
```bash
# Docker Hub
DOCKERHUB_USERNAME=your-username
IMAGE_TAG=latest

# EC2-1 Connection
EC2_1_PRIVATE_IP=10.0.x.x          # Replace with actual private IP

# Database Credentials (Generate secure passwords!)
AUTH_DB_NAME=authdb
AUTH_DB_USER=authuser
AUTH_DB_PASSWORD=<GENERATE_STRONG_PASSWORD>

COMPANY_DB_NAME=companydb
COMPANY_DB_USER=companyuser
COMPANY_DB_PASSWORD=<GENERATE_STRONG_PASSWORD>

JOBPOST_DB_NAME=jobpostdb
JOBPOST_DB_USER=jobpostuser
JOBPOST_DB_PASSWORD=<GENERATE_STRONG_PASSWORD>

APPLICANT_SEARCH_DB_NAME=applicantsearchdb
APPLICANT_SEARCH_DB_USER=applicantsearchuser
APPLICANT_SEARCH_DB_PASSWORD=<GENERATE_STRONG_PASSWORD>

SUBSCRIPTION_DB_NAME=subscriptiondb
SUBSCRIPTION_DB_USER=subscriptionuser
SUBSCRIPTION_DB_PASSWORD=<GENERATE_STRONG_PASSWORD>

PAYMENT_DB_NAME=paymentdb
PAYMENT_DB_USER=paymentuser
PAYMENT_DB_PASSWORD=<GENERATE_STRONG_PASSWORD>

NOTIFICATION_DB_NAME=notificationdb
NOTIFICATION_DB_USER=notificationuser
NOTIFICATION_DB_PASSWORD=<GENERATE_STRONG_PASSWORD>

# Redis
REDIS_PASSWORD=<GENERATE_STRONG_PASSWORD>

# OAuth
OAUTH2_REDIRECT_URI=https://your-domain.com/oauth2/callback
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## Pre-Deployment Checklist

### AWS Infrastructure Setup

- [ ] **VPC Configuration**
  - [ ] Default VPC confirmed or custom VPC created
  - [ ] Public subnet exists with IGW route
  - [ ] Private subnet exists (no IGW route)
  - [ ] Route table configured correctly

- [ ] **EDGE Instance (EC2-1)**
  - [ ] Launch m7i-flex.large in public subnet
  - [ ] Enable Auto-assign Public IPv4
  - [ ] Attach 30GB gp3 root volume
  - [ ] Apply EDGE security group
  - [ ] Use key pair: ultimo.pem
  - [ ] Tag: Name=mulan-jobmanager-edge-prod

- [ ] **CORE Instance (EC2-2)**
  - [ ] Launch m7i-flex.**xlarge** (NOT large!) in private subnet
  - [ ] Disable public IP
  - [ ] Attach 30GB gp3 root volume
  - [ ] Apply CORE security group
  - [ ] Use key pair: ultimo.pem
  - [ ] Tag: Name=mulan-jobmanager-core-prod

- [ ] **Security Groups**
  - [ ] EDGE SG allows: 22, 80, 443, 8080, 8761(from CORE)
  - [ ] CORE SG allows: 22, 8000-8100(from EDGE), 8761(from EDGE)
  - [ ] Both allow all outbound

### Software Installation (Both Instances)

```bash
# Connect via SSH
ssh -i ultimo.pem ec2-user@<instance-ip>

# Update system
sudo yum update -y

# Install Docker
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo yum install git -y

# Verify Java 21 (pre-installed on Amazon Linux 2023)
java -version  # Should show Java 21

# Reboot to apply group membership
sudo reboot

# After reboot, verify Docker
docker --version
docker-compose --version
```

### Application Deployment

- [ ] **CORE First (EC2-2)**
  ```bash
  # SSH to EC2-2
  ssh -i ultimo.pem ec2-user@<EC2-2-IP-via-bastion-or-Session-Manager>
  
  # Clone repository
  cd /home/ec2-user
  git clone https://github.com/ISYS3461-2025C-Mulan-DEVision/JobManager_BE.git job-manager
  cd job-manager
  git checkout feat/dockerize-project  # or main
  
  # Create .env file
  cp .env.example .env
  nano .env  # Configure all EC2-2 variables
  
  # Login to Docker Hub
  docker login -u <your-dockerhub-username>
  
  # Deploy
  chmod +x scripts/deploy-ec2-2.sh
  ./scripts/deploy-ec2-2.sh
  
  # Monitor logs
  docker-compose -f docker-compose.ec2-2.yml logs -f
  ```

- [ ] **EDGE Next (EC2-1)**
  ```bash
  # SSH to EC2-1
  ssh -i ultimo.pem ec2-user@<EC2-1-PUBLIC-IP>
  
  # Clone repository
  cd /home/ec2-user
  git clone https://github.com/ISYS3461-2025C-Mulan-DEVision/JobManager_BE.git job-manager
  cd job-manager
  git checkout feat/dockerize-project  # or main
  
  # Create .env file
  cp .env.example .env
  nano .env  # Configure all EC2-1 variables (include EC2_2_PRIVATE_IP!)
  
  # Login to Docker Hub
  docker login -u <your-dockerhub-username>
  
  # Deploy
  chmod +x scripts/deploy-ec2-1.sh
  ./scripts/deploy-ec2-1.sh
  
  # Monitor logs
  docker-compose -f docker-compose.ec2-1.yml logs -f
  ```

### Post-Deployment Verification

- [ ] **Service Health**
  ```bash
  # On EC2-2
  curl http://localhost:8081/actuator/health  # Auth
  curl http://localhost:8082/actuator/health  # Company
  curl http://localhost:8083/actuator/health  # JobPost
  curl http://localhost:8084/actuator/health  # Applicant Search
  curl http://localhost:8085/actuator/health  # Subscription
  curl http://localhost:8086/actuator/health  # Payment
  curl http://localhost:8087/actuator/health  # Notification
  
  # On EC2-1
  curl http://localhost:8761/actuator/health  # Eureka
  curl http://localhost:8080/actuator/health  # Gateway
  curl http://localhost/                       # Frontend
  ```

- [ ] **Eureka Registration**
  ```bash
  # From your local machine
  open http://<EC2-1-PUBLIC-IP>:8761
  # Verify all 7 microservices show status "UP"
  ```

- [ ] **End-to-End Test**
  ```bash
  # Test via API Gateway
  curl http://<EC2-1-PUBLIC-IP>:8080/api/auth/health
  curl http://<EC2-1-PUBLIC-IP>:8080/api/company/health
  curl http://<EC2-1-PUBLIC-IP>:8080/api/jobpost/health
  
  # Access Frontend
  open http://<EC2-1-PUBLIC-IP>
  ```

- [ ] **Database Verification**
  ```bash
  # On EC2-2
  docker exec -it jm-postgres-auth psql -U authuser -d authdb -c "SELECT 1;"
  docker exec -it jm-postgres-company psql -U companyuser -d companydb -c "SELECT 1;"
  ```

- [ ] **Infrastructure Services**
  ```bash
  # On EC2-2
  docker exec -it jm-kafka kafka-topics --list --bootstrap-server localhost:9092
  docker exec -it jm-redis redis-cli -a <REDIS_PASSWORD> ping
  ```

---

## Monitoring Setup (Post-Deployment)

### CloudWatch Alarms (Create these)

```bash
# High CPU on CORE
aws cloudwatch put-metric-alarm \
  --alarm-name jobmanager-core-high-cpu \
  --alarm-description "CPU exceeds 80% on CORE instance" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=InstanceId,Value=<EC2-2-INSTANCE-ID>

# High Memory on CORE
aws cloudwatch put-metric-alarm \
  --alarm-name jobmanager-core-high-memory \
  --alarm-description "Memory exceeds 85% on CORE instance" \
  --metric-name mem_used_percent \
  --namespace CWAgent \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 85 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=InstanceId,Value=<EC2-2-INSTANCE-ID>
```

### Log Monitoring

```bash
# Install CloudWatch Logs agent on both instances
sudo yum install amazon-cloudwatch-agent -y

# Configure log collection
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard

# Stream Docker logs to CloudWatch
# Add to docker-compose files:
logging:
  driver: awslogs
  options:
    awslogs-region: us-east-1
    awslogs-group: /ecs/jobmanager
    awslogs-stream: service-name
```

---

## Cost Estimation

### Current Configuration (m7i-flex.large for both)
| Resource | Specification | Monthly Cost (us-east-1) |
|----------|---------------|--------------------------|
| EDGE Instance | m7i-flex.large | ~$45 |
| CORE Instance | m7i-flex.large | ~$45 |
| EBS Volumes | 2x 30GB gp3 | ~$5 |
| Data Transfer | 100GB outbound | ~$9 |
| **Total** | | **~$104/month** |

⚠️ **Critical**: CORE instance will likely crash due to insufficient resources

### Recommended Configuration (m7i-flex.xlarge for CORE)
| Resource | Specification | Monthly Cost (us-east-1) |
|----------|---------------|--------------------------|
| EDGE Instance | m7i-flex.large | ~$45 |
| CORE Instance | **m7i-flex.xlarge** | **~$90** |
| EBS Volumes | 2x 30GB gp3 | ~$5 |
| Data Transfer | 100GB outbound | ~$9 |
| **Total** | | **~$149/month** |

**Cost increase**: $45/month for stable, production-ready deployment

### Cost Optimization Options
1. **Reserved Instances (1-year)**: Save 30-40% (~$90-100/month total)
2. **Savings Plans**: Flexible commitment with similar savings
3. **Spot Instances**: For dev/test environments only (up to 90% savings)

---

## Rollback Plan

If deployment fails or issues occur:

### Immediate Rollback
```bash
# On affected instance
cd /home/ec2-user/job-manager
docker-compose -f docker-compose.ec2-X.yml down
docker-compose -f docker-compose.ec2-X.yml up -d
```

### Full Rollback to Previous Version
```bash
cd /home/ec2-user/job-manager
git fetch origin
git checkout <previous-commit-or-tag>
docker-compose -f docker-compose.ec2-X.yml down
docker-compose -f docker-compose.ec2-X.yml pull
docker-compose -f docker-compose.ec2-X.yml up -d
```

### Database Restore (if needed)
```bash
# Restore from backup
docker exec -i jm-postgres-auth psql -U authuser -d authdb < /backup/authdb_backup.sql
```

---

## Final Recommendations

### 🔴 MUST DO (Before Production)
1. **Upgrade CORE to m7i-flex.xlarge** (critical)
2. **Generate strong passwords** for all databases and Redis
3. **Set up CloudWatch monitoring** with alarms
4. **Restrict SSH access** (use Session Manager or IP whitelist)
5. **Test failure scenarios** (kill containers, simulate network issues)

### ⚠️ SHOULD DO (Within 1 Week)
1. **Add SSL/TLS certificate** for HTTPS
2. **Set up automated backups** for databases
3. **Configure log aggregation** to CloudWatch
4. **Document service dependencies** for troubleshooting
5. **Create runbook** for common issues

### ✅ NICE TO HAVE (Within 1 Month)
1. Add Prometheus + Grafana for detailed metrics
2. Implement auto-scaling for EC2 instances
3. Set up staging environment for testing
4. Add distributed tracing (e.g., Jaeger, Zipkin)
5. Implement blue-green deployment strategy

---

## Conclusion

Your deployment configuration is **well-structured** and aligns with AWS best practices for a microservices architecture. The main concern is the **CORE instance capacity**. 

**Action Required**: Upgrade EC2-2 from m7i-flex.large to **m7i-flex.xlarge** before deploying to production.

With that change, you'll have a solid, production-ready deployment.

---

**Reviewed by**: GitHub Copilot  
**Next Review**: After first production deployment  
**Contact**: See deployment scripts for troubleshooting commands
