---
name: course-manager-patterns
description: Coding patterns extracted from course-manager repository
version: 1.0.0
source: local-git-analysis
analyzed_commits: 4
---

# Course Manager Patterns

## Commit Conventions

This project uses **conventional commits**:
- `feat:` - New features (e.g., `feat: Phase 1 - 用户认证 + 课程CRUD + 学生浏览`)
- `fix:` - Bug fixes (e.g., `fix: use --env-file flag instead of dotenv package`)
- `chore:` - Maintenance tasks

100% of commits follow conventional commit format.

## Code Architecture

### Monorepo Structure (pnpm workspaces + Turborepo)

```
course-manager/
├── packages/
│   └── ui/                   # @course-manager/ui - Shared component library
│       └── src/components/   # All reusable UI components (shadcn/ui pattern)
├── apps/
│   ├── web/                  # @course-manager/web - React SPA (Vite + TanStack Router)
│   │   └── src/
│   │       ├── routes/       # File-based routing (teacher/ + student/)
│   │       ├── hooks/        # TanStack Query hooks
│   │       └── api/          # API client + mock data
│   └── api/                  # @course-manager/api - Express REST API
│       └── src/
│           ├── routes/       # Express route handlers
│           ├── middleware/    # Auth middleware (JWT)
│           └── db.ts         # PostgreSQL connection (pg)
```

### Key Conventions
- **Shared components** go in `packages/ui/src/components/` and are exported via barrel `index.ts`
- **Page-specific code** stays in `apps/web/src/routes/`
- **API routes** organized by resource in `apps/api/src/routes/`
- **SQL migrations** in `apps/api/sql/` with numbered prefix (e.g., `001_init.sql`)

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | pnpm 9.x workspaces + Turborepo 2.x |
| Frontend | React 19 + TypeScript + Vite 6 |
| Routing | TanStack Router (file-based) |
| Server State | TanStack Query v5 |
| Styling | TailwindCSS v4 |
| UI Components | shadcn/ui (Radix UI + CVA + tailwind-merge) |
| Backend | Express 4 + TypeScript (tsx for dev) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Database | PostgreSQL (pg driver) |

## Workflows

### Adding a New UI Component
1. Create component in `packages/ui/src/components/{name}.tsx`
2. Follow shadcn/ui pattern: `React.forwardRef`, CVA for variants, Radix UI primitives
3. Use `cn()` utility from `packages/ui/src/lib/utils.ts` for class merging
4. Export from `packages/ui/src/index.ts`

### Adding a New Route (Frontend)
1. Create file in `apps/web/src/routes/{role}/{name}.tsx`
2. Use `createFileRoute()` from TanStack Router
3. Route tree auto-regenerates via `@tanstack/router-plugin/vite`
4. Dynamic params use `$paramName` in filename (e.g., `feedback.$courseId.tsx`)

### Adding a New API Endpoint
1. Create route handler in `apps/api/src/routes/{resource}.ts`
2. Register in `apps/api/src/index.ts`
3. Protect with auth middleware from `apps/api/src/middleware/auth.ts`
4. Add corresponding TanStack Query hook in `apps/web/src/hooks/use-queries.ts`

### Adding a Database Migration
1. Create numbered SQL file in `apps/api/sql/` (e.g., `002_add_enrollments.sql`)
2. Run manually against PostgreSQL

## File Co-Change Patterns

Files that frequently change together:
- `apps/api/src/index.ts` + `apps/api/package.json` + `pnpm-lock.yaml` (backend dependency changes)
- `apps/web/src/routes/*.tsx` + `apps/web/src/routeTree.gen.ts` (route changes auto-regenerate tree)
- `apps/web/src/hooks/use-queries.ts` + `apps/web/src/routes/**/*.tsx` (data fetching tied to pages)

## Styling Patterns

- TailwindCSS v4 with `@import "tailwindcss"` syntax
- Design tokens in `packages/ui/src/globals.css` using `@theme`
- Mobile-first responsive: `md:`, `lg:` breakpoints
- Desktop/mobile breakpoint at `lg` (1024px)
- Font: Lexend (Google Fonts)
- Primary color: Blue-600 (#2563eb)

## Role-Based Architecture

Two user roles with separate route trees:
- **Teacher** (`/teacher/*`): Dashboard, Calendar, Courses, Students, Reports, Feedback Editor
- **Student** (`/student/*`): Schedule, Grades, Assignments, Resources, Feedback Detail

Layout routes (`route.tsx`) provide role-specific navigation:
- Teacher: Sidebar (desktop) + TopBar
- Student: BottomNav (mobile) + Sidebar (desktop)

## Testing Patterns

No test framework configured yet. When adding tests:
- Recommended: Vitest for unit/integration, Playwright for E2E
- Test location: co-located `__tests__/` or `.test.ts` suffix
- Coverage target: 80%+

## Development Commands

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start all apps in dev mode (Turborepo)
pnpm build            # Build all packages
pnpm typecheck        # Type check all packages
pnpm lint             # Lint all packages
pnpm clean            # Clean build artifacts
```
