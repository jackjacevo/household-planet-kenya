# Multi-stage build for monorepo
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies for all projects
FROM base AS deps
# Copy root package files
COPY package*.json ./
RUN npm ci

# Copy and install frontend dependencies
COPY household-planet-frontend/package*.json ./household-planet-frontend/
RUN cd household-planet-frontend && npm ci

# Copy and install backend dependencies  
COPY household-planet-backend/package*.json ./household-planet-backend/
RUN cd household-planet-backend && npm ci

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/household-planet-frontend/node_modules ./household-planet-frontend/node_modules
COPY --from=deps /app/household-planet-backend/node_modules ./household-planet-backend/node_modules

# Copy source code
COPY . .

# Build both projects
RUN npm run build

# Production stage - backend only
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built backend
COPY --from=builder /app/household-planet-backend/dist ./dist
COPY --from=builder /app/household-planet-backend/package*.json ./
COPY --from=builder /app/household-planet-backend/prisma ./prisma

# Install production dependencies
RUN npm ci --omit=dev && npm cache clean --force

EXPOSE 3001

CMD ["npm", "run", "start:prod"]