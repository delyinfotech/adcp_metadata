# =============================================================================
# MediaX Web - Multi-stage Dockerfile
# =============================================================================

# -----------------------------------------------------------------------------
# Development Stage
# -----------------------------------------------------------------------------
FROM node:22-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]


# -----------------------------------------------------------------------------
# Dependencies Stage
# -----------------------------------------------------------------------------
FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
RUN npm ci


# -----------------------------------------------------------------------------
# Build Stage
# -----------------------------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_ENABLE_AI_FEATURES

# Set build-time environment variables
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
ENV NEXT_PUBLIC_ENABLE_AI_FEATURES=${NEXT_PUBLIC_ENABLE_AI_FEATURES}

# Build the application
RUN npm run build


# -----------------------------------------------------------------------------
# Production Stage
# -----------------------------------------------------------------------------
FROM node:22-alpine AS production

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init wget

ENV NODE_ENV=production

# Copy necessary files from build stage
COPY --from=build --chown=nextjs:nodejs /app/next.config.js ./
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/package.json ./package.json

# Copy standalone build (if using output: 'standalone')
# COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy standard build
COPY --from=build --chown=nextjs:nodejs /app/.next ./.next
COPY --from=build --chown=nextjs:nodejs /app/node_modules ./node_modules

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --spider -q http://localhost:3000 || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start production server
CMD ["npm", "start"]

# Labels
LABEL org.opencontainers.image.title="MediaX Web" \
      org.opencontainers.image.description="MediaX Media Asset Management Web Interface" \
      org.opencontainers.image.vendor="MediaX" \
      org.opencontainers.image.source="https://github.com/your-org/mediax"
