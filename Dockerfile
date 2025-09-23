FROM node:20-alpine

WORKDIR /app

# Copy frontend package files
COPY household-planet-frontend/package*.json ./
RUN npm install --no-optional && npm cache clean --force

# Copy frontend source
COPY household-planet-frontend/ ./
RUN npm run build

RUN rm -rf node_modules && npm install --production --no-optional && npm cache clean --force

EXPOSE 3000

CMD ["npm", "start"]