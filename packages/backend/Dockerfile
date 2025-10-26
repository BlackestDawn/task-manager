# Backend Dockerfile for Task Manager
FROM oven/bun:1.3-alpine AS base
WORKDIR /app

# Install dependencies & build stage
FROM base AS build
COPY package.json tsconfig.json ./
COPY packages/common ./packages/common
COPY packages/backend ./packages/backend

RUN bun install

WORKDIR /app/packages/common
RUN bun install
RUN bun run build

WORKDIR /app/packages/backend
RUN bun install
RUN bun run build

# Production stage
FROM base AS production
ENV NODE_ENV=production

# Copy node_modules and built files
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/common ./packages/common
COPY --from=build /app/packages/backend/dist ./packages/backend/dist
COPY --from=build /app/packages/backend/src/db/migrations ./packages/backend/src/db/migrations
COPY --from=build /app/packages/backend/package.json ./packages/backend/

WORKDIR /app/packages/backend

# Expose port
EXPOSE 3020

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun run -e "fetch('http://localhost:3020/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Run the application
CMD ["bun", "start"]