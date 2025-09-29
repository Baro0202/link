# syntax=docker/dockerfile:1

FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3000
ENV NEXT_PUBLIC_BACKEND_BASE=http://localhost:8080
CMD ["npm", "start"]


