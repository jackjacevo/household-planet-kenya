FROM node:18-alpine

WORKDIR /app

# Copy all backend files at once
COPY household-planet-backend/ ./

# Install all dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Clean install production dependencies
RUN rm -rf node_modules && npm ci --omit=dev && npm cache clean --force

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "dist/main"]