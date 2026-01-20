#!/bin/sh
set -e

echo "Running database migrations..."
# Use direct path to binary to ensure engines are found
./node_modules/.bin/prisma migrate deploy

echo "Starting Next.js server..."
exec node server.js