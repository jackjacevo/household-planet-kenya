FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --no-optional && npm cache clean --force

COPY . .
RUN npm run build

RUN rm -rf node_modules && npm install --production --no-optional && npm cache clean --force

EXPOSE 3000

CMD ["npm", "start"]