FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

RUN rm -rf node_modules && npm ci --omit=dev && npm cache clean --force

RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "dist/main"]