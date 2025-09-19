FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY household-planet-backend/package*.json ./

# Install dependencies
RUN npm ci

# Copy backend prisma directory
COPY household-planet-backend/prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy backend source code
COPY household-planet-backend/src ./src/
COPY household-planet-backend/nest-cli.json ./
COPY household-planet-backend/tsconfig.json ./

# Build application
RUN npm run build

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "dist/main"]