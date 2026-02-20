# TODO: Unmet Requirements from PROMP-BASIC

Requirements from `PRD/PROMP-BASIC.md` that are not yet implemented in the project.
Items are grouped by priority.

---

## 🔴 HIGH Priority

### 1. README.md
**Requirement**: "Maintain a useful README for documentation"
**Status**: ✅ Done — `README.md` created at project root (committed)

---

### 2. Apache 2.0 License
**Requirement**: "mark the project as being Apache 2.0"
**Status**: ✅ Done — `LICENSE` file added with Apache 2.0 text (committed)

---

### 3. Oxlint (replace ESLint)
**Requirement**: "Oxlint - please use context7 to get the updated doc and best practice"
**Status**: ✅ Done — oxlint installed, `.oxlintrc.json` created, lint scripts updated in apps/web and packages/ui (committed)

---

### 4. oxfmt (code formatter)
**Requirement**: "oxfmt"
**Status**: ⚠️ Skipped — oxfmt is part of the oxc project but not production-ready; no standard formatter configured yet. Consider Biome or Prettier as alternative.

---

## 🟡 MEDIUM Priority

### 5. @lukemorales/query-key-factory
**Requirement**: "@lukemorales/query-key-factory to manage tanstack query query key"
**Status**: ✅ Done — `apps/web/src/lib/query-keys.ts` created with all key factories; `apps/web/src/hooks/use-queries.ts` fully refactored to use factory-generated keys.

---

### 6. EditorConfig
**Requirement**: "Editorconfig"
**Status**: ✅ Done — `.editorconfig` created at project root (committed)

---

### 7. AWS Deployment Configuration
**Requirement**: "prepare this to be deployed to AWS afterwards"
**Status**: ✅ Done — Docker setup complete:
  - `apps/api/Dockerfile` (multi-stage: builder + node:22-alpine runtime)
  - `apps/web/Dockerfile` (multi-stage: builder + nginx static server)
  - `docker-compose.yml` (API + web + PostgreSQL with auto-migration)
  - `.dockerignore` at project root
  - README.md updated with Docker Compose + AWS deployment instructions (ECS Fargate for API, S3+CloudFront for web, RDS for DB)

---

### 8. TanStack Form — Complete Coverage
**Requirement**: "tanstack form for form logic and form component for reusability"
**Status**: ✅ Done — TanStack Form used in all major forms:
  - `routes/login.tsx` ✅
  - `routes/(app)/teacher/courses.$courseId.tsx` ✅
  - `routes/(app)/teacher/courses.index.tsx` (create course dialog) ✅
  - `routes/(app)/teacher/feedback.$courseId.tsx` ✅ (requirements, feedback, homework refactored)

  Minor: `routes/(app)/student/assignments.tsx` search input — acceptable, not a form submission.

---

## 🟢 LOW Priority

### 9. Playwright E2E Tests — Coverage
**Requirement**: "use Playwright MCP server to test that UI is styled correctly and interactions work as planned"
**Status**: ✅ Done — `apps/web/e2e/prd.spec.ts` has 4 tests covering all critical flows:
  1. Public user can browse active courses and view details
  2. Teacher can log in and create a course from UI
  3. Student can log in, view course detail, and apply for enrollment
  4. Teacher can review (approve) a pending enrollment

  Run with: `cd apps/web && pnpm e2e` (requires running API + web dev servers)

---

### 10. Test Coverage — General
**Requirement**: "include decent coverage of tests and sane linting and code formatting"
**Status**: ⚠️ Some Vitest tests exist in `apps/api/src/__tests__/`, `apps/web/src/__tests__/`, `packages/ui/src/__tests__/` but coverage has not been measured
**TODO**:
- Run `pnpm test:coverage` and review coverage report
- Add missing tests to reach reasonable coverage (aim for 60%+ on critical paths)
- Focus on: API routes, auth middleware, query hooks, UI components

---

## ✅ Already Satisfied

For reference, requirements from PROMP-BASIC that ARE already met:

| Requirement | Implementation |
|-------------|---------------|
| TanStack Router + React | `apps/web/src/routes/` with file-based routing |
| TanStack Query v5 | `apps/web/src/hooks/use-queries.ts` |
| TanStack Form (partial) | `login.tsx`, `courses.$courseId.tsx`, `courses.index.tsx` |
| Follow Figma design | UI-TODO.md tracking — in progress |
| PC + H5 layout | Desktop sidebar + mobile bottom nav, `lg:` breakpoint |
| PostgreSQL | `apps/api/src/db.ts` with pg driver |
| TypeScript | All packages configured |
| Zod | `apps/web/src/lib/schemas.ts` |
| Vitest | All packages have `vitest.config.ts` |
| Playwright installed | `playwright.config.ts` + `@playwright/test` |
| Teacher role features | Dashboard, Calendar, Courses CRUD, Enrollments, Students, Reports, Feedback |
| Student role features | Dashboard, Courses, Enrollments, Grades, Assignments, Resources, Feedback |
