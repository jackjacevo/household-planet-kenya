# Household Planet Kenya - AI Development Guide

## Project Architecture

### Stack Overview
- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, App Router
- **Backend**: NestJS with JWT authentication
- **Database**: PostgreSQL with Prisma ORM
- **Key Libraries**: 
  - Frontend: Zustand (state), React Hook Form (forms), Framer Motion (animations)
  - Backend: Sharp (images), Multer (uploads)

### Project Structure
```
src/
├── app/            # Next.js app router pages
│   ├── admin/     # Admin panel interface
│   └── ...        # Customer-facing pages
├── admin/         # Backend admin features
├── staff/         # Staff management
├── activity/      # Activity logging
├── analytics/     # Business analytics
└── ...           # Other core modules
```

## Development Workflow

### Environment Setup
1. Database: PostgreSQL must be running
2. Backend: Port 3001 (NestJS)
3. Frontend: Port 3000 (Next.js)

### Key Commands
```bash
# Run tests
node test-phase5-deliverables.js  # Frontend/UI tests
# More test commands found in package.json
```

### Important Conventions

#### Authentication
- JWT-based with 5-tier role system: GUEST, CUSTOMER, STAFF, ADMIN, SUPER_ADMIN
- Protected routes require role validation
- See `AUTHENTICATION_SYSTEM_COMPLETE.md` for details

#### Data Flow Patterns
- API endpoints follow RESTful conventions
- Strict typing with TypeScript throughout
- Use Prisma transactions for multi-table operations

#### State Management
- Zustand for global state
- React Query for server state
- Local storage for user preferences

## Integration Points

### External Services
- M-Pesa payment integration
- WhatsApp Business API
- Email marketing system
- Google Analytics/Facebook Pixel

### Cross-Component Communication
- WebSocket for real-time updates (orders/chat)
- Server-sent events for notifications
- Redux events for admin panel updates

## Project-Specific Patterns

### Image Handling
- Use Sharp for resizing/optimization
- WebP format with fallbacks
- Lazy loading implementation

### Form Management
- Zod for validation schemas
- React Hook Form for form state
- Custom error handling patterns

### Testing Approach
- Unit tests: Component/service level
- Integration: API endpoints
- E2E: Critical user flows
- See `test-phase5-deliverables.js` for UI test patterns

## Common Workflows

### Adding Features
1. Update Prisma schema if needed
2. Implement backend endpoint
3. Add frontend components
4. Update admin panel if applicable

### Debugging Tips
- Check `debug-auth.html` for auth issues
- Use `diagnose-categories.js` for category problems
- Performance issues: Check image optimization first

## Need Help?
- See PHASE1_TESTING_RESULTS.md for system overview
- Check ADMIN_PRODUCT_MANAGEMENT_COMPLETE.md for admin features
- PHASE5_FRONTEND_IMPLEMENTATION_COMPLETE.md for UI patterns
