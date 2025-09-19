FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN rm -rf node_modules && npm ci --omit=dev && npm cache clean --force

EXPOSE 3000

CMD ["npm", "start"]