#!/bin/bash
# ========================================
# EC2-2 Deployment Script
# Core Application Plane: All Microservices
# Infrastructure: Cloud Services (Upstash Redis, Neon PostgreSQL, External Kafka)
# ========================================

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🚀 Deploying to EC2-CORE (All Microservices)${NC}"
echo -e "${GREEN}========================================${NC}"

# Configuration
# Automatically detect the project directory (parent of scripts directory)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DEPLOY_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
IMAGE_TAG="${IMAGE_TAG:-latest}"
COMPOSE_FILE="docker-compose.ec2-core.yml"

echo -e "${BLUE}📁 Deploy directory: $DEPLOY_DIR${NC}"

# Step 1: Load environment variables
echo -e "${YELLOW}📋 Loading environment variables...${NC}"
if [ -f "$DEPLOY_DIR/.env" ]; then
    # Load .env file safely, handling multiline values and comments
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines and comments
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
        
        # Only export lines that look like variable assignments
        if [[ "$line" =~ ^[[:space:]]*([A-Za-z_][A-Za-z0-9_]*)= ]]; then
            # Export the variable
            export "$line"
        fi
    done < "$DEPLOY_DIR/.env"
    echo -e "${GREEN}✅ Environment variables loaded${NC}"
else
    echo -e "${RED}❌ .env file not found!${NC}"
    exit 1
fi

# Step 2: Pull latest code
echo -e "${YELLOW}📥 Pulling latest deployment configuration...${NC}"
cd "$DEPLOY_DIR"
git pull origin production || echo -e "${YELLOW}⚠️  Git pull skipped (may not be in a git repo or branch not tracking)${NC}"
echo -e "${GREEN}✅ Code updated${NC}"

# Step 3: Pull Docker images
echo -e "${YELLOW}🐳 Pulling Docker images...${NC}"
echo -e "${BLUE}This may take several minutes as EC2-2 has many services...${NC}"
docker compose -f "$COMPOSE_FILE" pull
echo -e "${GREEN}✅ Images pulled${NC}"

# Step 4: Stop old containers (graceful shutdown)
echo -e "${YELLOW}🛑 Stopping old containers gracefully...${NC}"
docker compose -f "$COMPOSE_FILE" down --timeout 30
echo -e "${GREEN}✅ Old containers stopped${NC}"

# Step 5: Start all microservices
echo -e "${YELLOW}▶️  Starting all microservices...${NC}"
echo -e "${BLUE}Note: Using cloud infrastructure (Upstash Redis, Neon PostgreSQL, External Kafka)${NC}"
docker compose -f "$COMPOSE_FILE" up -d
echo -e "${GREEN}✅ Microservices started${NC}"

# Step 6: Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be healthy (120s)...${NC}"
sleep 120

# Step 7: Health checks
echo -e "${YELLOW}🏥 Running health checks...${NC}"
echo -e "${BLUE}Infrastructure: Using cloud services (Upstash Redis, Neon PostgreSQL, External Kafka)${NC}"

# Check Auth Service
echo -e "${BLUE}Checking Auth Service...${NC}"
if curl -sf http://localhost:8081/actuator/health > /dev/null; then
    echo -e "${GREEN}✅ Auth Service is healthy${NC}"
else
    echo -e "${RED}❌ Auth Service health check failed${NC}"
    docker compose -f "$COMPOSE_FILE" logs auth-service
    exit 1
fi

# Check Company Service
echo -e "${BLUE}Checking Company Service...${NC}"
if curl -sf http://localhost:8082/actuator/health > /dev/null; then
    echo -e "${GREEN}✅ Company Service is healthy${NC}"
else
    echo -e "${RED}❌ Company Service health check failed${NC}"
    docker compose -f "$COMPOSE_FILE" logs company-service
    exit 1
fi

# Check JobPost Service
echo -e "${BLUE}Checking JobPost Service...${NC}"
if curl -sf http://localhost:8083/actuator/health > /dev/null; then
    echo -e "${GREEN}✅ JobPost Service is healthy${NC}"
else
    echo -e "${RED}❌ JobPost Service health check failed${NC}"
    docker compose -f "$COMPOSE_FILE" logs jobpost-service
    exit 1
fi

# Check Applicant Search Service
echo -e "${BLUE}Checking Applicant Search Service...${NC}"
if curl -sf http://localhost:8084/actuator/health > /dev/null; then
    echo -e "${GREEN}✅ Applicant Search Service is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Applicant Search Service health check failed (non-critical)${NC}"
fi

# Check Subscription Service
echo -e "${BLUE}Checking Subscription Service...${NC}"
if curl -sf http://localhost:8085/actuator/health > /dev/null; then
    echo -e "${GREEN}✅ Subscription Service is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Subscription Service health check failed (non-critical)${NC}"
fi

# Check Payment Service
echo -e "${BLUE}Checking Payment Service...${NC}"
if curl -sf http://localhost:8086/actuator/health > /dev/null; then
    echo -e "${GREEN}✅ Payment Service is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Payment Service health check failed (non-critical)${NC}"
fi

# Check Notification Service
echo -e "${BLUE}Checking Notification Service...${NC}"
if curl -sf http://localhost:8087/actuator/health > /dev/null; then
    echo -e "${GREEN}✅ Notification Service is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Notification Service health check failed (non-critical)${NC}"
fi

# Step 8: Check Eureka registration (if EC2-1 is accessible)
echo -e "${YELLOW}🔍 Checking service registration...${NC}"
if [ -n "$EC2_1_PRIVATE_IP" ]; then
    if curl -sf http://${EC2_1_PRIVATE_IP}:8761/eureka/apps > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Can reach Eureka on EC2-1${NC}"
        echo -e "${BLUE}Waiting 30s for service registration...${NC}"
        sleep 30
        
        registered_services=$(curl -s http://${EC2_1_PRIVATE_IP}:8761/eureka/apps | grep -c "<status>UP</status>" || true)
        echo -e "${GREEN}✅ Registered services: ${registered_services}${NC}"
    else
        echo -e "${YELLOW}⚠️  Cannot reach Eureka on EC2-1 (${EC2_1_PRIVATE_IP}:8761)${NC}"
        echo -e "${YELLOW}   Services will retry registration automatically${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  EC2_1_PRIVATE_IP not set - skipping Eureka check${NC}"
fi

# Step 9: Clean up
echo -e "${YELLOW}🧹 Cleaning up old images...${NC}"
docker image prune -f
echo -e "${GREEN}✅ Cleanup complete${NC}"

# Step 10: Display running containers
echo -e "${YELLOW}📊 Running containers:${NC}"
docker compose -f "$COMPOSE_FILE" ps

# Step 11: Display resource usage
echo -e "${YELLOW}💻 Resource usage:${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Step 12: Display useful information
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ EC2-2 Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📝 Service Endpoints:${NC}"
echo -e "   Auth Service:              http://localhost:8081/actuator/health"
echo -e "   Company Service:           http://localhost:8082/actuator/health"
echo -e "   JobPost Service:           http://localhost:8083/actuator/health"
echo -e "   Applicant Search Service:  http://localhost:8084/actuator/health"
echo -e "   Subscription Service:      http://localhost:8085/actuator/health"
echo -e "   Payment Service:           http://localhost:8086/actuator/health"
echo -e "   Notification Service:      http://localhost:8087/actuator/health"
echo ""
echo -e "${BLUE}📝 Infrastructure (Cloud Services):${NC}"
echo -e "   Kafka:  kafka-mulan.duckdns.org:9092"
echo -e "   Redis:  Upstash (meet-jennet-28932.upstash.io)"
echo -e "   PostgreSQL:  Neon (ep-delicate-math-a1aai4x4-pooler.ap-southeast-1.aws.neon.tech)"
echo ""
echo -e "${BLUE}📝 Useful Commands:${NC}"
echo -e "   View logs:       docker compose -f $COMPOSE_FILE logs -f [service-name]"
echo -e "   Restart service: docker compose -f $COMPOSE_FILE restart [service-name]"
echo -e "   Stop all:        docker compose -f $COMPOSE_FILE down"
echo -e "   Check status:    docker compose -f $COMPOSE_FILE ps"
echo ""
echo -e "${YELLOW}⚠️  Next Steps:${NC}"
echo -e "   1. Deploy EC2-1 (Gateway, Discovery, Frontend)"
echo -e "   2. Verify services register with Eureka"
echo -e "   3. Test end-to-end connectivity"
echo ""
