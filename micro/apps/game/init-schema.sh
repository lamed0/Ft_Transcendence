#!/bin/bash
# Create the game schema if it doesn't exist

PGPASSWORD=${POSTGRES_PASSWORD:-postgres} psql -h ${DB_HOST:-postgres} -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-transcendence} -c "CREATE SCHEMA IF NOT EXISTS game;" || true

# echo "Running Prisma migrations for game schema..."
# npx prisma migrate deploy --schema=./apps/game/prisma/schema.prisma || true
