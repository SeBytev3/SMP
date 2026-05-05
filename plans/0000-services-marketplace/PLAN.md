# Plan: Services Marketplace Platform — Phase 1 (Backend + Database)

Build the complete backend API for the services marketplace platform, including project scaffolding, PostgreSQL database with migrations, RESTful endpoints for all services (auth, providers, admin, requests, reviews, messaging, notifications), and file upload support. OAuth social login and English translations are deferred to Phase 2. The frontend will be built in a separate phase.

## Scope

**In:**
- Monorepo structure (`server/` for backend, `client/` placeholder)
- PostgreSQL database schema (8 tables + relationships)
- Database migrations and seed data
- Email/password authentication with JWT (HTTP-only cookies)
- Provider registration, profile management, admin approval workflow
- Admin endpoints (approve/reject providers, manage categories, deactivate)
- Service request workflow (create, accept/decline, complete, cancel)
- Review system (star ratings + comments, tied to completed requests)
- In-app messaging between customers and providers
- In-app notification system
- File upload service for portfolio images (S3-compatible storage)
- Backend unit + integration tests
- Spanish-only i18n infrastructure (English keys deferred)
- API documentation (OpenAPI/Swagger or Postman collection)

**Out:**
- OAuth social login (Google, Facebook) — Phase 2
- English language translations — Phase 2
- Frontend React application — Separate phase
- Payment gateway integration — Future phase
- Map/GPS visualization — Future phase
- Calendar-based booking — Future phase
- Email notification delivery — Phase 2 (in-app only in v1)

## Success Criteria

- [x] `npm run dev` starts backend server with hot reload
- [x] Database migrations run cleanly on fresh PostgreSQL instance
- [x] All API endpoints return correct responses (tested via Postman/curl)
- [x] Authentication flow works: register → login → protected route → logout
- [x] Provider registration → admin approval → profile visible in search (end-to-end via API)
- [x] Service request → accept → complete → review flow works end-to-end
- [x] In-app messaging between two users works
- [x] File upload validates and stores images correctly
- [x] 80%+ test coverage on backend code
- [x] API documentation covers all endpoints with request/response examples

## Assumptions

- Node.js 18+ and PostgreSQL 14+ available in development environment
- AWS S3 or compatible storage (e.g., MinIO, Cloudflare R2) accessible for file uploads
- No existing project structure — building from scratch
- Single initial admin user created via database seed (manual credentials distribution)
- Customer "verification" = email confirmation (deferred; v1 allows all registered customers to send requests)

## Action Items

### 1. Project Scaffolding & Infrastructure

- [x] Initialize monorepo structure: `server/`, `client/` (placeholder), root `package.json`
- [x] Set up `server/` with Express.js + TypeScript + ESLint + Prettier
- [x] Configure database ORM/ODM (Prisma recommended for TypeScript + PostgreSQL)
- [x] Set up environment configuration (`.env.example`, `dotenv` or `envalid`)
- [x] Create folder structure: `src/routes/`, `src/controllers/`, `src/services/`, `src/middleware/`, `src/models/`, `src/utils/`, `tests/`
- [x] Configure test framework (Jest or Vitest) + supertest for API testing
- [x] Set up build script (`tsc`, `npm run build`, `npm run dev`)

### 2. Database Schema & Migrations

- [x] Create Prisma schema with all 8 tables
- [x] Define enums: `UserRole`, `ProviderStatus`, `RequestStatus`, `NotificationType`
- [x] Define relationships: FK constraints, unique constraints (reviews per request, provider per user)
- [x] Create initial migration and run against PostgreSQL
- [x] Seed script: create default service categories (Plumber/Plomero, Electrician/Electricista, Locksmith/Cerrajero)
- [x] Seed script: create initial admin user (configurable via env vars)

### 3. Authentication System

- [x] Implement `POST /api/auth/register` — email/password registration with bcrypt hashing
- [x] Implement `POST /api/auth/login` — email/password login, JWT generation, HTTP-only cookie
- [x] Implement `POST /api/auth/logout` — clear JWT cookie
- [x] Implement `GET /api/auth/me` — return current user profile from JWT
- [x] Create auth middleware: `requireAuth`, `requireRole('customer'|'provider'|'admin')`
- [x] Add input validation (email format, password strength, unique email constraint)
- [x] Write unit tests for auth service + integration tests for auth endpoints

### 4. Service Category Endpoints

- [x] Implement `GET /api/categories` — list active categories (public)
- [x] Implement admin endpoints: `POST /api/admin/categories`, `PATCH /api/admin/categories/:id`, `GET /api/admin/categories`
- [x] Add category validation (bilingual names required)
- [x] Write tests for category CRUD

### 5. Provider Registration & Profile Management

- [x] Implement `POST /api/providers/register` — create provider profile with `pending` status
- [x] Implement `GET /api/providers/:id` — public profile (approved only) or owner/admin view (any status)
- [x] Implement `PUT /api/providers/:id` — update profile (pending/rejected can edit, approved can update)
- [x] Implement `POST /api/providers/:id/resubmit` — resubmit after rejection, set status to `pending`
- [x] Implement `GET /api/providers` — search/filter approved providers by category, location, rating with pagination
- [x] Add validation: bio length, location format, certification array limits
- [x] Write tests for provider CRUD, status transitions, search/pagination

### 6. Admin Approval Workflow

- [x] Implement `GET /api/admin/providers/pending` — list all pending providers (admin only)
- [x] Implement `PATCH /api/admin/providers/:id/approve` — set status to `approved`, create notification
- [x] Implement `PATCH /api/admin/providers/:id/reject` — set status to `rejected` with reason, create notification
- [x] Implement `PATCH /api/admin/providers/:id/deactivate` — soft deactivation, block from search
- [x] Implement `PATCH /api/admin/providers/:id/commission` — set custom commission rate
- [x] Create audit logging middleware for admin actions
- [x] Write tests for approval/rejection flow, idempotency, notification creation

### 7. Service Request Workflow

- [x] Implement `POST /api/requests` — create service request (customer → provider)
- [x] Implement `GET /api/requests` — list requests filtered by user role (`sent`/`received`) with optional status filter
- [x] Implement `PATCH /api/requests/:id/respond` — provider accepts/declines with optional notes
- [x] Implement `PATCH /api/requests/:id/complete` — mark request as completed (enables review)
- [x] Implement `PATCH /api/requests/:id/cancel` — customer cancels request
- [x] Add validation: prevent requests to deactivated providers, prevent duplicate reviews
- [x] Write tests for full request lifecycle, edge cases (deactivated provider, completed request modification)

### 8. Review System

- [x] Implement `POST /api/reviews` — create review for completed request (1 per request, 1-5 rating)
- [x] Implement `GET /api/reviews/provider/:providerId` — paginated list of provider reviews (public)
- [x] Create service to recalculate `averageRating` and `totalReviews` on review creation
- [x] Add unique constraint enforcement (one review per request)
- [x] Write tests for review creation, rating calculation, constraint violations

### 9. In-App Messaging

- [x] Implement `POST /api/messages` — send message between users (optional `requestId` for context)
- [x] Implement `GET /api/messages/conversation/:userId` — list messages between two users with pagination
- [x] Implement `PATCH /api/messages/:id/read` — mark message as read
- [x] Add message throttling (max 50/hour to prevent spam)
- [x] Write tests for message sending, conversation retrieval, read status, throttling

### 10. Notification System

- [x] Implement `GET /api/notifications` — list user notifications (optional `unread` filter)
- [x] Implement `PATCH /api/notifications/:id/read` — mark single notification as read
- [x] Implement `PATCH /api/notifications/read-all` — mark all as read
- [x] Create notification creation service (triggered by: approval, rejection, new message, request events, new review)
- [x] Integrate notification creation into existing services (provider approval, request response, etc.)
- [x] Write tests for notification CRUD, filtering, bulk read

### 11. File Upload Service

- [x] Implement `POST /api/providers/:id/portfolio` — upload portfolio image (max 5MB, JPG/PNG/WebP)
- [x] Implement `DELETE /api/providers/:id/portfolio/:imageId` — remove portfolio image
- [x] Integrate with S3-compatible storage (use AWS SDK or equivalent)
- [x] Validate file type (magic number check, not just extension)
- [x] Enforce 10-image limit per provider
- [x] Update `ProviderPortfolio` table records on upload/delete
- [x] Write tests for upload validation, storage integration (mock S3), limit enforcement

### 12. Error Handling & Middleware

- [x] Create global error handler middleware (consistent error response format)
- [x] Implement input validation middleware (Zod or Joi for request body/schema validation)
- [x] Add rate limiting middleware (express-rate-limit on auth endpoints: 10 req/min)
- [x] Add CORS configuration for frontend domain (configurable via env var)
- [x] Add request logging middleware (method, path, status, duration)
- [x] Write tests for error responses, validation failures, rate limit trigger

### 13. Internationalization Infrastructure

- [x] Set up i18n framework (i18next or custom translation service)
- [x] Create Spanish translation keys file (`locales/es.json`)
- [x] Create English translation keys file (`locales/en.json`) with Spanish values as placeholder
- [x] Integrate language preference from `Users.language_pref` field
- [x] Translate all notification messages, error responses, and category names
- [x] Write tests for language switching, missing key fallback

### 14. API Documentation

- [x] Generate OpenAPI/Swagger documentation from code (swagger-jsdoc or tsoa)
- [x] Document all endpoints with request/response schemas
- [x] Include authentication requirements and role restrictions
- [x] Add example requests/responses for each endpoint
- [x] Verify documentation accuracy by testing against live API

### 15. Testing & Verification

**Unit Tests (Services):**
- [x] Unit tests for `AuthService`
- [x] Unit tests for `ReviewService`
- [x] Unit tests for `i18n` infrastructure
- [x] Unit tests for `CategoryService`
- [x] Unit tests for `ProviderService`
- [x] Unit tests for `AdminService`
- [x] Unit tests for `RequestService`
- [x] Unit tests for `MessageService`
- [x] Unit tests for `NotificationService`
- [x] Unit tests for `UploadService`

**Integration Tests (API Endpoints):**
- [x] Integration tests for Auth endpoints
- [x] Integration tests for Category endpoints
- [x] Integration tests for Provider endpoints
- [x] Integration tests for Admin endpoints
- [x] Integration tests for Request endpoints
- [x] Integration tests for Review endpoints
- [x] Integration tests for Message endpoints
- [x] Integration tests for Notification endpoints
- [x] Integration tests for Upload endpoints

**End-to-End (E2E) Workflows:**
- [x] Flow: Register → login → create provider profile → admin approves → profile visible in search
- [x] Flow: Create request → provider accepts → mark complete → leave review
- [x] Flow: Send message → receiver reads it → notification created
- [x] Flow: Reject provider → edit → resubmit → approve

**Validation & Quality:**
- [x] Run test suite, verify 80%+ coverage
- [x] Run `npm test` and `npm run lint` — zero failures, zero warnings
- [x] Test API manually via Postman/curl — verify all endpoints return expected responses
- [x] Test edge cases: deactivated provider receives request, duplicate review submission, oversized file upload

### 16. Build & Deployment Prep

- [x] Verify `npm run build` compiles without errors
- [x] Create `Dockerfile` for backend service (optional but recommended)
- [x] Create `docker-compose.yml` with PostgreSQL + backend service (for local development)
- [x] Document setup steps in `server/README.md` (install, configure, migrate, seed, run)
- [x] Verify fresh clone can run `npm install && npm run dev` and get working API

---
## 🍾 Phase 1 Completed Successfully! 🍾

## Phase 2: Enhancements & Frontend

### 17. Social Authentication (OAuth)
- [ ] Research and select OAuth library (Passport.js or similar)
- [ ] Configure Google Cloud Console and Facebook Developers projects
- [ ] Implement `GET /api/auth/google` and callback routes
- [ ] Implement `GET /api/auth/facebook` and callback routes
- [ ] Merge OAuth users with existing email/password accounts (linking)
- [ ] Write integration tests for OAuth flows

### 18. Email Notification Delivery
- [ ] Configure SMTP or Transactional Email service (SendGrid, AWS SES, or Mailtrap for dev)
- [ ] Create email templates (HTML/Text) for common notifications
- [ ] Implement EmailService to wrap sending logic
- [ ] Integrate EmailService into existing notification triggers

### 19. Full English Translation (i18n)
- [x] Populate `src/locales/en/common.json` with accurate English translations
- [x] Verify all error messages and notifications have En/Es counterparts
- [x] Test language switching via `Users.language_pref` and JWT `lng` field

### 20. Frontend Initialization (React + TypeScript)
- [x] Initialize React project using Vite in `client/` directory
- [x] Set up TailwindCSS or Vanilla CSS modules
- [x] Configure Axios/TanStack Query for API communication
- [x] Set up routing with React Router
- [x] Implement Basic Layout (Navbar, Footer)
- [x] Implement Authentication UI (Login, Register)
- [x] Implement Provider Complete Profile with Colombian Localization Flow

## Clarifications

> **Q: Should the plan include project scaffolding or assume existing structure?**
> **A: Full scaffolding from scratch** — monorepo with server/ and client/ folders, build everything.

> **Q: How should implementation be phased?**
> **A: Phase 1: Backend + DB first, Phase 2: Frontend** — deliver working API before building UI.

> **Q: Which OAuth providers for v1?**
> **A: Defer OAuth to Phase 2** — email/password authentication only in v1.

> **Q: Should bilingual support be built from the start?**
> **A: Spanish first, English later** — i18n infrastructure in place, but only Spanish keys populated in Phase 1.
