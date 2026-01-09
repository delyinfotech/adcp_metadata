# =============================================================================
# MediaX API - Multi-stage Dockerfile
# =============================================================================

# -----------------------------------------------------------------------------
# Development Stage
# -----------------------------------------------------------------------------
FROM node:22-alpine AS development

WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 4000

# Start development server
CMD ["npm", "run", "start:dev"]


# -----------------------------------------------------------------------------
# Build Stage
# -----------------------------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Prune dev dependencies
RUN npm prune --production


# -----------------------------------------------------------------------------
# Production Stage
# -----------------------------------------------------------------------------
FROM node:22-alpine AS production

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

WORKDIR /app

# Install wget for health checks and dumb-init for proper signal handling
RUN apk add --no-cache wget dumb-init

# Copy built application from build stage
COPY --from=build --chown=nestjs:nodejs /app/package*.json ./
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist

# Copy SQL init files if any
COPY --chown=nestjs:nodejs init-pgvector.sql ./

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --spider -q http://localhost:4000/api/v1/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start production server
CMD ["node", "dist/main.js"]

# Labels
LABEL org.opencontainers.image.title="MediaX API" \
      org.opencontainers.image.description="MediaX Media Asset Management API" \
      org.opencontainers.image.vendor="MediaX" \
      org.opencontainers.image.source="https://github.com/your-org/mediax"
