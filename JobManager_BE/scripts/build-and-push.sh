#!/bin/bash
# ========================================
# Build and Push Services to Docker Hub
# Run this script locally before deploying to EC2
#
# Usage:
#   ./build-and-push.sh              # Build and push ALL services
#   ./build-and-push.sh frontend     # Build and push only frontend
#   ./build-and-push.sh auth         # Build and push only auth service
#   ./build-and-push.sh gateway      # Build and push only gateway
#   ./build-and-push.sh discovery    # Build and push only discovery
#
# Available services:
#   auth, company, jobpost, applicant-search, subscription,
#   payment, notification, gateway, discovery, frontend
# ========================================

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_USERNAME="hanhdau"
IMAGE_TAG="${IMAGE_TAG:-latest}"
TARGET_SERVICE="${1:-all}"

# Function to get service directory and image name
# Returns: "directory:image"
get_service_info() {
    local service=$1
    case "$service" in
        auth)             echo "job-manager-auth:jm-auth" ;;
        company)          echo "job-manager-company:jm-company" ;;
        jobpost)          echo "job-manager-jobpost:jm-jobpost" ;;
        applicant-search) echo "job-manager-applicant-search:jm-applicant-search" ;;
        subscription)     echo "job-manager-subscription:jm-subscription" ;;
        payment)          echo "job-manager-payment:jm-payment" ;;
        notification)     echo "job-manager-notification:jm-notification" ;;
        gateway)          echo "job-manager-gateway:jm-gateway" ;;
        discovery)        echo "job-manager-discovery:jm-discovery" ;;
        frontend)         echo "../JobManager_FE:jm-frontend" ;;
        *)                echo "" ;;
    esac
}

# List of all backend services
BACKEND_SERVICES="auth company jobpost applicant-search subscription payment notification gateway discovery"

# Function to display usage
show_usage() {
    echo -e "${BLUE}Usage:${NC}"
    echo -e "  $0              # Build and push ALL services"
    echo -e "  $0 <service>    # Build and push specific service"
    echo ""
    echo -e "${BLUE}Available services:${NC}"
    echo -e "  auth, company, jobpost, applicant-search, subscription,"
    echo -e "  payment, notification, gateway, discovery, frontend"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo -e "  $0 frontend     # Build only frontend"
    echo -e "  $0 auth         # Build only auth service"
    echo -e "  $0 gateway      # Build only gateway"
}

# Function to build backend service
build_backend_service() {
    local dir=$1
    local image=$2
    
    if [ -d "$dir" ]; then
        echo -e "${BLUE}Building $image from $dir for linux/amd64...${NC}"
        
        if docker buildx build \
            --platform linux/amd64 \
            -t "$DOCKER_USERNAME/$image:$IMAGE_TAG" \
            --push \
            "./$dir"; then
            echo -e "${GREEN}✅ Built and pushed $image${NC}"
        else
            echo -e "${RED}❌ Failed to build $image${NC}"
            exit 1
        fi
        echo ""
    else
        echo -e "${YELLOW}⚠️  Directory $dir not found, skipping...${NC}"
    fi
}

# Function to build frontend service
build_frontend_service() {
    local dir=$1
    local image=$2
    
    if [ -d "$dir" ]; then
        echo -e "${BLUE}Building $image from $dir for linux/amd64...${NC}"
        
        # Load frontend environment variables
        FRONTEND_ENV_FILE="$dir/.env.production"
        if [ -f "$FRONTEND_ENV_FILE" ]; then
            echo -e "${BLUE}Loading environment from $FRONTEND_ENV_FILE${NC}"
            export $(cat "$FRONTEND_ENV_FILE" | grep -v '^#' | xargs)
        fi
        
        # For production with HTTPS, use /api as base URL so requests go through nginx proxy
        # This avoids Mixed Content errors (HTTPS frontend calling HTTP backend)
        if docker buildx build \
            --platform linux/amd64 \
            --build-arg VITE_API_BASE_URL="${VITE_API_BASE_URL:-/api}" \
            --build-arg VITE_API_URL="${VITE_API_URL:-/api}" \
            --build-arg VITE_GATEWAY_API_URL="${VITE_GATEWAY_API_URL:-}" \
            --build-arg VITE_STRIPE_PUBLISHABLE_KEY="${VITE_STRIPE_PUBLISHABLE_KEY}" \
            --build-arg VITE_NODE_ENV=production \
            --build-arg VITE_ENV=production \
            --build-arg VITE_ENABLE_MOCK_API=false \
            -t "$DOCKER_USERNAME/$image:$IMAGE_TAG" \
            --push \
            "$dir"; then
            echo -e "${GREEN}✅ Built and pushed $image${NC}"
        else
            echo -e "${RED}❌ Failed to build $image${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  Frontend directory not found at $dir, skipping...${NC}"
    fi
}

# Check for help flag
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    show_usage
    exit 0
fi

# Validate service name if provided
SERVICE_INFO=$(get_service_info "$TARGET_SERVICE")
if [[ "$TARGET_SERVICE" != "all" && -z "$SERVICE_INFO" ]]; then
    echo -e "${RED}❌ Unknown service: $TARGET_SERVICE${NC}"
    echo ""
    show_usage
    exit 1
fi

# Display header
if [[ "$TARGET_SERVICE" == "all" ]]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}🐳 Building and Pushing ALL Services${NC}"
    echo -e "${GREEN}========================================${NC}"
else
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}🐳 Building and Pushing: $TARGET_SERVICE${NC}"
    echo -e "${GREEN}========================================${NC}"
fi

# Step 1: Login to Docker Hub
echo -e "${YELLOW}🔐 Logging into Docker Hub...${NC}"
if [ -f ".env" ]; then
    export $(cat .env | grep "DOCKERHUB_TOKEN" | xargs)
    echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKER_USERNAME" --password-stdin
    echo -e "${GREEN}✅ Docker login successful${NC}"
else
    echo -e "${RED}❌ .env file not found!${NC}"
    exit 1
fi

# Step 2: Setup Docker Buildx for multi-platform builds
echo -e "${YELLOW}🔧 Setting up Docker Buildx...${NC}"
docker buildx create --use --name multiarch-builder --driver docker-container 2>/dev/null || docker buildx use multiarch-builder
echo -e "${GREEN}✅ Buildx configured${NC}"
echo ""

# Track built services for summary
BUILT_SERVICES=""

# Step 3: Build service(s)
if [[ "$TARGET_SERVICE" == "all" ]]; then
    # Build all backend services
    echo -e "${YELLOW}📦 Building Backend Services (linux/amd64)...${NC}"
    echo ""
    
    for key in $BACKEND_SERVICES; do
        SERVICE_INFO=$(get_service_info "$key")
        IFS=':' read -r dir image <<< "$SERVICE_INFO"
        build_backend_service "$dir" "$image"
        BUILT_SERVICES="$BUILT_SERVICES $DOCKER_USERNAME/$image:$IMAGE_TAG"
    done
    
    # Build frontend
    echo -e "${YELLOW}📦 Building Frontend Service (linux/amd64)...${NC}"
    SERVICE_INFO=$(get_service_info "frontend")
    IFS=':' read -r dir image <<< "$SERVICE_INFO"
    build_frontend_service "$dir" "$image"
    BUILT_SERVICES="$BUILT_SERVICES $DOCKER_USERNAME/$image:$IMAGE_TAG"
else
    # Build single service
    echo -e "${YELLOW}📦 Building $TARGET_SERVICE (linux/amd64)...${NC}"
    echo ""
    
    SERVICE_INFO=$(get_service_info "$TARGET_SERVICE")
    IFS=':' read -r dir image <<< "$SERVICE_INFO"
    
    if [[ "$TARGET_SERVICE" == "frontend" ]]; then
        build_frontend_service "$dir" "$image"
    else
        build_backend_service "$dir" "$image"
    fi
    BUILT_SERVICES="$DOCKER_USERNAME/$image:$IMAGE_TAG"
fi

# Step 4: Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Build and Push Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📝 Pushed Images:${NC}"
for img in $BUILT_SERVICES; do
    echo -e "   $img"
done
echo ""
echo -e "${YELLOW}⚠️  Next Steps:${NC}"
echo -e "   1. SSH into EC2-2 (Core) and run: ./scripts/deploy-ec2-core.sh"
echo -e "   2. SSH into EC2-1 (Edge) and run: ./scripts/deploy-ec2-edge.sh"
echo -e "   3. Verify services are healthy"
echo ""
