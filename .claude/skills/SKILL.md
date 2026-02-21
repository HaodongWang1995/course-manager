---
name: course-manager-patterns
description: Coding patterns extracted from course-manager repository
version: 1.1.0
source: local-git-analysis
analyzed_commits: 10+
---

# Course Manager Patterns

## Commit Conventions

This project uses **conventional commits**:
- `feat:` - New features
- `fix:` - Bug fixes
- `test:` - Test additions/modifications
- `chore:` - Maintenance, build, deployment
- `docs:` - Documentation changes
- `refactor:` - Code refactoring

100% of commits follow conventional commit format.

## Code Architecture

### Monorepo Structure (pnpm workspaces + Turborepo)

```
course-manager/
├── packages/
│   └── ui/                   # @course-manager/ui - Shared component library
│       └── src/
│           ├── components/   # All reusable UI components (shadcn/ui pattern)
│           └── index.ts      # Barrel exports for all components
├── apps/
│   ├── web/                  # @course-manager/web - React SPA (Vite + TanStack Router)
│   │   └── src/
│   │       ├── routes/       # File-based routing ((app)/teacher/ + (app)/student/)
│   │       ├── hooks/        # TanStack Query hooks (use-queries.ts)
│   │       ├── lib/          # query-keys.ts, schemas.ts
│   │       ├── components/   # Page-specific components (form-field.tsx, etc.)
│   │       └── api/          # API client (client.ts) + storage.ts
│   └── api/                  # @course-manager/api - Express REST API
│       └── src/
│           ├── routes/       # Express route handlers (one file per resource)
│           ├── middleware/   # Auth middleware (JWT)
│           ├── lib/          # Shared utilities (s3.ts for R2/S3 storage)
│           └── db.ts         # PostgreSQL connection (pg)
```

### Key Conventions
- **Shared components** go in `packages/ui/src/components/` and are exported via `packages/ui/src/index.ts`
- **Page-specific code** stays in `apps/web/src/routes/`
- **API routes** organized by resource in `apps/api/src/routes/`
- **SQL migrations** in `apps/api/sql/` with numbered prefix (e.g., `001_init.sql`)
- **Route registration** in `apps/api/src/app.ts` (NOT index.ts)
- **Query keys** centralized in `apps/web/src/lib/query-keys.ts` using `@lukemorales/query-key-factory`

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | pnpm 9.x workspaces + Turborepo 2.x |
| Frontend | React 19 + TypeScript + Vite 6 |
| Routing | TanStack Router (file-based) |
| Server State | TanStack Query v5 |
| Forms | TanStack Form + Zod |
| Query Keys | @lukemorales/query-key-factory |
| Styling | TailwindCSS v4 |
| UI Components | shadcn/ui (Radix UI + CVA + tailwind-merge) |
| Backend | Express 4 + TypeScript (tsx for dev) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Database | PostgreSQL (pg driver) |
| Storage | Cloudflare R2 via @aws-sdk/client-s3 (stub mode in dev) |
| Linting | Oxlint (.oxlintrc.json) |
| Testing | Vitest (unit/integration) + Playwright (E2E) |

## Mandatory Conventions

### 1. i18n — All User-Facing Text Must Use Translations

**Every string visible to the user must go through `react-i18next`.** No hardcoded English or Chinese strings in JSX or component logic.

```tsx
// ✅ Correct
import { useTranslation } from "react-i18next";
function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t("page.title")}</h1>;
}

// ❌ Wrong
function MyComponent() {
  return <h1>Weekly Schedule</h1>;
}
```

**Rules:**
- Add new keys to **both** `apps/web/src/locales/en.json` and `apps/web/src/locales/zh.json`
- Group keys by feature namespace: `schedule.*, enrollments.*, settings.*, upload.*, etc.`
- For `packages/ui` components with visible text: expose **text props** with English defaults so callers pass `t()` values
  ```tsx
  // packages/ui component
  function MyWidget({ emptyText = "No items" }: { emptyText?: string }) { ... }
  // caller (apps/web)
  <MyWidget emptyText={t("widget.empty")} />
  ```
- Locale files: `apps/web/src/locales/zh.json` (default), `apps/web/src/locales/en.json`
- i18n init: `apps/web/src/lib/i18n.ts`; import in `apps/web/src/main.tsx`
- Language persistence: `localStorage("lang")`; switch via `setLanguage(lang)` from `i18n.ts`

---

### 2. Route Files — Layout & Wiring Only; Pages in `pages/`

**Route files (`routes/**/*.tsx`) must only contain:**
- `createFileRoute()` declaration
- Import of the page component
- Simple redirects or guards

**All actual page logic lives in `apps/web/src/pages/`**, one folder per page. Sub-components of a page go in a `components/` sub-folder within that page folder.

```
apps/web/src/
├── routes/
│   └── (app)/
│       └── teacher/
│           ├── courses.tsx          ← route file: createFileRoute + import CoursesPage
│           └── courses.$courseId.tsx ← route file: createFileRoute + import CourseDetailPage
└── pages/
    └── teacher/
        ├── courses/
        │   ├── index.tsx            ← CoursesPage component (full logic)
        │   └── components/
        │       ├── course-card.tsx
        │       └── create-course-dialog.tsx
        └── course-detail/
            ├── index.tsx            ← CourseDetailPage component
            └── components/
                ├── schedule-list.tsx
                ├── assignment-section.tsx
                └── resource-section.tsx
```

**Route file template:**
```tsx
// apps/web/src/routes/(app)/teacher/courses.tsx
import { createFileRoute } from "@tanstack/react-router";
import { CoursesPage } from "@/pages/teacher/courses";

export const Route = createFileRoute("/(app)/teacher/courses")({
  component: CoursesPage,
});
```

**When splitting a page into sub-components:**
- Each sub-component gets its own file in `pages/{role}/{page}/components/`
- Sub-components receive props; no direct API calls inside sub-components — keep data fetching in the page's `index.tsx`
- Shared/reusable components (used across pages) go in `packages/ui/src/components/` or `apps/web/src/components/`

---

### 3. Component File Size — Max 400 Lines

**Every component file must stay under 400 lines.** If a file exceeds this limit, extract sub-components or split into smaller files.

**Rules:**
- Page `index.tsx` files exceeding 400 lines must extract sections into `components/` sub-files
- Dialog components with complex forms can be their own files (e.g., `add-schedule-dialog.tsx`)
- Group tightly related helpers (types, constants, small pure functions) at the top of the file they belong to — do NOT create separate files for them unless they're shared

```tsx
// ✅ Good — extract large sections into sub-files
// pages/teacher/course-detail/index.tsx  (~150 lines, orchestrator only)
// pages/teacher/course-detail/components/schedule-section.tsx  (~70 lines)
// pages/teacher/course-detail/components/add-schedule-dialog.tsx  (~90 lines)

// ❌ Bad — one 700-line file doing everything
// routes/(app)/teacher/courses.$courseId.tsx  (778 lines)
```

**When to split:**
- Any component function body exceeding ~80 lines is a candidate for extraction
- Complex dialogs with forms → their own file
- List/card sections with delete/edit → their own file

---

## Workflows

### Adding a New UI Component
1. Create component in `packages/ui/src/components/{name}.tsx`
2. Follow shadcn/ui pattern: `React.forwardRef`, CVA for variants, Radix UI primitives
3. Use `cn()` utility from `packages/ui/src/lib/utils.ts` for class merging
4. Export from `packages/ui/src/index.ts`
5. Add tests in `packages/ui/src/__tests__/components/{name}.test.tsx`

### Adding a New Route (Frontend)
1. Create file in `apps/web/src/routes/(app)/{role}/{name}.tsx`
2. Use `createFileRoute()` from TanStack Router
3. Route tree auto-regenerates via `@tanstack/router-plugin/vite`
4. Dynamic params use `$paramName` in filename (e.g., `courses.$courseId.tsx`)

### Adding a New API Endpoint
1. Create route handler in `apps/api/src/routes/{resource}.ts`
2. Register in `apps/api/src/app.ts` with `app.use("/api", resourceRoutes)`
3. Protect with auth middleware from `apps/api/src/middleware/auth.ts`
4. Add corresponding TanStack Query hook in `apps/web/src/hooks/use-queries.ts`
5. Add query key definition in `apps/web/src/lib/query-keys.ts`
6. Add API tests in `apps/api/src/__tests__/routes/{resource}.test.ts`

### Adding a Database Migration
1. Create numbered SQL file in `apps/api/sql/` (e.g., `004_add_attachments.sql`)
2. Run locally: `psql $DATABASE_URL -f apps/api/sql/004_add_attachments.sql`
3. On EC2: `docker exec -i course-manager-postgres-1 psql -U postgres -d coursemanager < 004_xxx.sql`

### Adding Query Keys
Uses `@lukemorales/query-key-factory`:
```ts
// apps/web/src/lib/query-keys.ts
export const resourceKeys = createQueryKeys("resource", {
  all: null,
  byId: (id: string) => [id],
});
// Add to mergeQueryKeys() at bottom of file
```

## File Co-Change Patterns

Files that frequently change together:
- `apps/api/src/app.ts` + `apps/api/src/routes/{resource}.ts` (new route registration)
- `apps/web/src/hooks/use-queries.ts` + `apps/web/src/lib/query-keys.ts` (data fetching)
- `apps/web/src/routes/**/*.tsx` + `apps/web/src/routeTree.gen.ts` (route changes auto-regenerate tree)
- `packages/ui/src/components/{name}.tsx` + `packages/ui/src/index.ts` (new component + export)
- `apps/api/src/routes/{resource}.ts` + `apps/api/src/__tests__/routes/{resource}.test.ts` (route + tests)

## Styling Patterns

- TailwindCSS v4 with `@import "tailwindcss"` syntax
- Design tokens in `packages/ui/src/globals.css` using `@theme`
- Mobile-first responsive: `md:`, `lg:` breakpoints
- Desktop/mobile breakpoint at `lg` (1024px)
- Font: Lexend (Google Fonts)
- Primary color: Blue-600 (#2563eb)

## Role-Based Architecture

Two user roles with separate route trees under `(app)/`:
- **Teacher** (`/teacher/*`): Dashboard, Calendar, Courses, Students, Reports, Feedback Editor
- **Student** (`/student/*`): Schedule, Grades, Assignments, Resources, Feedback Detail

Layout routes (`route.tsx`) provide role-specific navigation:
- Teacher: Sidebar (desktop) + TopBar
- Student: BottomNav (mobile) + Sidebar (desktop)

## Testing Patterns

**Test framework: Vitest + Playwright. 265+ tests passing.**

### Unit/Integration Tests (Vitest)
- API: `apps/api/src/__tests__/routes/{resource}.test.ts` — Supertest HTTP integration tests
- UI: `packages/ui/src/__tests__/components/{name}.test.tsx` — @testing-library/react
- Web: `apps/web/src/__tests__/` — hooks and utilities

```bash
pnpm test              # Run all tests
pnpm test:coverage     # Run with coverage report
```

### Mocking pattern for API tests
```ts
// Mock pool at module level
vi.mock("../../db.js");
const mockPool = pool as unknown as { query: ReturnType<typeof vi.fn> };

// Reset before each test
beforeEach(() => { mockPool.query.mockReset(); });

// Mock S3/storage modules
vi.mock("../../lib/s3.js", () => ({
  isStubMode: true,
  generateFileKey: vi.fn(...),
  createPresignedPutUrl: vi.fn(() => Promise.resolve("stub://upload/test-key")),
}));
```

### E2E Tests (Playwright)
- Config: `apps/web/playwright.config.ts`
- Tests: `apps/web/e2e/`
- Run: `pnpm playwright test` (from `apps/web/`)

### Coverage target: 80%+

## Development Commands

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start all apps in dev mode (Turborepo)
pnpm build            # Build all packages
pnpm typecheck        # Type check all packages
pnpm lint             # Lint all packages (Oxlint)
pnpm test             # Run all tests (Vitest)
pnpm test:coverage    # Run tests with coverage
pnpm clean            # Clean build artifacts
```

## Deployment

**Production: EC2 (t2.micro, us-west-2) via Docker Compose**

```bash
# Redeploy (from local machine)
scp docker-compose.prod.yml ec2-user@16.144.22.5:~/course-manager/
ssh -i ~/.ssh/course-manager-key.pem ec2-user@16.144.22.5 \
  "cd ~/course-manager && docker-compose -f docker-compose.prod.yml up -d --build"

# Apply DB migration on EC2
cat apps/api/sql/004_xxx.sql | ssh -i ~/.ssh/course-manager-key.pem ec2-user@16.144.22.5 \
  "docker exec -i course-manager-postgres-1 psql -U postgres -d coursemanager"
```

- **Live URL**: http://16.144.22.5
- **Stack**: postgres + api + web containers (nginx in web proxies `/api/` → `http://api:3001`)
- **Pitfall**: t2.micro OOMs on docker build → run `docker builder prune -af` first if low on disk
