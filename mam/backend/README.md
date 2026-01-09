# GEN21 MediaX AI - Backend API

Media Asset Management Platform - Backend Service

**Status:** Production Ready (2026-01-08)

## Features

- NestJS 10+ framework with TypeScript
- PostgreSQL database with TypeORM + pgvector for semantic search
- JWT authentication with Passport
- MinIO S3-compatible storage integration
- Kafka event-driven architecture
- Redis caching and session management
- Swagger/OpenAPI documentation
- Role-based access control (RBAC)
- Multi-tenant support
- AI-powered metadata extraction integration
- Docker secrets support for production

## Prerequisites

- Node.js 22+
- Docker & Docker Compose

## Quick Start (Docker - Development)

```bash
# Copy environment file
cp .env.example .env

# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f mediax-api

# Stop services
docker-compose down
```

API will be available at:
- API: http://localhost:4000/api/v1
- Swagger Docs: http://localhost:4000/api-docs

## Production Deployment

Production deployment uses Docker Compose with Traefik reverse proxy and Let's Encrypt SSL.

### First-Time Setup

```bash
# Navigate to MAM root
cd /apps/mam

# Copy and configure production environment
cp .env.production.example .env.production
# Edit .env.production with your domain and settings

# Generate secure secrets
./scripts/create-secrets.sh
```

### Deploy

```bash
# Deploy MAM only
./scripts/deploy.sh

# Deploy full stack (MAM + Metadata Extraction)
./scripts/deploy-full.sh
```

### Verify Deployment

```bash
# Check service health
docker ps

# Test API health endpoint
curl https://api.yourdomain.com/api/v1/health
```

### Production URLs

After deployment, services are accessible at:
- Web App: `https://yourdomain.com`
- API: `https://api.yourdomain.com`
- API Docs: `https://api.yourdomain.com/api-docs`
- MinIO Console: `https://minio.yourdomain.com`

### Docker Secrets

Production uses Docker secrets (not environment variables) for sensitive data:
- `database_password.txt`
- `jwt_secret.txt`
- `jwt_refresh_secret.txt`
- `minio_access_key.txt`
- `minio_secret_key.txt`
- `redis_password.txt`

Secrets are stored in `/apps/mam/secrets/` (excluded from git).

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Run tests
npm test

# Run e2e tests
npm run test:e2e

# Build for production
npm run build

# Start production server
npm run start:prod
```

## Database Migrations

```bash
# Generate migration
npm run migration:generate -- src/database/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## Project Structure

```
src/
├── auth/           # Authentication module
├── users/          # User management
├── tenants/        # Multi-tenancy
├── assets/         # Asset management
├── folders/        # Folder organization
├── storage/        # MinIO integration
├── events/         # Kafka integration
├── search/         # Semantic search (CLIP embeddings)
├── config/         # Configuration (supports Docker secrets)
└── common/         # Shared utilities
```

## Environment Variables

See `.env.example` for development configuration options.
See `.env.production.example` for production configuration.

## Configuration

The backend supports reading secrets from files (for Docker secrets) or environment variables:

```typescript
// In production, secrets are read from files
// /run/secrets/database_password
// /run/secrets/jwt_secret
// etc.

// Falls back to environment variables in development
```

## API Documentation

Interactive API documentation is available at `/api-docs` when the server is running.

## Sample Credentials (Development Only)

- Email: `admin@demo.mediax.ai`
- Password: `Admin123!`

## License

UNLICENSED - Proprietary Software
