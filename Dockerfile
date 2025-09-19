FROM node:18-alpine AS builder
WORKDIR /app

# Copy all package.json files
COPY package*.json ./
COPY household-planet-frontend/package*.json ./household-planet-frontend/
COPY household-planet-backend/package*.json ./household-planet-backend/

# Install all dependencies
RUN npm ci
RUN cd household-planet-frontend && npm ci
RUN cd household-planet-backend && npm ci

# Copy source code
COPY . .

# Build backend only (skip frontend for backend deployment)
RUN cd household-planet-backend && npm run build

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