# Backend-only deployment Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app

# Copy backend package files
COPY household-planet-backend/package*.json ./
RUN npm ci

# Copy backend prisma schema
COPY household-planet-backend/prisma ./prisma/
RUN npx prisma generate

# Copy backend source and build
COPY household-planet-backend/ ./
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install production deps
COPY household-planet-backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy prisma and generate client
COPY household-planet-backend/prisma ./prisma/
RUN npx prisma generate

# Copy built application
COPY --from=builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "dist/main"]