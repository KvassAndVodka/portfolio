#!/bin/sh
set -e

echo "Running database migrations..."
# npx will look in /app/node_modules/.bin automatically
# Use db push to sync schema without needing migration files
npx prisma db push
npx prisma db seed

echo "Starting server..."
exec node server.js