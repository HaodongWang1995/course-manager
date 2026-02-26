# Course Manager

A modern course management system with separate Teacher (EduManager) and Student (EduPortal) interfaces. Built as a full-stack TypeScript monorepo with a React frontend and Express/PostgreSQL backend.

## Features

### Teacher (EduManager)
- Dashboard with today's schedule and upcoming deadlines
- Calendar (week/day views)
- Course management — create, edit, publish, unpublish
- Enrollment review — approve or reject student applications
- Student directory with attendance tracking
- Reports and analytics
- Post-class feedback editor with auto-save

### Student (EduPortal)
- Weekly schedule view
- Browse and enroll in courses
- Gradebook with performance overview
- Assignment center with priority tracking
- Resource library
- Course feedback and materials

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 19 + TypeScript |
| Build tool | Vite 6 |
| Routing | TanStack Router v1 (file-based) |
| Server state | TanStack Query v5 |
| Forms | TanStack Form v1 |
| Styling | TailwindCSS v4 |
| UI components | shadcn/ui pattern (Radix UI + CVA) |
| Icons | Lucide React |
| Charts | Recharts |
| Validation | Zod |
| Backend | Node.js + Express 4 + TypeScript |
| Database | PostgreSQL (pg driver) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Testing | Vitest + Supertest + Playwright |
| Monorepo | pnpm workspaces + Turborepo |

## Project Structure

```
course-manager/
├── packages/
│   └── ui/               # @course-manager/ui — shared component library
├── apps/
│   ├── api/              # @course-manager/api — Express REST API (port 3001)
│   └── web/              # @course-manager/web — React frontend (port 5173)
└── PRD/                  # Product requirements and design docs
```

## Prerequisites

- Node.js 18+
- pnpm 9+
- PostgreSQL 14+

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure the API environment

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/course_manager
JWT_SECRET=your-secret-key-here
PORT=3001
```

### 3. Set up the database

```bash
# Create the database
createdb course_manager

# Run migrations
psql course_manager < apps/api/sql/001_init.sql
psql course_manager < apps/api/sql/002_enrollments.sql
```

### 4. Start development servers

```bash
# Start both API and web in parallel
pnpm dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Teacher | teacher@test.com | 111111 |
| Student | student@test.com | 111111 |

Register a new account at `/login` to create your own.

## Commands

```bash
# Development (all packages)
pnpm dev

# Build all packages
pnpm build

# Type checking
pnpm typecheck

# Lint
pnpm lint

# Clean build artifacts
pnpm clean
```

## Testing

```bash
# Run all unit/integration tests (api + web + ui)
pnpm test

# Run with coverage report
pnpm test:coverage

# Run a single package's tests
pnpm --filter @course-manager/api test
pnpm --filter @course-manager/web test
pnpm --filter @course-manager/ui test

# Run with verbose output (per package, Turborepo doesn't pass flags directly)
cd apps/api  && pnpm exec vitest run --reporter=verbose
cd apps/web  && pnpm exec vitest run --reporter=verbose
cd packages/ui && pnpm exec vitest run --reporter=verbose

# E2E tests (requires dev server running: pnpm dev)
cd apps/web && pnpm e2e
```

**Current coverage:** 275 unit/integration tests + 8 E2E tests.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register (teacher/student) |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Current user info |
| GET | `/api/courses` | Yes | List courses |
| GET | `/api/courses/:id` | Yes | Course detail + schedules |
| POST | `/api/courses` | Teacher | Create course |
| PUT | `/api/courses/:id` | Teacher | Update course |
| DELETE | `/api/courses/:id` | Teacher | Delete course |
| PATCH | `/api/courses/:id/status` | Teacher | Publish/unpublish |
| GET | `/api/courses/:id/schedules` | Yes | List schedules |
| POST | `/api/courses/:id/schedules` | Teacher | Create schedule |
| PUT | `/api/schedules/:id` | Teacher | Update schedule |
| DELETE | `/api/schedules/:id` | Teacher | Delete schedule |
| POST | `/api/enrollments` | Student | Apply for enrollment |
| GET | `/api/enrollments` | Yes | My enrollments |
| PATCH | `/api/enrollments/:id/review` | Teacher | Approve/reject |
| DELETE | `/api/enrollments/:id` | Student | Cancel enrollment |
| GET | `/api/health` | No | Health check |

## Deployment

### Local Docker Compose

Run the full stack (API + web + PostgreSQL) with a single command:

```bash
docker compose up --build
```

- Frontend: http://localhost
- API: http://localhost:3001

The `docker-compose.yml` at the project root wires up all three services and runs SQL migrations automatically on first boot.

### AWS (recommended architecture)

| Component | Service |
|-----------|---------|
| Frontend | S3 + CloudFront (serve the Vite static build) |
| API | ECS Fargate (uses `apps/api/Dockerfile`) |
| Database | RDS PostgreSQL |

**Build and push the API image:**

```bash
# Authenticate to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

docker build -f apps/api/Dockerfile -t course-manager-api .
docker tag course-manager-api:latest <account>.dkr.ecr.us-east-1.amazonaws.com/course-manager-api:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/course-manager-api:latest
```

**Build and deploy the frontend to S3:**

```bash
VITE_API_URL=https://api.yourdomain.com pnpm --filter @course-manager/web build
aws s3 sync apps/web/dist s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Environment variables for production

```env
DATABASE_URL=postgresql://...rds.amazonaws.com:5432/course_manager
JWT_SECRET=<strong-random-secret>
PORT=3001
NODE_ENV=production
```

## License

Apache 2.0 — see [LICENSE](./LICENSE) for details.
