#!/bin/bash
# =============================================================================
# MediaX Full Stack - Production Deployment Script
# =============================================================================
# Deploys both MAM app and Metadata Extraction services
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAM_DIR="$SCRIPT_DIR/.."
EXTRACTION_DIR="$MAM_DIR/../../services/metadata-extraction"
MAM_COMPOSE="$MAM_DIR/docker-compose.prod.yml"
EXTRACTION_COMPOSE="$EXTRACTION_DIR/docker-compose.prod.yml"
ENV_FILE="$MAM_DIR/.env.production"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  MediaX Full Stack Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# -----------------------------------------------------------------------------
# Pre-flight checks
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Running pre-flight checks...${NC}"

# Check files exist
if [ ! -f "$MAM_COMPOSE" ]; then
    echo -e "${RED}Error: MAM docker-compose.prod.yml not found${NC}"
    exit 1
fi

if [ ! -f "$EXTRACTION_COMPOSE" ]; then
    echo -e "${RED}Error: Metadata extraction docker-compose.prod.yml not found${NC}"
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: .env.production not found${NC}"
    exit 1
fi

echo -e "  ${GREEN}✓${NC} All compose files found"

# Source environment
source "$ENV_FILE"

echo ""

# -----------------------------------------------------------------------------
# Step 1: Deploy MAM Core Services
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Step 1: Deploying MAM core services...${NC}"
docker compose -f "$MAM_COMPOSE" --env-file "$ENV_FILE" up -d

echo -e "${GREEN}  ✓ MAM services started${NC}"
echo ""

# Wait for core services to be healthy
echo -e "${YELLOW}Waiting for core services...${NC}"
sleep 15

# Check PostgreSQL
until docker exec mediax-postgres pg_isready -U "$DATABASE_USERNAME" > /dev/null 2>&1; do
    echo "  Waiting for PostgreSQL..."
    sleep 5
done
echo -e "  ${GREEN}✓${NC} PostgreSQL ready"

# Check Redis
until docker exec mediax-redis redis-cli -a "$REDIS_PASSWORD" ping > /dev/null 2>&1; do
    echo "  Waiting for Redis..."
    sleep 5
done
echo -e "  ${GREEN}✓${NC} Redis ready"

# Check MinIO
until docker exec mediax-minio curl -sf http://localhost:9000/minio/health/live > /dev/null 2>&1; do
    echo "  Waiting for MinIO..."
    sleep 5
done
echo -e "  ${GREEN}✓${NC} MinIO ready"

echo ""

# -----------------------------------------------------------------------------
# Step 2: Deploy Metadata Extraction Services
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Step 2: Deploying metadata extraction services...${NC}"
docker compose -f "$EXTRACTION_COMPOSE" --env-file "$ENV_FILE" up -d

echo -e "${GREEN}  ✓ Metadata extraction services started${NC}"
echo ""

# -----------------------------------------------------------------------------
# Step 3: Wait for all services
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Step 3: Waiting for all services to be healthy...${NC}"
sleep 30

# Check service health
services=(
    "mediax-traefik"
    "mediax-postgres"
    "mediax-redis"
    "mediax-minio"
    "mediax-kafka"
    "mediax-api"
    "mediax-web"
    "metadata-layer"
    "nlp-extraction"
    "vision-extraction"
    "audio-extraction"
)

all_healthy=true
for service in "${services[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "^${service}$"; then
        status=$(docker inspect --format='{{.State.Health.Status}}' "$service" 2>/dev/null || echo "no healthcheck")
        if [ "$status" == "healthy" ]; then
            echo -e "  ${GREEN}✓${NC} $service: healthy"
        elif [ "$status" == "starting" ]; then
            echo -e "  ${YELLOW}○${NC} $service: starting..."
            all_healthy=false
        elif [ "$status" == "no healthcheck" ]; then
            running=$(docker inspect --format='{{.State.Running}}' "$service" 2>/dev/null)
            if [ "$running" == "true" ]; then
                echo -e "  ${GREEN}✓${NC} $service: running"
            else
                echo -e "  ${RED}✗${NC} $service: not running"
                all_healthy=false
            fi
        else
            echo -e "  ${RED}✗${NC} $service: $status"
            all_healthy=false
        fi
    else
        echo -e "  ${RED}✗${NC} $service: not found"
        all_healthy=false
    fi
done

echo ""

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Services accessible at:"
echo -e "  ${BLUE}Web App:${NC}           https://$DOMAIN"
echo -e "  ${BLUE}API:${NC}               https://api.$DOMAIN"
echo -e "  ${BLUE}CDN/Storage:${NC}       https://cdn.$DOMAIN"
echo -e "  ${BLUE}MinIO Console:${NC}     https://minio.$DOMAIN"
echo -e "  ${BLUE}Traefik Dashboard:${NC} https://traefik.$DOMAIN"
echo ""
echo -e "Useful commands:"
echo -e "  ${YELLOW}View all logs:${NC}"
echo "    docker compose -f docker-compose.prod.yml logs -f"
echo "    docker compose -f ../../services/metadata-extraction/docker-compose.prod.yml logs -f"
echo ""
echo -e "  ${YELLOW}Stop all services:${NC}"
echo "    docker compose -f docker-compose.prod.yml down"
echo "    docker compose -f ../../services/metadata-extraction/docker-compose.prod.yml down"
echo ""

if [ "$all_healthy" = false ]; then
    echo -e "${YELLOW}Note: Some services are still starting up.${NC}"
    echo -e "Check status with: docker ps"
fi
