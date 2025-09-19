#!/bin/bash

echo "Initializing database schema..."

# Generate Prisma client
npx prisma generate

# Push database schema (creates tables if they don't exist)
npx prisma db push

echo "Database initialization complete!"