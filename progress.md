# Course Manager — Progress Log

> Last updated: 2026-02-24

---

## Summary

All requirements from PRD are **complete**. All TODO items have been resolved and archived to `PRD/archived/`.

---

## Archived TODOs

All TODO documents are in `PRD/archived/`:

| File | Description | Status |
|------|-------------|--------|
| `TODO-REQUIREMENTS.md` | PROMP-BASIC requirements (10 items) | ✅ All done (oxfmt skipped — not production-ready) |
| `TODO-NEXT.md` | Sprint tasks (Link migration + calendar fix) | ✅ All done |
| `TODO-REGRESSION-20260220.md` | Regression bugs + new features (7 bugs, 5 UI, 2 features) | ✅ All done |
| `TODO-REGRESSION-20260221.md` | Regression bugs + features (4 bugs, 2 features) | ✅ All done |
| `TODO-REFACTOR-PAGES.md` | Route/page structure refactor (23 items) | ✅ 23/23 done |
| `TODO-I18N.md` | Full i18n internationalization (7 phases) | ✅ All done |
| `TODO-ATTACHMENTS.md` | File upload/download with Cloudflare R2 (3 phases) | ✅ All done |
| `UI-TODO.md` | Figma vs implementation comparison (46 items) | ✅ 46/46 done |

---

## PRD/TODO-REQUIREMENTS.md

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | README.md | ✅ Done | Project root |
| 2 | Apache 2.0 License | ✅ Done | `LICENSE` file |
| 3 | Oxlint | ✅ Done | `.oxlintrc.json`, lint scripts in apps/web & packages/ui |
| 4 | oxfmt | ⚠️ Skipped | Not production-ready; no replacement configured yet |
| 5 | @lukemorales/query-key-factory | ✅ Done | `apps/web/src/lib/query-keys.ts` + `use-queries.ts` refactored |
| 6 | EditorConfig | ✅ Done | `.editorconfig` at project root |
| 7 | AWS Deployment | ✅ Done | Docker + docker-compose + EC2 live |
| 8 | TanStack Form — full coverage | ✅ Done | All major forms use TanStack Form |
| 9 | Playwright E2E | ✅ Done | `apps/web/e2e/prd.spec.ts` — 8 E2E tests |
| 10 | Test Coverage ≥ 80% | ✅ Done | API: Stmts 99.15%, Branches 91.57%, Fns 100%, Lines 99.14% |

---

## PRD/UI-TODO.md — All 46 Items Complete

| Priority | Count | Status |
|----------|-------|--------|
| 🔴 HIGH | 7 | ✅ All done |
| 🟡 MEDIUM | 26 | ✅ All done |
| 🟢 LOW | 13 | ✅ All done |
| **Total** | **46** | **✅ 100%** |

---

## Feature Completion Summary

| Feature | Status |
|---------|--------|
| Teacher Dashboard (semester/type/student count) | ✅ Done |
| Teacher Calendar (month/week/day views) | ✅ Done |
| Teacher Courses (CRUD, filters, progress) | ✅ Done |
| Teacher Course Detail (schedules, attachments, assignments, resources) | ✅ Done |
| Teacher Enrollments (review/approve/reject) | ✅ Done |
| Teacher Students (real data, table, filters) | ✅ Done |
| Teacher Reports (KPI + Recharts visualizations) | ✅ Done |
| Teacher Feedback Editor (real data, TanStack Form) | ✅ Done |
| Student Dashboard (weekly calendar, detail panel) | ✅ Done |
| Student Course Browse + Detail (enrollment CTA) | ✅ Done |
| Student Enrollments (apply/cancel/status) | ✅ Done |
| Student Grades (radar chart, KPI) | ✅ Done |
| Student Assignments (priority hero card, filters) | ✅ Done |
| Student Resources (Library, category tabs, thumbnails) | ✅ Done |
| Student Feedback Detail (resources, teacher info) | ✅ Done |
| File Upload/Download (Cloudflare R2 + local stub) | ✅ Done |
| i18n (zh/en, full coverage) | ✅ Done |
| Page refactor (routes → pages/) | ✅ 23/23 done |
| Login/Register (TanStack Form, no role selector on login) | ✅ Done |
| Settings (real user data, password change) | ✅ Done |

---

## Docker / AWS Deployment

| Item | Status | Details |
|------|--------|---------|
| `apps/api/Dockerfile` | ✅ | Multi-stage build, node:22-alpine |
| `apps/web/Dockerfile` | ✅ | Multi-stage + nginx with `/api/` proxy |
| `docker-compose.yml` | ✅ | Local dev stack (all services + postgres) |
| `docker-compose.prod.yml` | ✅ | Production stack (`restart: unless-stopped`) |
| EC2 Instance | ✅ LIVE | http://100.23.242.232 |
| R2 Storage | ✅ | Configured for file attachments |
| Swap (OOM fix) | ✅ | 2 GB /swapfile on t2.micro |

---

## Test Results

| Package | Tests | Coverage |
|---------|-------|----------|
| `apps/api` | 194 passed | Stmts 99.15%, Branches 91.57%, Fns 100%, Lines 99.14% |
| `apps/web` | passing | — |
| `packages/ui` | passing | — |
| E2E | 8 tests | `apps/web/e2e/prd.spec.ts` |

---

## Recent Commit History

| Commit | Description |
|--------|-------------|
| `9242c67` | fix: configure R2 storage and increase nginx upload limit |
| `320968d` | fix: support local file upload/download in stub mode (no S3) |
| `5004a19` | refactor: use PageLayout component for app layout |
| `52ff47f` | fix: remove semester selector, add attachment download, expand schedule/assignment details |
| `be1ee78` | fix: extend calendar day/week view to full 24-hour grid |
| `1534c59` | fix: connect real StudentGradesPage to grades route |
| `dcd0c9b` | feat: replace chart placeholders with real Recharts visualizations |
| `4d0992b` | docs: archive completed TODO-REGRESSION-20260221 and TODO-I18N |
| `ae8dde0` | fix: complete i18n for calendar, login hero, resources, course filter |
| `a8f3ae9` | fix: replace last remaining hardcoded strings with i18n keys |

---

## Known Gaps (Non-blocking)

| Item | Notes |
|------|-------|
| oxfmt | Not production-ready as of 2026-02; acceptable skip |
| Messages feature | Placeholder "coming soon" page — no real messaging backend |
| Support contact form | UI-only, no backend email/ticket system |
