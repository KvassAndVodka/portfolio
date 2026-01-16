#!/bin/sh
set -e

# Run migrations
echo "Runnning migrations..."
npx prisma migrate deploy

# Start server
echo "Starting server..."
exec node server.js
