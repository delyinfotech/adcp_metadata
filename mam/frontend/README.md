# GEN21 MediaX AI - Frontend

Media Asset Management Platform - Web Application

## Features

- Next.js 14 with App Router
- React 18 with Server Components
- TypeScript for type safety
- Tailwind CSS + shadcn/ui components
- TanStack Query for server state
- Zustand for global state
- Socket.io for real-time updates
- React Hook Form + Zod validation

## Prerequisites

- Node.js 22+
- Docker & Docker Compose

## Quick Start (Docker - Recommended)

```bash
# Copy environment file
cp .env.example .env

# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f mediax-web

# Stop services
docker-compose down
```

Application will be available at http://localhost:3000

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Project Structure

```
src/
├── app/            # Next.js app router pages
├── components/     # React components
│   ├── ui/        # shadcn/ui components
│   ├── assets/    # Asset-related components
│   ├── folders/   # Folder components
│   └── layout/    # Layout components
├── lib/           # Utilities and helpers
├── hooks/         # Custom React hooks
├── services/      # API services
├── stores/        # Zustand stores
└── types/         # TypeScript types
```

## Environment Variables

See `.env.example` for all available configuration options.

## License

UNLICENSED - Proprietary Software
