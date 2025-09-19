FROM node:18-alpine

WORKDIR /app

# Copy backend files
COPY household-planet-backend/package*.json ./
COPY household-planet-backend/prisma ./prisma/
COPY household-planet-backend/src ./src/
COPY household-planet-backend/nest-cli.json ./
COPY household-planet-backend/tsconfig.json ./

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Install production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "dist/main"]