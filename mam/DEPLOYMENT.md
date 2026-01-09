# GEN21 MediaX AI - Production Deployment Guide

This guide covers production deployment of the GEN21 MediaX AI platform across different environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Database Configuration](#database-configuration)
4. [Storage Configuration](#storage-configuration)
5. [Kafka Configuration](#kafka-configuration)
6. [Backend Deployment](#backend-deployment)
7. [Frontend Deployment](#frontend-deployment)
8. [Security Hardening](#security-hardening)
9. [Monitoring and Logging](#monitoring-and-logging)
10. [Backup and Recovery](#backup-and-recovery)
11. [Scaling Considerations](#scaling-considerations)

## Prerequisites

### Hardware Requirements

**Minimum Production Configuration:**
- CPU: 8 cores
- RAM: 16GB
- Storage: 500GB SSD (database + logs)
- Object Storage: 1TB+ (media files)

**Recommended Production Configuration:**
- CPU: 16+ cores
- RAM: 32GB+
- Storage: 1TB NVMe SSD
- Object Storage: 10TB+ with backup

### Software Requirements

- Docker 24.x or higher
- Docker Compose 2.x (for single-server deployments)
- Kubernetes 1.28+ (for cluster deployments)
- PostgreSQL 16
- Redis 7.x
- MinIO (latest) or AWS S3
- Apache Kafka 3.x or AWS MSK
- Node.js 22.x (for building assets)

## Infrastructure Setup

### Option 1: Single Server Deployment (Docker Compose)

For small to medium deployments (up to 100 concurrent users):

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Option 2: Kubernetes Cluster Deployment

For large deployments (100+ concurrent users):

```bash
# Prerequisites: Running Kubernetes cluster (EKS, GKE, AKS, or self-hosted)
kubectl version --client

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify
helm version
```

## Database Configuration

### PostgreSQL Production Setup

#### Option A: Managed Service (Recommended)

Use managed PostgreSQL services:
- **AWS**: RDS for PostgreSQL
- **Google Cloud**: Cloud SQL for PostgreSQL
- **Azure**: Azure Database for PostgreSQL
- **DigitalOcean**: Managed PostgreSQL

Configuration:
- Instance type: db.t3.medium or higher
- Storage: 100GB+ with autoscaling
- Multi-AZ deployment for high availability
- Automated backups (7-30 days retention)
- Enable SSL/TLS connections

#### Option B: Self-Hosted PostgreSQL

```bash
# Install PostgreSQL 16
sudo apt install -y postgresql-16 postgresql-contrib-16

# Configure PostgreSQL
sudo nano /etc/postgresql/16/main/postgresql.conf
```

Key production settings:

```conf
# Connection settings
max_connections = 200
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 1GB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 20MB
min_wal_size = 1GB
max_wal_size = 4GB

# Enable SSL
ssl = on
ssl_cert_file = '/etc/ssl/certs/server.crt'
ssl_key_file = '/etc/ssl/private/server.key'

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000
```

Create production database:

```sql
-- Connect as superuser
CREATE USER mediax_prod WITH PASSWORD 'STRONG_PASSWORD_HERE';
CREATE DATABASE mediax_prod OWNER mediax_prod;

-- Grant necessary privileges
GRANT ALL PRIVILEGES ON DATABASE mediax_prod TO mediax_prod;

-- Connect to database
\c mediax_prod

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

## Storage Configuration

### MinIO Production Setup

#### Option A: MinIO Distributed Mode (4+ nodes)

```bash
# On each node, create data directories
sudo mkdir -p /mnt/data1 /mnt/data2 /mnt/data3 /mnt/data4

# Start MinIO in distributed mode
docker run -d \
  --name minio \
  -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=admin" \
  -e "MINIO_ROOT_PASSWORD=STRONG_PASSWORD" \
  -v /mnt/data1:/data1 \
  -v /mnt/data2:/data2 \
  -v /mnt/data3:/data3 \
  -v /mnt/data4:/data4 \
  minio/minio server \
  http://node{1...4}/data{1...4} \
  --console-address ":9001"
```

#### Option B: AWS S3

Update backend `.env`:

```env
# Use AWS S3 instead of MinIO
MINIO_ENDPOINT=s3.amazonaws.com
MINIO_ACCESS_KEY=YOUR_AWS_ACCESS_KEY
MINIO_SECRET_KEY=YOUR_AWS_SECRET_KEY
MINIO_USE_SSL=true
MINIO_REGION=us-east-1

# S3 Bucket names
MINIO_BUCKET_ORIGINALS=mediax-content-originals
MINIO_BUCKET_PROCESSED=mediax-content-processed
MINIO_BUCKET_ARTIFACTS=mediax-extraction-artifacts
```

Create S3 buckets:

```bash
aws s3 mb s3://mediax-content-originals --region us-east-1
aws s3 mb s3://mediax-content-processed --region us-east-1
aws s3 mb s3://mediax-extraction-artifacts --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket mediax-content-originals \
  --versioning-configuration Status=Enabled

# Configure lifecycle policies
aws s3api put-bucket-lifecycle-configuration \
  --bucket mediax-content-originals \
  --lifecycle-configuration file://s3-lifecycle.json
```

S3 Lifecycle Policy (`s3-lifecycle.json`):

```json
{
  "Rules": [
    {
      "Id": "TransitionToIA",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 180,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

## Kafka Configuration

### Option A: Managed Kafka (Recommended)

- **AWS MSK**: Managed Streaming for Apache Kafka
- **Confluent Cloud**: Fully managed Kafka
- **Azure Event Hubs**: Kafka-compatible event streaming

### Option B: Self-Hosted Kafka Cluster

```bash
# kafka-docker-compose.yml
version: '3.8'

services:
  zookeeper-1:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_SERVER_ID: 1
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
      ZOOKEEPER_INIT_LIMIT: 5
      ZOOKEEPER_SYNC_LIMIT: 2
      ZOOKEEPER_SERVERS: zookeeper-1:2888:3888;zookeeper-2:2888:3888;zookeeper-3:2888:3888
    volumes:
      - zookeeper-1-data:/var/lib/zookeeper/data
      - zookeeper-1-logs:/var/lib/zookeeper/log

  kafka-1:
    image: confluentinc/cp-kafka:latest
    depends_on:
      - zookeeper-1
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper-1:2181,zookeeper-2:2181,zookeeper-3:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-1:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 2
      KAFKA_LOG_RETENTION_HOURS: 168
      KAFKA_LOG_SEGMENT_BYTES: 1073741824
      KAFKA_NUM_PARTITIONS: 6
    volumes:
      - kafka-1-data:/var/lib/kafka/data

volumes:
  zookeeper-1-data:
  zookeeper-1-logs:
  kafka-1-data:
```

## Backend Deployment

### Build Production Docker Image

```bash
cd backend

# Build multi-arch image
docker build \
  --target production \
  --platform linux/amd64 \
  -t mediax-api:latest \
  .

# Tag for registry
docker tag mediax-api:latest your-registry.com/mediax-api:v1.0.0

# Push to registry
docker push your-registry.com/mediax-api:v1.0.0
```

### Production Environment Variables

Create `.env.production`:

```env
# Application
NODE_ENV=production
PORT=4000
LOG_LEVEL=info

# Database (use managed service endpoint)
DB_HOST=your-postgres-endpoint.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=mediax_prod
DB_PASSWORD=STRONG_DATABASE_PASSWORD
DB_DATABASE=mediax_prod
DB_SYNCHRONIZE=false
DB_LOGGING=false
DB_SSL=true

# JWT (use strong random values)
JWT_SECRET=GENERATE_STRONG_SECRET_HERE_64_CHARS_MIN
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=GENERATE_ANOTHER_STRONG_SECRET_HERE_64_CHARS_MIN
JWT_REFRESH_EXPIRES_IN=7d

# MinIO/S3
MINIO_ENDPOINT=s3.amazonaws.com
MINIO_PORT=443
MINIO_ACCESS_KEY=YOUR_AWS_ACCESS_KEY
MINIO_SECRET_KEY=YOUR_AWS_SECRET_KEY
MINIO_USE_SSL=true
MINIO_REGION=us-east-1
MINIO_BUCKET_ORIGINALS=mediax-content-originals
MINIO_BUCKET_PROCESSED=mediax-content-processed
MINIO_BUCKET_ARTIFACTS=mediax-extraction-artifacts

# Redis (use managed service)
REDIS_HOST=your-redis-endpoint.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=REDIS_PASSWORD_IF_ENABLED
REDIS_TLS=true

# Kafka (use managed service)
KAFKA_BROKERS=b-1.your-cluster.kafka.us-east-1.amazonaws.com:9092,b-2.your-cluster.kafka.us-east-1.amazonaws.com:9092
KAFKA_CLIENT_ID=mediax-api-prod
KAFKA_GROUP_ID=mediax-consumer-group-prod
KAFKA_SSL=true
KAFKA_SASL_MECHANISM=PLAIN
KAFKA_SASL_USERNAME=your_kafka_username
KAFKA_SASL_PASSWORD=your_kafka_password

# CDN (CloudFront or similar)
CDN_URL=https://cdn.yourdomain.com

# CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Metadata Extraction Service
METADATA_API_URL=http://metadata-extraction-service:8000
```

Generate strong secrets:

```bash
# Generate JWT secrets
openssl rand -base64 64

# Generate another secret
openssl rand -base64 64
```

### Docker Compose Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  mediax-api:
    image: your-registry.com/mediax-api:v1.0.0
    restart: always
    ports:
      - "4000:4000"
    env_file:
      - .env.production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
        reservations:
          cpus: '2'
          memory: 4G

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - mediax-api
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mediax-api
  namespace: mediax
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mediax-api
  template:
    metadata:
      labels:
        app: mediax-api
    spec:
      containers:
      - name: mediax-api
        image: your-registry.com/mediax-api:v1.0.0
        ports:
        - containerPort: 4000
        envFrom:
        - secretRef:
            name: mediax-secrets
        - configMapRef:
            name: mediax-config
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: mediax-api
  namespace: mediax
spec:
  selector:
    app: mediax-api
  ports:
  - protocol: TCP
    port: 4000
    targetPort: 4000
  type: LoadBalancer
```

### Database Migrations

Run migrations before deploying:

```bash
# Connect to production database
export DB_HOST=your-production-db-host
export DB_PASSWORD=your-production-password

# Run migrations
npm run migration:run

# Verify
npm run migration:show
```

## Frontend Deployment

### Build Production Frontend

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Build Docker image
docker build -t mediax-web:latest .
```

### Frontend Environment Variables

```env
# .env.production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
NEXT_PUBLIC_APP_NAME=GEN21 MediaX AI
NEXT_PUBLIC_CDN_URL=https://cdn.yourdomain.com
```

## Security Hardening

### 1. SSL/TLS Configuration

Use Let's Encrypt for free SSL certificates:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 2. Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow application ports (only from trusted sources)
sudo ufw allow from 10.0.0.0/8 to any port 5432  # PostgreSQL
sudo ufw allow from 10.0.0.0/8 to any port 6379  # Redis
```

### 3. Environment Security

- Never commit `.env` files to version control
- Use secret management services:
  - AWS Secrets Manager
  - HashiCorp Vault
  - Azure Key Vault
  - Google Secret Manager

### 4. Database Security

- Enable SSL/TLS for connections
- Use strong passwords (20+ characters)
- Restrict network access
- Regular security patches
- Enable audit logging

### 5. Application Security

Update `backend/src/main.ts`:

```typescript
// Enable security headers
app.use(helmet());

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);

// CORS configuration
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(','),
  credentials: true,
});
```

## Monitoring and Logging

### 1. Application Monitoring

Install monitoring tools:

```bash
# Prometheus + Grafana
docker-compose -f monitoring-compose.yml up -d
```

### 2. Log Aggregation

Use centralized logging:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Grafana Loki**
- **AWS CloudWatch**
- **Datadog**

### 3. Health Checks

Add health endpoint in `backend/src/app.controller.ts`:

```typescript
@Get('health')
healthCheck(): object {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  };
}
```

## Backup and Recovery

### Database Backups

Automated PostgreSQL backups:

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/mediax_$DATE.sql.gz"

# Create backup
pg_dump -h $DB_HOST -U $DB_USERNAME $DB_DATABASE | gzip > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://your-backup-bucket/postgres/

# Delete local backups older than 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

Add to crontab:

```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

### Object Storage Backups

Enable versioning and cross-region replication on S3/MinIO.

## Scaling Considerations

### Horizontal Scaling

1. **API Servers**: Scale to 3+ instances behind load balancer
2. **Database**: Use read replicas for read-heavy workloads
3. **Redis**: Use Redis Cluster for high availability
4. **Kafka**: Add more brokers and partitions

### Vertical Scaling

- Monitor resource usage
- Increase CPU/memory as needed
- Use auto-scaling groups in cloud environments

### CDN Integration

Configure CloudFront or similar CDN:

```javascript
// In storage.service.ts
getCDNUrl(bucket: string, key: string): string {
  if (process.env.CDN_URL) {
    return `${process.env.CDN_URL}/${bucket}/${key}`;
  }
  return this.getPresignedUrl(bucket, key);
}
```

## Troubleshooting

### High CPU Usage

```bash
# Check container stats
docker stats

# Check application logs
docker logs mediax-api --tail 100
```

### Database Connection Pool Exhausted

Increase pool size in `src/app.module.ts`:

```typescript
extra: {
  max: 20, // Increase from default 10
  connectionTimeoutMillis: 5000,
}
```

### Out of Memory

```bash
# Increase Node.js heap size
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

## Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Strong secrets generated
- [ ] SSL/TLS certificates installed
- [ ] Database migrations run
- [ ] Backups configured and tested
- [ ] Monitoring and alerts configured
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Firewall rules applied
- [ ] Health checks passing
- [ ] Load testing completed
- [ ] Disaster recovery plan documented
- [ ] Change default admin password
- [ ] Enable audit logging
- [ ] Configure CORS properly
- [ ] Set up CDN
- [ ] Test backup restoration

## Support

For deployment issues:
- Review application logs
- Check infrastructure status
- Consult documentation
- Contact support team

---

**GEN21 MediaX AI** - Production Deployment Guide
