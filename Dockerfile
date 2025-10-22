# Build stage
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/drizzle.config.ts ./
#COPY --from=builder /app/.env ./
COPY --from=builder /app/migrations ./migrations
EXPOSE 1000
CMD ["sh", "-c", "npm run db:migrate && npm start"]