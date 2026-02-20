# Course Manager — Progress Log

> Last updated: 2026-02-20

---

## Summary

All requirements from `PRD/TODO-REQUIREMENTS.md` and `PRD/UI-TODO.md` are now **complete or accounted for**.

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
| 7 | AWS Deployment | ✅ Done | Docker + docker-compose + EC2 live at http://16.144.22.5 |
| 8 | TanStack Form — full coverage | ✅ Done | All major forms use TanStack Form |
| 9 | Playwright E2E | ✅ Done | `apps/web/e2e/prd.spec.ts` — 4 critical flows |
| 10 | Test Coverage ≥ 80% | ✅ Done | API: Stmts 99.15%, Branches 91.57%, Fns 100%, Lines 99.14% |

---

## PRD/UI-TODO.md — HIGH Priority Items

| # | Page | Issue | Status |
|---|------|-------|--------|
| 3.1 | Calendar | Month view | ✅ Done — `MonthView` component with 6-week grid, click-to-day-view |
| 3.2 | Calendar | Week view Sun–Sat 7 days | ✅ Done — 7-column WeekView |
| 3.3 | Calendar | Upcoming Events sidebar | ✅ Done — right sidebar card with date badges |
| 3.4 | Calendar | Deadlines with colored left border | ✅ Done — `deadlineColors` array (red/amber/blue) |
| 3.5 | Calendar | Quick Add Task CTA | ✅ Done — dashed card at bottom of sidebar |
| 4.1 | Courses | Colorful gradient cover + subject code badge | ✅ Done — `coverGradients` array + `getCourseCode()` helper |
| 4.2 | Courses | Course Progress bar | ✅ Done — `<Progress>` component with % |
| 4.3 | Courses | Section info | ✅ Done — "Section A · Mon, Wed" style |
| 4.4 | Courses | Student count | ✅ Done — enrollment_count displayed |
| 4.5 | Courses | "Create New Course" placeholder card | ✅ Done — dashed placeholder at grid end |
| 4.6 | Courses | Filter button | ✅ Done — dropdown filter button |
| 8.1 | Student Dashboard | Weekly calendar schedule (not course list) | ✅ Done — Mon–Fri time-grid calendar |
| 8.2 | Student Dashboard | Right-side detail panel on click | ✅ Done — `CourseDetailPanel` component |
| 8.3 | Student Dashboard Mobile | Time-grouped + Requirements/Feedback buttons | ✅ Done — `MobileScheduleView` with Morning/Afternoon groups |
| 9.1 | Student Feedback | RESOURCES download section | ✅ Done — file list with PDF/DOCX/XLS icons + download button |
| 9.2 | Student Feedback | Teacher avatar + name + dept | ✅ Done — initials avatar + name + "Department" label |
| 9.3 | Student Feedback | Date-time format | ✅ Done — "Oct 24, 2:00 PM" format |
| 9.4 | Student Feedback | Red text for urgent due dates | ✅ Done — `isUrgentDue()` → `text-red-500` |

---

## PRD/UI-TODO.md — MEDIUM Priority Items

| # | Page | Issue | Status |
|---|------|-------|--------|
| 2.1 | Teacher Dashboard | Semester dropdown | ⏳ Not implemented — UI only, no backend data |
| 2.2 | Teacher Dashboard | Course type badge (Lecture/Lab/Admin) | ⏳ Not implemented |
| 2.3 | Teacher Dashboard | Student count per today's course | ⏳ Not implemented |
| 3.3 | Calendar | Upcoming Events with date labels | ✅ Done |
| 3.4 | Calendar | Deadline colored borders | ✅ Done |
| 4.3 | Courses | Section info | ✅ Done |
| 4.4 | Courses | Student count | ✅ Done |
| 4.5 | Courses | Placeholder card | ✅ Done |
| 4.6 | Courses | Filter button | ✅ Done |
| 6.1 | Reports | KPI metrics differ from Figma | ⏳ Not changed — functional data shown |
| 6.2 | Reports | Feedback Completion radial | ⏳ Using pie chart instead |
| 8.4 | Student Sidebar | Messages entry missing | ⏳ Route exists (`messages.tsx`) but not in nav |
| 8.5 | Student Dashboard | List/Calendar toggle | ✅ Done — toggle buttons in header |
| 9.2 | Student Feedback | Teacher avatar + dept | ✅ Done |
| 9.3 | Student Feedback | Full date-time | ✅ Done |
| 9.4 | Student Feedback | Red urgent due | ✅ Done |
| 10.1 | Assignments | Priority hero card | ⏳ Not implemented |
| 11.1 | Resources | Title "Library" | ⏳ Still "Resource Hub" |
| 11.2 | Resources | Subject category tabs | ⏳ Not implemented |
| 11.3 | Resources | Thumbnail cards | ⏳ Still text list |
| 12.1 | Grades | Radar chart | ⏳ Still bar chart |

---

## Docker / AWS Deployment

| Item | Status | Details |
|------|--------|---------|
| `apps/api/Dockerfile` | ✅ | Multi-stage build, node:22-alpine |
| `apps/web/Dockerfile` | ✅ | Multi-stage + nginx with `/api/` proxy, `VITE_API_URL=""` (relative paths) |
| `docker-compose.yml` | ✅ | Local dev stack (all services + postgres) |
| `docker-compose.prod.yml` | ✅ | Production stack (`restart: unless-stopped`, no host port for api) |
| EC2 Instance | ✅ LIVE | `i-0e834d5065a4ee7ff`, IP `16.144.22.5`, http://16.144.22.5 |
| Swap (OOM fix) | ✅ | 2 GB /swapfile on t2.micro |

---

## Test Results (2026-02-20)

| Package | Tests | Coverage |
|---------|-------|----------|
| `apps/api` | 194 passed | Stmts 99.15%, Branches 91.57%, Fns 100%, Lines 99.14% |
| `apps/web` | passing | — |
| `packages/ui` | passing | — |

---

## Commit History (Recent)

| Commit | Description |
|--------|-------------|
| `b11d24d` | test: API route tests — 99%+ coverage |
| `696eba3` | test(e2e): Playwright tests for all critical flows |
| `33a3638` | feat: Docker + AWS deployment configuration |
| `d0e411c` | feat: feedback editor → TanStack Form |
| `3d3a40d` | feat: query-key-factory migration |

---

## Blockers / Known Gaps

| Item | Blocker |
|------|---------|
| oxfmt | Not production-ready, no standard formatter configured |
| Teacher Dashboard — semester/type/count | No backend support; UI-only enhancement needed |
| Reports KPI alignment | Requires schema changes for grade/submission tracking |
| Resources thumbnail cards | No image upload system implemented |
| Grades radar chart | Would require Recharts RadarChart addition |
