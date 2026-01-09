#!/bin/bash
# =============================================================================
# MediaX MAM - Secret Generation Script
# =============================================================================
# This script generates secure random secrets for production deployment
# Run this script once before first deployment
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SECRETS_DIR="$SCRIPT_DIR/../secrets"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  MediaX Secret Generation Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Create secrets directory
if [ ! -d "$SECRETS_DIR" ]; then
    echo -e "${YELLOW}Creating secrets directory...${NC}"
    mkdir -p "$SECRETS_DIR"
    chmod 700 "$SECRETS_DIR"
fi

# Function to generate random string
generate_secret() {
    openssl rand -base64 48 | tr -d '\n/+=' | head -c 64
}

# Function to generate alphanumeric string (for usernames)
generate_alphanum() {
    openssl rand -base64 32 | tr -d '\n/+=' | head -c 24
}

# Check if secrets already exist
if [ -f "$SECRETS_DIR/database_password.txt" ]; then
    echo -e "${YELLOW}Warning: Secrets already exist!${NC}"
    read -p "Do you want to regenerate all secrets? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "Keeping existing secrets."
        exit 0
    fi
    echo -e "${RED}Regenerating all secrets...${NC}"
fi

echo -e "${GREEN}Generating secrets...${NC}"
echo ""

# Generate Database Password
echo -e "  ${GREEN}✓${NC} Database password"
generate_secret > "$SECRETS_DIR/database_password.txt"

# Generate JWT Secret (256-bit minimum for HS256)
echo -e "  ${GREEN}✓${NC} JWT secret"
generate_secret > "$SECRETS_DIR/jwt_secret.txt"

# Generate JWT Refresh Secret
echo -e "  ${GREEN}✓${NC} JWT refresh secret"
generate_secret > "$SECRETS_DIR/jwt_refresh_secret.txt"

# Generate MinIO Access Key
echo -e "  ${GREEN}✓${NC} MinIO access key"
generate_alphanum > "$SECRETS_DIR/minio_access_key.txt"

# Generate MinIO Secret Key
echo -e "  ${GREEN}✓${NC} MinIO secret key"
generate_secret > "$SECRETS_DIR/minio_secret_key.txt"

# Generate Redis Password
echo -e "  ${GREEN}✓${NC} Redis password"
generate_secret > "$SECRETS_DIR/redis_password.txt"

# Set proper permissions
chmod 600 "$SECRETS_DIR"/*.txt

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Secrets generated successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Secrets stored in: ${YELLOW}$SECRETS_DIR${NC}"
echo ""
echo -e "${RED}IMPORTANT:${NC}"
echo "  1. Back up these secrets securely"
echo "  2. Never commit secrets to version control"
echo "  3. The secrets directory is in .gitignore"
echo ""

# Display generated values for reference (optional)
read -p "Display generated secrets? (y/N): " show_secrets
if [[ $show_secrets =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}Generated Secrets:${NC}"
    echo "  Database Password:  $(cat $SECRETS_DIR/database_password.txt)"
    echo "  JWT Secret:         $(cat $SECRETS_DIR/jwt_secret.txt)"
    echo "  JWT Refresh Secret: $(cat $SECRETS_DIR/jwt_refresh_secret.txt)"
    echo "  MinIO Access Key:   $(cat $SECRETS_DIR/minio_access_key.txt)"
    echo "  MinIO Secret Key:   $(cat $SECRETS_DIR/minio_secret_key.txt)"
    echo "  Redis Password:     $(cat $SECRETS_DIR/redis_password.txt)"
    echo ""
fi

# Also update .env.production REDIS_PASSWORD if file exists
ENV_FILE="$SCRIPT_DIR/../.env.production"
if [ -f "$ENV_FILE" ]; then
    REDIS_PASS=$(cat "$SECRETS_DIR/redis_password.txt")
    sed -i "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASS/" "$ENV_FILE"
    echo -e "${GREEN}Updated REDIS_PASSWORD in .env.production${NC}"
fi

echo -e "${GREEN}Done!${NC}"
