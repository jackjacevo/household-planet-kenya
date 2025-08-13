# Household Planet Kenya E-commerce Platform

## Phase 1 - Foundation Setup

A modern e-commerce platform built with Node.js, Express, and MongoDB.

### Features Implemented
- User authentication (register/login)
- Product catalog management
- JWT-based authorization
- MongoDB database integration

### Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
- Update `MONGODB_URI` with your MongoDB connection string
- Set a secure `JWT_SECRET`

3. Start the development server:
```bash
npm run dev
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)

### Next Phase
Ready for Phase 2 development.