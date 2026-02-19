# TODO: Unmet Requirements from PROMP-BASIC

Requirements from `PRD/PROMP-BASIC.md` that are not yet implemented in the project.
Items are grouped by priority.

---

## 🔴 HIGH Priority

### 1. README.md
**Requirement**: "Maintain a useful README for documentation"
**Status**: ❌ No README.md exists in the project root
**TODO**:
- Create `README.md` at project root
- Include: project overview, tech stack, setup instructions, development commands, environment variables, deployment guide

---

### 2. Apache 2.0 License
**Requirement**: "mark the project as being Apache 2.0"
**Status**: ❌ No LICENSE file exists
**TODO**:
- Add `LICENSE` file at project root with Apache 2.0 text
- Add license header reference in README.md

---

### 3. Oxlint (replace ESLint)
**Requirement**: "Oxlint - please use context7 to get the updated doc and best practice"
**Status**: ❌ Project currently uses ESLint (`"lint": "eslint src/"` in apps/web/package.json); Oxlint not installed
**TODO**:
- Install `oxlint` in apps/web and packages/ui
- Replace ESLint config with `.oxlintrc.json`
- Update `lint` scripts in package.json files
- Remove ESLint dependencies

---

### 4. oxfmt (code formatter)
**Requirement**: "oxfmt"
**Status**: ❌ No formatter configured (no Prettier, no oxfmt)
**TODO**:
- Investigate if oxfmt is the right formatter (may be Biome/oxc-based)
- Configure formatter for the project
- Add format script to package.json

---

## 🟡 MEDIUM Priority

### 5. @lukemorales/query-key-factory
**Requirement**: "@lukemorales/query-key-factory to manage tanstack query query key"
**Status**: ❌ Not installed; query keys are manually defined as string arrays (e.g., `["teacher", "courses"]`) in `apps/web/src/hooks/use-queries.ts`
**TODO**:
- Install `@lukemorales/query-key-factory` in apps/web
- Refactor `apps/web/src/hooks/use-queries.ts` to use `createQueryKeyStore` / `createQueryKeys`
- Ensures consistent, type-safe query keys across the app

---

### 6. EditorConfig
**Requirement**: "Editorconfig"
**Status**: ❌ No `.editorconfig` file at project root
**TODO**:
- Create `.editorconfig` at project root
- Configure: `indent_style = space`, `indent_size = 2`, `end_of_line = lf`, `charset = utf-8`, `trim_trailing_whitespace = true`, `insert_final_newline = true`

---

### 7. AWS Deployment Configuration
**Requirement**: "prepare this to be deployed to AWS afterwards"
**Status**: ❌ No deployment configuration exists (no Dockerfile, no ECS task definition, no CDK/Terraform)
**TODO**:
- Add `Dockerfile` for the API server (`apps/api/Dockerfile`)
- Add `Dockerfile` for the web frontend (`apps/web/Dockerfile`) or configure for static hosting (S3 + CloudFront)
- Add `docker-compose.yml` for local development with PostgreSQL
- Add deployment documentation in README.md
- Consider: AWS ECS (API) + S3/CloudFront (frontend) + RDS (PostgreSQL)

---

### 8. TanStack Form — Complete Coverage
**Requirement**: "tanstack form for form logic and form component for reusability"
**Status**: ⚠️ Partial — TanStack Form is installed and used in:
  - `routes/login.tsx` ✅
  - `routes/(app)/teacher/courses.$courseId.tsx` ✅
  - `routes/(app)/teacher/courses.index.tsx` (create course dialog) ✅

  Still using raw controlled `<textarea>` / `<input>` in:
  - `routes/(app)/teacher/feedback.$courseId.tsx` — requirements, feedback, homework fields
  - `routes/(app)/student/assignments.tsx` — search input (minor, acceptable)

**TODO**:
- Refactor `feedback.$courseId.tsx` textarea/input fields to use TanStack Form
- Ensure all user-facing forms use the reusable `FormField` component from `apps/web/src/components/form-field.tsx`

---

## 🟢 LOW Priority

### 9. Playwright E2E Tests — Coverage
**Requirement**: "use Playwright MCP server to test that UI is styled correctly and interactions work as planned"
**Status**: ⚠️ Playwright is installed and configured (`playwright.config.ts`, `e2e/prd.spec.ts` exists), but test coverage is minimal
**TODO**:
- Write E2E tests for critical user flows:
  - Teacher: login → create course → publish
  - Teacher: review enrollment (approve/reject)
  - Student: login → browse courses → enroll
  - Student: view assignments → submit
- Aim for coverage of all major pages

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
