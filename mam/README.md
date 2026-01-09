# GEN21 MediaX AI

**Intelligent Media Asset Management Platform**

## Overview

GEN21 MediaX AI is a comprehensive Media Asset Management (MAM) platform that combines AI-powered metadata extraction, semantic search, collaborative workflows, and multi-channel distribution. Built for modern media operations, it integrates seamlessly with the AdCP ecosystem.

## Key Features

- **AI-Powered Intelligence**: Automatic metadata extraction using NLP, Computer Vision, and Audio Analysis
- **Semantic Search**: Find content using natural language queries
- **Multi-Modal Analysis**: Unified processing for video, images, audio, and documents
- **Collaborative Workflows**: Approval processes, annotations, and real-time collaboration
- **Cloud Storage**: S3-compatible MinIO with CDN integration
- **Event-Driven Architecture**: Kafka-based event processing
- **Enterprise-Grade**: Multi-tenant, RBAC, audit logging

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 22+ (for local development)
- At least 8GB RAM
- 20GB disk space

### Start All Services

```bash
# Clone the repository (if not already cloned)
cd /path/to/AdCP/apps/mam

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Check service health
docker-compose ps
```

### Access Points

Once all services are running:

- **Frontend (Web App)**: http://localhost:3000
- **Backend API**: http://localhost:4000/api/v1
- **API Documentation**: http://localhost:4000/api-docs
- **MinIO Console**: http://localhost:9001 (minioadmin / minioadmin)
- **PostgreSQL**: localhost:5433 (mediax / mediax_password)
- **Redis**: localhost:6380

### First-Time Setup

1. **Create MinIO Buckets** (automatic via minio-init service):
   - content-originals
   - content-processed
   - extraction-artifacts
   - strapi-uploads

2. **Initialize Database** (automatic via TypeORM synchronize):
   - Tables will be created on first API start
   - Default roles automatically seeded (Admin, Manager, Creator, Reviewer, Viewer)
   - Demo tenant automatically created

3. **Default Admin Credentials** (automatically seeded):
   - Email: `admin@demo.mediax.ai`
   - Password: `Admin123!`
   - Tenant: `demo`

   **IMPORTANT**: Change this password in production environments!

## Architecture

GEN21 MediaX AI consists of three main components:

### 1. Frontend (Next.js)
- Modern web application built with Next.js 14
- Server-side rendering for performance
- Real-time updates via WebSocket
- Responsive design for desktop and mobile

### 2. Backend (NestJS)
- RESTful API with Swagger documentation
- TypeORM for database management
- Kafka integration for event processing
- MinIO S3 SDK for storage operations
- Bull queue for job processing

### 3. Infrastructure
- **PostgreSQL**: Asset metadata and relational data
- **Redis**: Caching, sessions, job queues
- **MinIO**: S3-compatible object storage
- **Kafka**: Event streaming and messaging

## Integration with AdCP Ecosystem

MediaX AI integrates with:

- **Metadata Extraction Layer**: AI-powered content analysis
- **Recommendation Service**: Content recommendations
- **Brand Safety Service**: Content safety scoring
- **OTT Platform**: Content publishing
- **OOH System**: Digital signage distribution

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user account
  - Body: `{ email, password, firstName, lastName, username, tenantSlug }`
  - Returns: User object + JWT tokens

- `POST /auth/login` - Login with email and password
  - Body: `{ email, password }`
  - Returns: User object + JWT tokens

- `POST /auth/refresh` - Refresh access token
  - Body: `{ refreshToken }`
  - Returns: New access token

### Assets

- `POST /assets/upload` - Upload new asset file
  - Content-Type: `multipart/form-data`
  - Fields: `file`, `title`, `description`, `folderId`, `customMetadata`
  - Max file size: 5GB
  - Triggers Kafka event for AI processing

- `GET /assets` - List all assets with pagination
  - Query params: `page`, `limit`, `assetType`, `folderId`, `status`, `search`
  - Returns: Paginated list of assets

- `GET /assets/search/tags` - Search assets by AI-generated tags
  - Query params: `tags` (comma-separated)
  - Returns: Assets matching any of the tags

- `GET /assets/:id` - Get single asset details
  - Returns: Asset with all metadata including AI features

- `GET /assets/:id/download` - Get presigned download URL
  - Query params: `expiresIn` (seconds, default 3600)
  - Returns: Temporary download URL

- `PUT /assets/:id` - Update asset metadata
  - Body: `{ title, description, customMetadata, status }`
  - Permission: asset.update

- `DELETE /assets/:id` - Soft delete asset
  - Sets deletedAt timestamp
  - Permission: asset.delete

- `DELETE /assets/:id/permanent` - Permanently delete asset
  - Removes from database and MinIO storage
  - Permission: asset.delete

### Folders

- `POST /folders` - Create new folder
  - Body: `{ name, description, parentFolderId }`
  - Automatically calculates path and depth

- `GET /folders` - List all folders (hierarchical)
  - Query params: `parentFolderId` (filter by parent)
  - Returns: Folders with depth and path information

- `GET /folders/:id` - Get folder details with child folders
  - Returns: Folder object with children array

- `PUT /folders/:id` - Update folder metadata
  - Body: `{ name, description }`

- `PUT /folders/:id/move` - Move folder to new parent
  - Body: `{ newParentId }`
  - Updates all descendant paths automatically

- `DELETE /folders/:id` - Soft delete folder
  - Also soft-deletes all assets in folder

### Users

- `GET /users` - List all users in tenant
  - Permission: user.read
  - Returns: Users with role information

- `GET /users/:id` - Get user details
  - Returns: User object with tenant and role

- `PUT /users/:id` - Update user
  - Body: `{ firstName, lastName, username, roleId, isActive }`
  - Permission: user.update

- `DELETE /users/:id` - Soft delete user
  - Permission: user.delete

### Tenants

- `GET /tenants` - List all tenants (admin only)
  - Returns: All tenants with storage usage

- `GET /tenants/:id` - Get tenant details
  - Returns: Tenant with settings and storage stats

- `PUT /tenants/:id` - Update tenant
  - Body: `{ name, plan, storageLimitGb, settings }`
  - Permission: tenant.update

## Project Structure

```
mam/
├── backend/                          # NestJS backend application
│   ├── src/
│   │   ├── app.module.ts            # Root application module
│   │   ├── main.ts                  # Application entry point
│   │   ├── config/
│   │   │   └── configuration.ts     # Environment configuration
│   │   ├── auth/                    # Authentication module
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts      # Login, register, token generation
│   │   │   ├── auth.controller.ts   # Auth endpoints
│   │   │   ├── strategies/
│   │   │   │   ├── local.strategy.ts  # Username/password validation
│   │   │   │   └── jwt.strategy.ts    # JWT token validation
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   ├── users/                   # Users and roles module
│   │   │   ├── users.module.ts
│   │   │   ├── users.service.ts     # User CRUD operations
│   │   │   ├── users.controller.ts
│   │   │   ├── roles.service.ts     # Role management and seeding
│   │   │   └── entities/
│   │   │       ├── user.entity.ts   # User model with bcrypt password
│   │   │       └── role.entity.ts   # Role model with permissions array
│   │   ├── tenants/                 # Multi-tenancy module
│   │   │   ├── tenants.module.ts
│   │   │   ├── tenants.service.ts   # Tenant CRUD and storage tracking
│   │   │   ├── tenants.controller.ts
│   │   │   └── entities/
│   │   │       └── tenant.entity.ts
│   │   ├── assets/                  # Asset management module
│   │   │   ├── assets.module.ts
│   │   │   ├── assets.service.ts    # Asset CRUD, AI metadata updates
│   │   │   ├── assets.controller.ts # Upload, download, search endpoints
│   │   │   ├── entities/
│   │   │   │   └── asset.entity.ts  # Asset with AI metadata fields
│   │   │   └── dto/
│   │   │       ├── create-asset.dto.ts
│   │   │       ├── update-asset.dto.ts
│   │   │       └── upload-asset.dto.ts
│   │   ├── folders/                 # Hierarchical folder module
│   │   │   ├── folders.module.ts
│   │   │   ├── folders.service.ts   # Folder tree operations
│   │   │   ├── folders.controller.ts
│   │   │   └── entities/
│   │   │       └── folder.entity.ts # Folder with path and depth
│   │   ├── storage/                 # MinIO S3 storage module
│   │   │   ├── storage.module.ts
│   │   │   └── storage.service.ts   # Upload, download, presigned URLs
│   │   ├── events/                  # Kafka event module
│   │   │   ├── events.module.ts
│   │   │   └── events.service.ts    # Publish/consume Kafka events
│   │   ├── database/                # Database utilities
│   │   │   ├── database.module.ts
│   │   │   └── seed.service.ts      # Auto-seed roles, tenant, admin user
│   │   └── common/                  # Shared utilities
│   │       ├── decorators/
│   │       │   └── current-user.decorator.ts
│   │       ├── filters/
│   │       └── guards/
│   ├── test/                        # E2E tests
│   ├── Dockerfile                   # Multi-stage Docker build
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/                        # Next.js frontend (planned)
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml               # Full stack orchestration
└── README.md                        # This file
```

## Database Schema

### Core Tables

- **tenants**: Multi-tenant organizations
  - `id`, `name`, `slug`, `plan`, `storageLimitGb`, `storageUsedGb`, `settings`

- **roles**: RBAC roles with permissions
  - `id`, `name`, `slug`, `permissions[]`, `tenantId`
  - Default roles: Admin, Manager, Creator, Reviewer, Viewer

- **users**: User accounts
  - `id`, `email`, `passwordHash`, `firstName`, `lastName`, `username`
  - `tenantId`, `roleId`, `isActive`, `lastLoginAt`

- **folders**: Hierarchical folder structure
  - `id`, `name`, `description`, `path`, `depth`, `parentFolderId`, `tenantId`

- **assets**: Media asset records
  - Basic: `id`, `filename`, `title`, `assetType`, `mimeType`, `fileSize`
  - Storage: `assetKey`, `bucket`, `storageClass`
  - Metadata: `duration`, `width`, `height`, `frameRate`, `bitrate`
  - AI Fields: `aiTags[]`, `aiObjects`, `aiFaces`, `aiScenes`, `aiTranscript`
  - Relations: `folderId`, `tenantId`, `createdById`
  - Status: `status`, `processingProgress`, `processingError`

## Event-Driven Processing

### Asset Upload Flow

1. Client uploads file via `POST /assets/upload`
2. Backend stores file in MinIO `content-originals` bucket
3. Asset record created with status `PROCESSING`
4. Kafka event `asset.uploaded` published to topic
5. Metadata Extraction Service consumes event
6. AI processing extracts features (vision, audio, NLP)
7. Service publishes `metadata.enriched` event
8. Backend consumes event and updates asset with AI metadata
9. Asset status changed to `READY`

### Kafka Topics

- **asset.uploaded**: Published by MAM when new asset uploaded
- **metadata.enriched**: Consumed by MAM from Metadata Extraction Layer
- **asset.deleted**: Published when asset permanently deleted
- **asset.updated**: Published when asset metadata changes

## Role-Based Access Control

### Default Roles and Permissions

1. **Admin** (`*`)
   - Full system access
   - User management
   - Tenant configuration

2. **Manager**
   - `asset.*`, `folder.*`, `user.read`, `user.create`
   - Manage all assets and folders
   - Create new users

3. **Creator**
   - `asset.create`, `asset.update.own`, `asset.delete.own`, `folder.*`
   - Create and manage own assets
   - Full folder management

4. **Reviewer**
   - `asset.read`, `asset.update.status`, `folder.read`
   - Review and approve assets
   - Read-only folder access

5. **Viewer**
   - `asset.read`, `folder.read`
   - Read-only access to all content

## Development

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Start development server
npm run start:dev

# Run tests
npm test

# Generate database migration
npm run migration:generate -- src/database/migrations/MigrationName

# Run migrations
npm run migration:run
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check
```

## Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v
```

## Environment Variables

### Backend (.env)

Key environment variables (see `backend/.env.example` for full list):

- `DATABASE_HOST`: PostgreSQL host
- `MINIO_ENDPOINT`: MinIO S3 endpoint
- `KAFKA_BROKERS`: Kafka broker addresses
- `JWT_SECRET`: JWT signing secret
- `METADATA_API_URL`: Metadata Extraction Layer URL

### Frontend (.env)

Key environment variables (see `frontend/.env.example` for full list):

- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_WS_URL`: WebSocket server URL
- `NEXT_PUBLIC_APP_NAME`: Application name

## Troubleshooting

### Services Not Starting

```bash
# Check service logs
docker-compose logs service-name

# Restart specific service
docker-compose restart service-name

# Rebuild service
docker-compose up -d --build service-name
```

### Database Connection Issues

```bash
# Check PostgreSQL logs
docker-compose logs mediax-postgres

# Connect to PostgreSQL directly
docker exec -it mediax-postgres psql -U mediax -d mediax
```

### Storage Issues

```bash
# Check MinIO logs
docker-compose logs minio

# Access MinIO console
# Open http://localhost:9001
```

## Documentation

For detailed documentation, see:

- **Complete Documentation**: `/docs/GEN21_MEDIAX_AI_MAM.md`
- **Backend API Docs**: http://localhost:4000/api-docs (when running)
- **Architecture Diagrams**: In main documentation
- **Database Schema**: In main documentation

## Roadmap

See `GEN21_MEDIAX_AI_MAM.md` for the complete 7-phase implementation roadmap (28 weeks).

**Current Status**: Phase 1 Foundation in progress

## Support

For issues and questions:
- Check the documentation
- Review Docker logs
- Open an issue in the repository

## License

UNLICENSED - Proprietary Software

---

**GEN21 MediaX AI** - Intelligent Media Asset Management
