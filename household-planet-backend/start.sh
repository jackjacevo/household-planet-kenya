#!/bin/sh

echo "Starting Household Planet Backend..."

# Wait for database to be ready
echo "Waiting for database connection..."
sleep 5

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database setup
echo "Setting up database..."
npx prisma db push --accept-data-loss || {
  echo "Database push failed, trying migration..."
  npx prisma migrate deploy
}

# Create settings table
echo "Creating settings table..."
node scripts/create-settings-runtime.js

# Start the application
echo "Starting the application..."
node dist/src/main.js