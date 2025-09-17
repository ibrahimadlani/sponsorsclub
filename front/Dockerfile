# Base image with shared dependencies
FROM node:18-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Development image used by docker compose
FROM base AS dev
COPY . .

# Build stage for production assets
FROM base AS builder
COPY . .
RUN npm run build

# Production runtime image
FROM node:18-alpine AS main
WORKDIR /app
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "run", "start"]
