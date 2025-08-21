# Development Environment Setup Guide

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Git**

## Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd HouseholdPlanetKenya
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd household-planet-backend
npm install

# Install frontend dependencies
cd ../household-planet-frontend
npm install
```

### 3. Environment Configuration

#### Backend (.env)
```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
DATABASE_URL=file:./dev.db
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Database Setup
```bash
cd household-planet-backend

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

### 5. Start Development Servers

#### Terminal 1 - Backend
```bash
cd household-planet-backend
npm run start:dev
```
Backend runs on: http://localhost:3001

#### Terminal 2 - Frontend
```bash
cd household-planet-frontend
npm run dev
```
Frontend runs on: http://localhost:3000

## Project Structure

```
HouseholdPlanetKenya/
├── household-planet-backend/     # NestJS API
│   ├── prisma/                  # Database schema & migrations
│   ├── src/
│   │   ├── auth/               # Authentication module
│   │   ├── users/              # User management
│   │   ├── products/           # Product management
│   │   ├── orders/             # Order management
│   │   └── common/             # Shared utilities
│   └── package.json
├── household-planet-frontend/    # Next.js frontend
│   ├── src/
│   │   ├── app/                # App router pages
│   │   ├── components/         # React components
│   │   ├── lib/                # Utilities
│   │   └── types/              # TypeScript types
│   └── package.json
└── README.md
```

## Available Scripts

### Backend
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Database Management

### View Database
```bash
cd household-planet-backend
npx prisma studio
```

### Reset Database
```bash
npx prisma migrate reset
```

### Create Migration
```bash
npx prisma migrate dev --name migration_name
```

## Testing API Endpoints

### Using curl
```bash
# Register user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login user
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Using REST Client (VS Code)
Install REST Client extension and use the `test-api.http` file in the root directory.

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001 (backend)
npx kill-port 3001

# Kill process on port 3000 (frontend)
npx kill-port 3000
```

### Database Issues
```bash
# Reset database
cd household-planet-backend
npx prisma migrate reset --force
npx prisma generate
```

### Node Modules Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

### Backend
1. Set production environment variables
2. Build: `npm run build`
3. Start: `npm run start:prod`

### Frontend
1. Set production environment variables
2. Build: `npm run build`
3. Start: `npm run start`

## Security Notes

- Change JWT_SECRET in production
- Use HTTPS in production
- Set proper CORS origins
- Use environment variables for sensitive data
- Enable rate limiting for production