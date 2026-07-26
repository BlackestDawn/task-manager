#!/bin/bash
# Spins up a disposable Postgres container, builds the backend and frontend,
# then runs the Playwright E2E suite against production builds of both —
# Playwright's own webServer config starts/stops the two app processes (the
# backend runs its own migrations on boot and auto-seeds an admin account
# against an empty database); this script only owns the database's
# lifecycle, mirroring run-integration-tests.sh.
set -euo pipefail

CONTAINER_NAME="task-manager-e2e-db"
TEST_DB_PORT="${TEST_DB_PORT:-55433}"

export DB_URL="postgresql://postgres:postgres@localhost:${TEST_DB_PORT}/taskmanager_e2e"
export PLATFORM="prod"
export JWT_SECRET="e2e-test-secret"
export PORT="3020"

cleanup() {
  docker stop "$CONTAINER_NAME" > /dev/null 2>&1 || true
}
trap cleanup EXIT

docker run -d --rm \
  --name "$CONTAINER_NAME" \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=taskmanager_e2e \
  -p "${TEST_DB_PORT}:5432" \
  postgres:16-alpine > /dev/null

echo "Waiting for test database to be ready..."
# See run-integration-tests.sh for why this needs several consecutive
# successful queries rather than a single pg_isready check.
stable_checks=0
for _ in $(seq 1 60); do
  if docker exec "$CONTAINER_NAME" psql -U postgres -d taskmanager_e2e -c 'SELECT 1' > /dev/null 2>&1; then
    stable_checks=$((stable_checks + 1))
    if [ "$stable_checks" -ge 3 ]; then
      echo "Test database ready."
      break
    fi
  else
    stable_checks=0
  fi
  sleep 1
done

echo "Building common, backend, and frontend..."
bun run build:common
bun run build:backend
bun run build:frontend

echo "Running E2E tests..."
bunx playwright test "$@"
