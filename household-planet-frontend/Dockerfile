FROM node:20-alpine

WORKDIR /app

# Install dependencies (all for build)
COPY package*.json ./
RUN npm ci --no-audit --no-fund --silent

# Copy source and build
COPY . .
RUN npm run build

# Clean up and install only production deps
RUN rm -rf node_modules && npm ci --only=production --no-audit --no-fund --silent
RUN rm -rf .git /tmp/* /var/cache/apk/* ~/.npm

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]