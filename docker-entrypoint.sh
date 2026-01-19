#!/bin/sh
set -e

# Run migrations
echo "Runnning migrations..."
npx prisma db push --accept-data-loss

# Start server
echo "Starting server..."
exec node server.js
