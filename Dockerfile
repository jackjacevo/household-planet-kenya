FROM node:18-alpine AS builder
WORKDIR /app

COPY household-planet-backend/package*.json ./
RUN npm ci

COPY household-planet-backend/ ./
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY household-planet-backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/prisma ./prisma/
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

RUN mkdir -p uploads

EXPOSE 3001
CMD ["node", "dist/main"]