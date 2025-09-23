FROM node:20-alpine

# Install OpenSSL for Prisma compatibility
RUN apk add --no-cache openssl openssl-dev

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]