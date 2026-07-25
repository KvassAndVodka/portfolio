#!/bin/sh
set -e

echo "Running database migrations..."
# npx will look in /app/node_modules/.bin automatically
npx prisma migrate deploy
npx prisma db seed

echo "Starting server..."
exec node server.js