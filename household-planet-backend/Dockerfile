FROM node:20-alpine

# Set environment variables to skip Puppeteer download FIRST
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev

WORKDIR /app

# Copy package files
COPY household-planet-backend/package*.json ./

# Copy prisma schema for generation
COPY household-planet-backend/prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY household-planet-backend/ ./

# Run production setup (fixes security, creates settings table, builds app)
RUN npm run setup:production

# Verify build output
RUN ls -la dist/

# Create uploads directory
RUN mkdir -p uploads

# Make start script executable
RUN chmod +x start.sh

EXPOSE 3001

CMD ["./start.sh"]