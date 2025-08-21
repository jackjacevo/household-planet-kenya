# Household Planet Kenya

A modern e-commerce platform for household items in Kenya, built with Next.js 15 and NestJS.

## Project Structure

This is a monorepo containing:

- **Frontend** (`household-planet-frontend/`) - Next.js 15 with TypeScript and Tailwind CSS
- **Backend** (`household-planet-backend/`) - NestJS API with JWT authentication

## Quick Start

### Frontend Development

```bash
cd household-planet-frontend
npm run dev
```

Visit `http://localhost:3000`

### Backend Development

```bash
cd household-planet-backend
npm run start:dev
```

API available at `http://localhost:3001`

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Heroicons, Lucide React
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios with TanStack Query

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Authentication**: JWT with Passport
- **Validation**: class-validator, class-transformer
- **Security**: bcryptjs for password hashing

## Development Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Environment Setup

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (.env)
```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://username:password@localhost:5432/household_planet
CORS_ORIGIN=http://localhost:3000
```

## Features

- 🛍️ Modern e-commerce interface
- 🔐 JWT-based authentication
- 📱 Responsive design with Tailwind CSS
- ⚡ Fast development with hot reload
- 🎨 Beautiful animations with Framer Motion
- 🔍 Type-safe API with TypeScript
- 📊 State management with Zustand
- ✅ Form validation with Zod
- 🎯 SEO optimized with Next.js

## Getting Started

1. Clone the repository
2. Install dependencies for both projects:
   ```bash
   cd household-planet-frontend && npm install
   cd ../household-planet-backend && npm install
   ```
3. Set up environment variables
4. Start both development servers
5. Visit `http://localhost:3000` to see the application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request