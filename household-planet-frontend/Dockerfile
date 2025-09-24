FROM node:20-alpine

WORKDIR /app

# Set file limits
RUN echo 'fs.file-max = 65536' >> /etc/sysctl.conf

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund --silent

# Copy source and build
COPY . .
RUN npm run build

# Clean up to reduce file handles
RUN rm -rf .git node_modules/.cache /tmp/* /var/cache/apk/*

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use exec form to reduce processes
CMD ["npm", "start"]