# Stage 1: Build the application
FROM node:20-alpine3.18

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install @prisma/client

COPY . .

ENV NODE_ENV production

RUN npx prisma generate

EXPOSE 3000

CMD npx prisma migrate deploy & npm run start
