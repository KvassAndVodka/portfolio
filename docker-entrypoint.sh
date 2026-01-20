#!/bin/sh
# Exit immediately if a command exits with a non-zero status
set -e

echo "Running database migrations..."
# Using the direct path to the binary to solve the @prisma/debug issue
./node_modules/.bin/prisma migrate deploy

echo "Starting Next.js server on 0.0.0.0:3000..."
# Ensure the hostname is explicitly set so it's reachable via Tailscale Funnel
export HOSTNAME="0.0.0.0"

# Use exec to ensure the node process receives OS signals (SIGTERM, etc.)
exec node server.js