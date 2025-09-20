FROM node:20-alpine

# Install Chrome dependencies and Chrome
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    openssl \
    openssl-dev

# Tell Puppeteer to use installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_DOWNLOAD=true

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