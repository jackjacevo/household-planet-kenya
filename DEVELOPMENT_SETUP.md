# 🛠️ Development Environment Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control

## 🔧 Backend Setup (NestJS)

### 1. Navigate to Backend Directory
```bash
cd household-planet-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create `.env` file in the backend root:
```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Server Configuration
PORT=3001
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) View database in Prisma Studio
npx prisma studio
```

### 5. Start Development Server
```bash
npm run start:dev
```

Backend will be available at: `http://localhost:3001`

## 🖥️ Frontend Setup (Next.js)

### 1. Navigate to Frontend Directory
```bash
cd household-planet-frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create `.env.local` file in the frontend root:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Start Development Server
```bash
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## 🧪 Testing the System

### 1. Access the Application
Open your browser and go to `http://localhost:3000`

### 2. Test User Registration
- Click "Get Started"
- Fill in the registration form
- Use a strong password (8+ chars, uppercase, lowercase, number, special char)

### 3. Test User Login
- Navigate to login page
- Use the credentials you just created
- Access the dashboard

### 4. Test API Endpoints
Use the provided test script:
```bash
cd household-planet-backend
node test-auth.js
```

## 📁 Project Structure

```
HouseholdPlanetKenya/
├── household-planet-backend/          # NestJS Backend
│   ├── src/
│   │   ├── auth/                     # Authentication module
│   │   ├── users/                    # User management
│   │   ├── prisma/                   # Database service
│   │   └── common/                   # Shared utilities
│   ├── prisma/                       # Database schema & migrations
│   └── test-auth.js                  # API testing script
├── household-planet-frontend/         # Next.js Frontend
│   ├── src/
│   │   ├── app/                      # App router pages
│   │   ├── contexts/                 # React contexts
│   │   └── lib/                      # Utilities & API client
└── Documentation files
```

## 🔍 Available Scripts

### Backend Scripts
```bash
npm run start:dev      # Start development server
npm run build          # Build for production
npm run start:prod     # Start production server
npm run test           # Run tests
npx prisma studio      # Open database GUI
npx prisma migrate dev # Run migrations
```

### Frontend Scripts
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
```

## 🐛 Troubleshooting

### Port Already in Use
If you get "EADDRINUSE" error:
- Change the port in `src/main.ts` (backend) or use different port
- Kill existing processes using the port

### Database Issues
```bash
# Reset database
npx prisma migrate reset --force

# Regenerate client
npx prisma generate
```

### Frontend Build Issues
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## 🔐 Default User Roles

- **CUSTOMER**: Default role for new registrations
- **ADMIN**: Administrative access (manually set in database)
- **SUPER_ADMIN**: Full system access (manually set in database)

## 📊 Database Access

### Prisma Studio (GUI)
```bash
cd household-planet-backend
npx prisma studio
```

### Direct Database Access
The SQLite database file is located at:
`household-planet-backend/prisma/dev.db`

## 🚀 Production Deployment

### Backend
1. Set production environment variables
2. Use PostgreSQL instead of SQLite
3. Run `npm run build`
4. Deploy with `npm run start:prod`

### Frontend
1. Set production API URL
2. Run `npm run build`
3. Deploy the `.next` folder

## 📞 Support

- Check `AUTH_SYSTEM.md` for detailed API documentation
- Use `test-auth.js` for backend API testing
- Review error logs in terminal for debugging

## ✅ Verification Checklist

- [ ] Backend starts without errors on port 3001
- [ ] Frontend starts without errors on port 3000
- [ ] Database migrations applied successfully
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard displays user information
- [ ] Admin users see admin panel
- [ ] API endpoints respond correctly

**Setup Status: Ready for Development** 🎉