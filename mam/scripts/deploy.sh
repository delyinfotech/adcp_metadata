#!/bin/bash
# =============================================================================
# MediaX MAM - Production Deployment Script
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/.."
COMPOSE_FILE="$PROJECT_DIR/docker-compose.prod.yml"
ENV_FILE="$PROJECT_DIR/.env.production"
SECRETS_DIR="$PROJECT_DIR/secrets"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  MediaX Production Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# -----------------------------------------------------------------------------
# Pre-flight checks
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Running pre-flight checks...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} Docker installed"

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} Docker Compose installed"

# Check environment file
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: .env.production not found${NC}"
    echo "  Please copy .env.production.example to .env.production and configure it"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} Environment file exists"

# Check secrets
REQUIRED_SECRETS=(
    "database_password.txt"
    "jwt_secret.txt"
    "jwt_refresh_secret.txt"
    "minio_access_key.txt"
    "minio_secret_key.txt"
    "redis_password.txt"
)

for secret in "${REQUIRED_SECRETS[@]}"; do
    if [ ! -f "$SECRETS_DIR/$secret" ]; then
        echo -e "${RED}Error: Missing secret: $secret${NC}"
        echo "  Run ./scripts/create-secrets.sh to generate secrets"
        exit 1
    fi
done
echo -e "  ${GREEN}✓${NC} All secrets present"

# Check domain configuration
source "$ENV_FILE"
if [ -z "$DOMAIN" ] || [ "$DOMAIN" == "yourdomain.com" ]; then
    echo -e "${RED}Error: DOMAIN not configured in .env.production${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} Domain configured: $DOMAIN"

echo ""

# -----------------------------------------------------------------------------
# Build images
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Building Docker images...${NC}"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache

echo ""

# -----------------------------------------------------------------------------
# Deploy
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Deploying services...${NC}"

# Pull latest base images
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull

# Start services
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

echo ""

# -----------------------------------------------------------------------------
# Health check
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
sleep 10

# Check service health
services=("mediax-postgres" "mediax-redis" "mediax-minio" "mediax-api" "mediax-web")
all_healthy=true

for service in "${services[@]}"; do
    status=$(docker inspect --format='{{.State.Health.Status}}' "$service" 2>/dev/null || echo "not found")
    if [ "$status" == "healthy" ]; then
        echo -e "  ${GREEN}✓${NC} $service: healthy"
    elif [ "$status" == "starting" ]; then
        echo -e "  ${YELLOW}○${NC} $service: starting..."
        all_healthy=false
    else
        echo -e "  ${RED}✗${NC} $service: $status"
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
echo -e "  ${BLUE}Web App:${NC}         https://$DOMAIN"
echo -e "  ${BLUE}API:${NC}             https://api.$DOMAIN"
echo -e "  ${BLUE}MinIO Console:${NC}   https://minio.$DOMAIN"
echo -e "  ${BLUE}Traefik Dashboard:${NC} https://traefik.$DOMAIN"
echo ""
echo -e "Useful commands:"
echo -e "  ${YELLOW}View logs:${NC}       docker compose -f docker-compose.prod.yml logs -f"
echo -e "  ${YELLOW}Stop services:${NC}   docker compose -f docker-compose.prod.yml down"
echo -e "  ${YELLOW}Restart service:${NC} docker compose -f docker-compose.prod.yml restart <service>"
echo ""

if [ "$all_healthy" = false ]; then
    echo -e "${YELLOW}Note: Some services are still starting. Check status with:${NC}"
    echo "  docker compose -f docker-compose.prod.yml ps"
fi
