#!/bin/sh

echo "Starting Household Planet Backend..."

# Generate Prisma client first
echo "Generating Prisma client..."
npx prisma generate

# Push database schema (creates tables if they don't exist)
echo "Pushing database schema..."
npx prisma db push --accept-data-loss

# Start the application
echo "Starting the application..."
node dist/src/main.js