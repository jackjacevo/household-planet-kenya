#!/bin/sh

echo "Starting Household Planet Backend..."

# Generate Prisma client first
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations (production safe)
echo "Running database migrations..."
npx prisma migrate deploy || {
  echo "Migrations failed, falling back to db push..."
  npx prisma db push --accept-data-loss
}

# Start the application
echo "Starting the application..."
node dist/src/main.js