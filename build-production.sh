#!/bin/bash

# Production Build Script for Household Planet Kenya
# This script builds both frontend and backend for production deployment

echo "🚀 Starting Production Build for Household Planet Kenya..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js and npm are available"

# Build Frontend
echo ""
echo "📦 Building Frontend..."
cd household-planet-frontend

if [ ! -f "package.json" ]; then
    print_error "Frontend package.json not found!"
    exit 1
fi

print_status "Installing frontend dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_error "Frontend dependency installation failed!"
    exit 1
fi

print_status "Building frontend for production..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Frontend build failed!"
    exit 1
fi

print_status "Frontend build completed successfully!"

# Build Backend
echo ""
echo "📦 Building Backend..."
cd ../household-planet-backend

if [ ! -f "package.json" ]; then
    print_error "Backend package.json not found!"
    exit 1
fi

print_status "Installing backend dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_error "Backend dependency installation failed!"
    exit 1
fi

print_status "Building backend for production..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Backend build failed!"
    exit 1
fi

print_status "Backend build completed successfully!"

# Final checks
echo ""
echo "🔍 Running final checks..."

# Check if frontend build directory exists
if [ -d "../household-planet-frontend/.next" ]; then
    print_status "Frontend build directory exists"
else
    print_warning "Frontend build directory not found"
fi

# Check if backend dist directory exists
if [ -d "dist" ]; then
    print_status "Backend build directory exists"
else
    print_warning "Backend build directory not found"
fi

echo ""
print_status "🎉 Production build completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Copy .env.production to .env.local in frontend directory"
echo "2. Configure your production environment variables"
echo "3. Set up your database and run migrations"
echo "4. Deploy to your production server"
echo "5. Configure nginx and SSL certificates"
echo "6. Set up PM2 for process management"
echo ""
echo "📖 See DEPLOYMENT.md for detailed deployment instructions"
echo ""