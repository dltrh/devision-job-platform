#!/bin/bash

# ========================================
# Job Manager - EC2 Deployment Script
# ========================================
#
# This script is executed on the EC2 server to deploy new containers.
# It can be run manually or triggered by the CI/CD pipeline.
#
# Usage:
#   ./deploy.sh                    # Deploy all services
#   ./deploy.sh auth gateway       # Deploy specific services
#
# ========================================

set -e

COMPOSE_FILE="docker-compose.prod.yml"
PROJECT_DIR="${PROJECT_DIR:-/home/ubuntu/job-manager}"

cd "$PROJECT_DIR"

echo "========================================="
echo "Job Manager - Deployment Started"
echo "Time: $(date)"
echo "========================================="

# Check if specific services were specified
if [ $# -gt 0 ]; then
    SERVICES="$@"
    echo "Deploying specific services: $SERVICES"
else
    SERVICES=""
    echo "Deploying all services"
fi

# Pull latest images
echo ""
echo "Pulling latest images..."
if [ -z "$SERVICES" ]; then
    docker compose -f "$COMPOSE_FILE" pull
else
    docker compose -f "$COMPOSE_FILE" pull $SERVICES
fi

# Restart services
echo ""
echo "Restarting services..."
if [ -z "$SERVICES" ]; then
    docker compose -f "$COMPOSE_FILE" up -d --remove-orphans
else
    docker compose -f "$COMPOSE_FILE" up -d --no-deps $SERVICES
fi

# Wait for services to be healthy
echo ""
echo "Waiting for services to be healthy..."
sleep 10

# Show status
echo ""
echo "Container Status:"
docker compose -f "$COMPOSE_FILE" ps

# Clean up old images
echo ""
echo "Cleaning up old images..."
docker image prune -f

echo ""
echo "========================================="
echo "Deployment Completed Successfully!"
echo "Time: $(date)"
echo "========================================="
