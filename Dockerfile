FROM node:20-alpine

# Install OpenSSL 3.x for Prisma
RUN apk add --no-cache openssl openssl-dev

WORKDIR /app

# Copy package files and prisma schema first
COPY household-planet-backend/package*.json ./
COPY household-planet-backend/prisma ./prisma/

# Install dependencies (this will run prisma generate)
RUN npm install

# Copy the rest of the backend application
COPY household-planet-backend/ ./

# Run production setup (fixes security, creates settings table, builds app)
RUN npm run setup:production

# Verify build output
RUN ls -la dist/ || echo "No dist directory"
RUN find . -name "*.js" -path "./dist/*" || echo "No JS files in dist"

# Clean install production dependencies only
RUN rm -rf node_modules && npm ci --omit=dev && npm cache clean --force

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "dist/src/main.js"]