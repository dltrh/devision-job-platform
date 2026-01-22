# JobManager AWS Instance Configuration

**Quick Reference Card**

---

## Instance Specifications

### EDGE Instance (EC2-1) - mulan-jobmanager-edge-prod

```
AMI:              Amazon Linux 2023
Instance Type:    m7i-flex.large
vCPU:             2
Memory:           8 GB
Storage:          30 GB gp3
Network:          Public subnet
Public IPv4:      Enabled
Key Pair:         ultimo.pem
Security Group:   jobmanager-edge-sg
```

### CORE Instance (EC2-2) - mulan-jobmanager-core-prod

```
AMI:              Amazon Linux 2023
Instance Type:    m7i-flex.large (⚠️ UPGRADE TO xlarge recommended)
vCPU:             2
Memory:           8 GB
Storage:          30 GB gp3
Network:          Private subnet
Public IP:        None
Key Pair:         ultimo.pem
Security Group:   jobmanager-core-sg
```

---

## Security Group Rules

### EDGE Security Group (jobmanager-edge-sg)

**Inbound**:

```
Port    Protocol  Source          Description
----    --------  ------          -----------
22      TCP       0.0.0.0/0       SSH (⚠️ Restrict in production)
80      TCP       0.0.0.0/0       HTTP
443     TCP       0.0.0.0/0       HTTPS
8080    TCP       0.0.0.0/0       API Gateway
8761    TCP       CORE-SG         Eureka (from CORE services)
```

**Outbound**:

```
All traffic → 0.0.0.0/0
```

### CORE Security Group (jobmanager-core-sg)

**Inbound**:

```
Port         Protocol  Source     Description
----         --------  ------     -----------
22           TCP       0.0.0.0/0  SSH (⚠️ Use Session Manager instead)
8000-8100    TCP       EDGE-SG    Microservices (from Gateway)
8761         TCP       EDGE-SG    Eureka registration (to EDGE)
```

**Outbound**:

```
All traffic → 0.0.0.0/0
```

---

## Service Port Mapping

### EDGE (EC2-1)

```
80/443  → Frontend (Nginx)
8080    → API Gateway
8761    → Eureka Discovery Server
```

### CORE (EC2-2)

```
8081    → Auth Service
8082    → Company Service
8083    → JobPost Service
8084    → Applicant Search Service
8085    → Subscription Service
8086    → Payment Service
8087    → Notification Service

Infrastructure:
9092    → Kafka
2181    → Zookeeper
6379    → Redis
5432    → PostgreSQL (7 instances)
```

---

## Deployment Commands

### Deploy CORE (Run First)

```bash
ssh -i ultimo.pem ec2-user@<CORE-PRIVATE-IP>
cd /home/ec2-user/job-manager
./scripts/deploy-ec2-2.sh
```

### Deploy EDGE (Run Second)

```bash
ssh -i ultimo.pem ec2-user@<EDGE-PUBLIC-IP>
cd /home/ec2-user/job-manager
./scripts/deploy-ec2-1.sh
```

---

## Health Check URLs

### From CORE Instance

```bash
# Microservices
curl http://localhost:8081/actuator/health  # Auth
curl http://localhost:8082/actuator/health  # Company
curl http://localhost:8083/actuator/health  # JobPost
curl http://localhost:8084/actuator/health  # Applicant Search
curl http://localhost:8085/actuator/health  # Subscription
curl http://localhost:8086/actuator/health  # Payment
curl http://localhost:8087/actuator/health  # Notification
```

### From EDGE Instance

```bash
curl http://localhost:8761/actuator/health  # Eureka
curl http://localhost:8080/actuator/health  # Gateway
curl http://localhost/                       # Frontend
```

### From Browser (Public)

```
http://<EDGE-PUBLIC-IP>:8761              # Eureka Dashboard
http://<EDGE-PUBLIC-IP>:8080              # API Gateway
http://<EDGE-PUBLIC-IP>                   # Frontend
```

---

## Environment Variables Required

### EDGE (.env)

```bash
DOCKERHUB_USERNAME=your-username
IMAGE_TAG=latest
EC2_2_PRIVATE_IP=10.0.x.x
OAUTH2_REDIRECT_URI=https://domain.com/oauth2/callback
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
VITE_API_GATEWAY_URL=http://<EDGE-IP>:8080
```

### CORE (.env)

```bash
DOCKERHUB_USERNAME=your-username
IMAGE_TAG=latest
EC2_1_PRIVATE_IP=10.0.x.x

# 7 Database Configs
AUTH_DB_NAME=authdb
AUTH_DB_USER=authuser
AUTH_DB_PASSWORD=<strong-password>
# ... (repeat for company, jobpost, applicant-search,
#      subscription, payment, notification)

REDIS_PASSWORD=<strong-password>
OAUTH2_REDIRECT_URI=https://domain.com/oauth2/callback
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

---

## Useful Commands

### Docker Management

```bash
# View all running containers
docker ps

# View logs for specific service
docker logs -f jm-auth-service

# Restart a service
docker restart jm-auth-service

# Stop all services
docker-compose -f docker-compose.ec2-X.yml down

# Start all services
docker-compose -f docker-compose.ec2-X.yml up -d

# View resource usage
docker stats
```

### Database Access

```bash
# Connect to Auth database
docker exec -it jm-postgres-auth psql -U authuser -d authdb

# Run SQL query
docker exec -it jm-postgres-auth psql -U authuser -d authdb -c "SELECT 1;"

# Backup database
docker exec jm-postgres-auth pg_dump -U authuser authdb > backup.sql

# Restore database
docker exec -i jm-postgres-auth psql -U authuser authdb < backup.sql
```

### Kafka Management

```bash
# List topics
docker exec jm-kafka kafka-topics --list --bootstrap-server localhost:9092

# Create topic
docker exec jm-kafka kafka-topics --create --topic test --bootstrap-server localhost:9092

# Consume messages
docker exec jm-kafka kafka-console-consumer --topic test --from-beginning --bootstrap-server localhost:9092
```

### Redis Management

```bash
# Connect to Redis
docker exec -it jm-redis redis-cli -a <REDIS_PASSWORD>

# Test connection
docker exec jm-redis redis-cli -a <REDIS_PASSWORD> ping

# Monitor commands
docker exec jm-redis redis-cli -a <REDIS_PASSWORD> monitor
```

---

## Troubleshooting

### Service won't start

```bash
# Check logs
docker logs jm-<service-name>

# Check if port is in use
sudo netstat -tulpn | grep <port>

# Restart service
docker restart jm-<service-name>
```

### Can't reach CORE from EDGE

```bash
# Test connectivity
ping <EC2-2-PRIVATE-IP>
telnet <EC2-2-PRIVATE-IP> 8081

# Check security group rules
# Ensure EDGE SG is allowed in CORE SG inbound rules
```

### Services not registering with Eureka

```bash
# Check EC2_1_PRIVATE_IP is set correctly
echo $EC2_1_PRIVATE_IP

# Test Eureka connectivity from CORE
curl http://<EC2-1-PRIVATE-IP>:8761/eureka/apps

# Check service logs for registration errors
docker logs jm-auth-service | grep -i eureka
```

### Database connection failures

```bash
# Check database is running
docker ps | grep postgres

# Test database connection
docker exec jm-postgres-auth psql -U authuser -d authdb -c "SELECT 1;"

# Check credentials in .env match docker-compose
cat .env | grep AUTH_DB
```

### Out of Memory errors

```bash
# Check memory usage
free -h
docker stats

# If consistently high:
# 1. Upgrade instance to xlarge
# 2. Add swap space (temporary)
# 3. Reduce number of services
```

---

## Critical Warnings

### ⚠️ Resource Constraints

```
CORE instance (8GB RAM) is INSUFFICIENT for 15+ containers.
Expected usage: ~9.6GB
RECOMMENDED: Upgrade to m7i-flex.xlarge (16GB RAM)
```

### ⚠️ Security

```
SSH port 22 is open to 0.0.0.0/0
RECOMMENDED: Use AWS Systems Manager Session Manager
OR restrict to your IP: YOUR_IP/32
```

### ⚠️ SSL/TLS

```
Currently HTTP only
REQUIRED FOR PRODUCTION: Configure HTTPS with valid certificate
```

### ⚠️ Monitoring

```
No application monitoring configured
RECOMMENDED: Set up CloudWatch alarms for CPU, Memory, Disk
```

---

## Monthly Cost Estimate

### Current Configuration (Both instances: m7i-flex.large)

```
2x m7i-flex.large:  $90/month
2x 30GB gp3:        $5/month
Data Transfer:      $9/month
------------------------
TOTAL:              ~$104/month
⚠️ CORE will be unstable
```

### Recommended Configuration (CORE: m7i-flex.xlarge)

```
1x m7i-flex.large:  $45/month  (EDGE)
1x m7i-flex.xlarge: $90/month  (CORE)
2x 30GB gp3:        $5/month
Data Transfer:      $9/month
------------------------
TOTAL:              ~$149/month
✅ Stable production deployment
```

---

## Next Steps

1. ✅ Review DEPLOYMENT_REVIEW.md for detailed analysis
2. ⚠️ Upgrade CORE instance type to xlarge
3. 🔧 Provision AWS infrastructure (VPC, subnets, SGs)
4. 🚀 Deploy CORE first, then EDGE
5. 🏥 Run health checks and end-to-end tests
6. 📊 Set up CloudWatch monitoring
7. 🔒 Implement SSL/TLS for HTTPS
8. 📝 Document any issues encountered

---

**Last Updated**: January 12, 2026
**Version**: 1.0
**Documentation**: See DEPLOYMENT_REVIEW.md for full details
