#!/bin/bash
# Spins up a disposable Postgres container, runs the DB-touching integration
# suite against it, and tears it down again — never touches the dev database.
set -euo pipefail

CONTAINER_NAME="task-manager-test-db"
TEST_DB_PORT="${TEST_DB_PORT:-55432}"

export DB_URL="postgresql://postgres:postgres@localhost:${TEST_DB_PORT}/taskmanager_test"
export PLATFORM="prod"
export JWT_SECRET="integration-test-secret"

cleanup() {
  docker stop "$CONTAINER_NAME" > /dev/null 2>&1 || true
}
trap cleanup EXIT

docker run -d --rm \
  --name "$CONTAINER_NAME" \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=taskmanager_test \
  -p "${TEST_DB_PORT}:5432" \
  postgres:16-alpine > /dev/null

echo "Waiting for test database to be ready..."
# The official postgres image briefly reports ready via pg_isready, then
# restarts once after running its init scripts — a query issued in that
# window gets ECONNRESET. Require several consecutive successful real
# queries (not just pg_isready) before treating it as actually stable.
stable_checks=0
for _ in $(seq 1 60); do
  if docker exec "$CONTAINER_NAME" psql -U postgres -d taskmanager_test -c 'SELECT 1' > /dev/null 2>&1; then
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

echo "Building common..."
bun run build:common

bunx vitest run --config vitest.integration.config.ts
