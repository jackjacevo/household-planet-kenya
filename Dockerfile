# Backend deployment
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY household-planet-backend/package*.json ./
RUN npm ci

# Copy all backend files
COPY household-planet-backend/ ./

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies
COPY household-planet-backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy Prisma schema and generate client
COPY --from=builder /app/prisma ./prisma/
RUN npx prisma generate

# Copy built application
COPY --from=builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001
CMD ["node", "dist/main"]