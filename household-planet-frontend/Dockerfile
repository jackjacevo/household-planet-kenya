FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build

# Clean up
RUN rm -rf .git node_modules/.cache

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]