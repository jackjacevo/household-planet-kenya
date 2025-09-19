FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files from the backend subdirectory
COPY household-planet-backend/package*.json ./

# Install dependencies
RUN npm ci

# Copy the entire backend application (including prisma directory)
COPY household-planet-backend/ ./

# Generate Prisma client (now the prisma folder should be available)
RUN npx prisma generate

# Build the application
RUN npm run build

# Verify build output
RUN ls -la dist/

# Clean install production dependencies only
RUN rm -rf node_modules && npm ci --omit=dev && npm cache clean --force

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "dist/main"]