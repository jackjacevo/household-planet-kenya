FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN ls -la
RUN ls -la prisma/
RUN npx prisma generate
RUN npm run build

RUN rm -rf node_modules && npm ci --omit=dev && npm cache clean --force

RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "dist/main"]