#!/bin/bash
set -e

echo "Waiting for database to be ready..."
sleep 5

echo "Running Prisma migrations for auth schema..."
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/transcendence?schema=auth \
  npx prisma migrate deploy --schema=apps/auth/prisma/schema.prisma || true

echo "Migrations completed. Starting application..."
exec node dist/apps/auth/main.js
