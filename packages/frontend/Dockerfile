# Frontend Dockerfile for Task Manager
FROM oven/bun:1.3-alpine AS base
WORKDIR /app

# Install dependencies & build stage
FROM base AS build
RUN apk add npm
COPY package.json tsconfig.json ./
COPY packages/common ./packages/common
COPY packages/frontend ./packages/frontend

# Set build-time environment variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://backend:3020/api}

RUN bun install

WORKDIR /app/packages/common
RUN bun install
RUN bun run build

WORKDIR /app/packages/frontend
RUN bun remove eslint eslint-config-next eslint-pligin-react-hooks @eslint/eslintrc @next/eslint-plugin-next
RUN rm eslint.config.mjs
RUN bun install
RUN bun run build

# Production stage
FROM base AS production
ENV NODE_ENV=production

# Copy node_modules and built files
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/common ./packages/common
COPY --from=build /app/packages/frontend/node_modules ./packages/frontend/node_modules
COPY --from=build /app/packages/frontend/.next ./packages/frontend/.next
# COPY --from=build /app/packages/frontend/src/public ./packages/frontend/src/public
COPY --from=build /app/packages/frontend/package.json ./packages/frontend/
COPY --from=build /app/packages/frontend/next.config.ts ./packages/frontend/

WORKDIR /app/packages/frontend

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD bun run -e "fetch('http://localhost:3000').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))" || exit 0

# Run the application
CMD ["bun", "run", "start"]