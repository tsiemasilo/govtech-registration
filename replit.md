# Govtec Registration System

## Overview

This is a full-stack web application for managing event registrations for the Govtec Competition. The system features a QR code-based registration flow where users can scan QR codes or manually enter registration codes to complete their event registration.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: React hooks with session storage for temporary data
- **Data Fetching**: TanStack Query (React Query) for API calls
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Style**: REST API with JSON responses
- **Session Management**: Express sessions with PostgreSQL store
- **Validation**: Zod schemas for request/response validation

### Build System
- **Bundler**: Vite for frontend, esbuild for backend
- **Development**: Hot reload with Vite dev server
- **Production**: Static assets served by Express

## Key Components

### Database Schema
- **registrations**: Stores user registration data including personal information, consent flags, and registration codes
- **users**: Basic user authentication (currently unused but structured for future admin features)

### API Endpoints
- `POST /api/registrations` - Create new registration
- `GET /api/registrations` - Retrieve all registrations
- `GET /api/registrations/:id` - Retrieve specific registration
- `POST /api/verify-code` - Verify registration codes (referenced but not implemented)

### Frontend Pages
- **QR Scanner**: Landing page with QR code scanner and manual code entry
- **Registration Form**: Multi-step form for collecting user information
- **Success Page**: Confirmation page after successful registration

### Key Features
- QR code scanning using device camera
- Manual registration code entry as fallback
- Multi-step registration form with validation
- Data consent and marketing preferences
- Email confirmation system with Gmail SMTP integration
- Professional HTML email templates with Govtec branding
- Mobile-responsive design
- Custom brand colors (Govtec orange and blue)
- Fast, reliable email delivery through Gmail servers

## Data Flow

1. User accesses QR scanner page
2. User scans QR code or enters code manually
3. Registration code is validated and stored in session
4. User is redirected to registration form
5. User completes multi-step form with personal information
6. Form data is validated and submitted to backend
7. Backend creates registration record in database
8. System sends confirmation email with registration details
9. User is redirected to success page with registration confirmation and email notification

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Hook Form)
- UI and styling (Tailwind CSS, Radix UI, shadcn/ui)
- Data fetching (TanStack Query)
- Form validation (Zod, @hookform/resolvers)
- Routing (Wouter)
- Date handling (date-fns)
- Utility libraries (clsx, class-variance-authority)

### Backend Dependencies
- Server framework (Express.js)
- Database (Drizzle ORM, @neondatabase/serverless)
- Session management (express-session, connect-pg-simple)
- Validation (Zod, drizzle-zod)
- Development tools (tsx, esbuild)

## Deployment Strategy

### Development
- Frontend: Vite dev server with hot reload
- Backend: tsx with Node.js runtime
- Database: Neon Database with environment-based connection

### Production
- Frontend: Built with Vite, served as static assets by Express
- Backend: Compiled with esbuild, served by Node.js
- Database: PostgreSQL via Neon Database connection string
- Environment: Replit-optimized with custom plugins

### Database Management
- Schema: Defined in `/shared/schema.ts`
- Migrations: Generated in `/migrations` directory
- Commands: `npm run db:push` for schema updates

## Changelog

- July 04, 2025: Removed header logo from QR scanner page and made layout more compact
- July 04, 2025: Added interactive confetti burst animation on successful registration
- July 04, 2025: Redesigned confirmation page with horizontal layout and simplified design
- July 04, 2025: Switched from SendGrid to Gmail SMTP for faster, more reliable email delivery
- July 04, 2025: Complete system rebuild with enhanced email templates and better error handling
- July 03, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.