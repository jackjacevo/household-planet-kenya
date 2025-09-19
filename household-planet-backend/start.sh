#!/bin/sh

echo "Starting Household Planet Backend..."

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client (in case it's needed)
echo "Generating Prisma client..."
npx prisma generate

# Start the application
echo "Starting the application..."
node dist/src/main.js