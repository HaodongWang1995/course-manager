# Course Manager (EduManager / EduPortal)

A modern course management system built as a monorepo, supporting both Teacher and Student roles with responsive mobile/desktop layouts. Features real backend API with JWT authentication, PostgreSQL database, and full CRUD for courses, enrollments, and schedules.

## Keyword-Triggered Workflows

When the user's message contains any of these keywords, immediately execute the corresponding workflow defined in `.claude/commands/`:

| Keyword | Slash Command | Action |
|---------|---------------|--------|
| **【新增TODO】** | `/new-todo` | Create a TODO document in `PRD/` with priority (P0/P1/P2) |
| **【新增需求】** | `/new-requirement` | Collect requirements, write PRD file, commit |
| **【按优先级开发】** | `/dev-priority` | Scan `PRD/` → sort by priority → develop highest → test → commit → deploy → regression → archive → **loop** until none left |
| **【测试功能】** | `/test-feature` | Run all tests (unit + E2E + typecheck), create TODO for each issue found |

**Rules:**
- When a keyword is detected, follow the full workflow in the corresponding command file without skipping steps
- PRD documents live in `PRD/`, completed ones go to `PRD/archived/`
- Priority: P0 (blocker) > P1 (important) > P2 (nice-to-have)
- Always confirm with the user before deploying to production

## Data Safety Rules (CRITICAL)

**绝对不允许在未经用户确认的情况下导致数据丢失。** 以下操作必须先向用户说明风险并获得明确确认：

1. **数据库相关**
   - 切换 Docker volume、更换数据库容器、修改 Docker Compose 项目名 → 会导致数据库数据不可访问
   - DROP TABLE / TRUNCATE / DELETE 无 WHERE 条件的迁移脚本
   - 重建容器时未挂载原有 volume
   - 任何可能导致 PostgreSQL 数据目录变更的操作

2. **部署相关**
   - 更换部署目录或 Docker Compose 项目名（volume 名会跟随变化）
   - `docker compose down -v`（-v 会删除 volume）
   - `docker system prune` / `docker volume prune`
   - 任何涉及停止数据库容器并重建的操作

3. **文件与配置**
   - 删除或覆盖 `.env` 文件、数据库连接配置
   - 修改 `docker-compose.prod.yml` 中的 volume 映射
   - 删除 SQL 迁移文件

4. **确认流程**
   - 在执行上述任何操作前，必须使用 `AskUserQuestion` 向用户说明：将要执行什么操作、可能丢失什么数据、是否有备份方案
   - 用户明确同意后才可继续
   - 如果不确定某个操作是否会影响数据，默认视为有风险，先确认

## Test Account Convention

所有测试账号的密码统一为 `111111`。创建新测试账号时必须使用此密码。

| 邮箱 | 角色 | 说明 |
|------|------|------|
| `teacher@test.com` | 教师 | 主测试教师账号（有课程数据） |
| `teacher001@test.com` | 教师 | 辅助教师账号 |
| `testteacher@test.com` | 教师 | 辅助教师账号 |
| `student@test.com` | 学生 | 主测试学生账号（有选课数据） |
| `student001@test.com` | 学生 | 辅助学生账号 |
| `teststudent@test.com` | 学生 | 辅助学生账号 |

## Baseline Development Requirements

These requirements come from `PRD/PROMP-BASIC.md` and serve as the foundation for every development session.

### Roles & Features
- **Teacher**: Create/edit/unpublish courses (name, description, price, schedule); review enrollment applications
- **Student**: Browse course list, view course details & schedule, search/filter, apply for enrollment, check application status

### Mandatory Tech Stack
| Tool | Purpose | Status |
|------|---------|--------|
| TanStack Router + React | Routing | ✅ Done |
| TanStack Query v5 | Server state / data fetching | ✅ Done |
| TanStack Form | All form logic + reusable form components | ✅ Done (all forms migrated) |
| @lukemorales/query-key-factory | Centralized query key management | ✅ Done (`apps/web/src/lib/query-keys.ts`) |
| Figma design | UI must match Figma designs as closely as possible | ✅ Done (all 46 UI-TODO items resolved) |
| PC + H5 responsive layout | Shared layout across all pages | ✅ Done |
| PostgreSQL (AWS) | Database | ✅ Done (EC2 live at http://100.23.242.232) |
| TypeScript | Type safety | ✅ Done |
| Zod | Form validation | ✅ Done |
| Oxlint | Linting (replaces ESLint) | ✅ Done (configured in root package.json) |
| oxfmt | Code formatting | ❌ De-prioritized (not production-ready) |
| Vitest | Unit/integration testing | ✅ Done (265+ tests) |
| Playwright | E2E UI testing (automated tests + MCP for visual verification) | ✅ Done (8 E2E tests in `apps/web/e2e/prd.spec.ts`) |
| EditorConfig | `.editorconfig` in project root | ✅ Done |

### Project Standards
- Maintain decent test coverage (unit + E2E)
- Use Playwright MCP server to verify UI styling and interactions after changes
- Maintain a useful **README.md** at the project root
- Add **Apache 2.0 LICENSE** file
- Prepare for GitHub hosting (clean repo, documented)
- Prepare **AWS deployment configuration** (ECS, EC2, or similar)

## Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Build**: Vite 6
- **Styling**: TailwindCSS v4
- **Routing**: TanStack Router (file-based routing)
- **Server State**: TanStack Query v5
- **UI Components**: shadcn/ui pattern (Radix UI primitives + CVA + tailwind-merge)
- **Form Validation**: Zod
- **Icons**: Lucide React
- **Charts**: Recharts
- **Font**: Lexend (Google Fonts)

### Backend
- **Runtime**: Node.js + TypeScript (tsx for dev)
- **Framework**: Express 4
- **Database**: PostgreSQL (pg driver)
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Testing**: Vitest + Supertest

### Infra
- **Monorepo**: pnpm workspaces + Turborepo
- **Testing**: Vitest (all packages)

## Project Structure

```
course-manager/
├── package.json              # Root workspace config
├── pnpm-workspace.yaml       # pnpm workspace definition
├── turbo.json                # Turborepo task config
├── tsconfig.base.json        # Shared TypeScript config
├── CLAUDE.md                 # This file
├── PRD/                      # Product requirements documents
│
├── packages/
│   └── ui/                   # @course-manager/ui - Shared component library
│       ├── package.json
│       ├── vitest.config.ts
│       └── src/
│           ├── index.ts      # Barrel exports
│           ├── globals.css   # Design tokens & base styles
│           ├── lib/
│           │   └── utils.ts  # cn() utility (clsx + tailwind-merge)
│           ├── __tests__/    # Component & utility tests
│           └── components/
│               ├── auth-loading.tsx  # Auth loading spinner
│               ├── avatar.tsx        # User avatars (Radix)
│               ├── badge.tsx         # Status badges (CVA)
│               ├── bottom-nav.tsx    # Mobile bottom tab bar
│               ├── button.tsx        # Button with variants (CVA)
│               ├── card.tsx          # Card container
│               ├── checkbox.tsx      # Checkbox (Radix)
│               ├── collapsible.tsx   # Collapsible sections (Radix)
│               ├── dialog.tsx        # Modal dialogs (Radix)
│               ├── dropdown-menu.tsx # Dropdown menus (Radix)
│               ├── input.tsx         # Text input
│               ├── kpi-card.tsx      # KPI stat cards
│               ├── label.tsx         # Form label (Radix)
│               ├── page-layout.tsx   # Page layout wrappers
│               ├── progress.tsx      # Progress bars (Radix)
│               ├── schedule-card.tsx # Class schedule cards
│               ├── scroll-area.tsx   # Custom scrollbars (Radix)
│               ├── select.tsx        # Select dropdown (Radix)
│               ├── separator.tsx     # Visual separator (Radix)
│               ├── sidebar.tsx       # Desktop sidebar navigation
│               ├── tabs.tsx          # Tab navigation (Radix)
│               ├── tooltip.tsx       # Tooltips (Radix)
│               └── top-bar.tsx       # Top navigation bar
│
└── apps/
    ├── api/                  # @course-manager/api - Backend API server
    │   ├── package.json
    │   ├── vitest.config.ts
    │   ├── .env              # Environment variables (DB, JWT secret)
    │   ├── sql/
    │   │   ├── 001_init.sql          # Core schema (users, courses, schedules)
    │   │   └── 002_enrollments.sql   # Enrollments table migration
    │   └── src/
    │       ├── index.ts              # Server entry (listen on PORT)
    │       ├── app.ts                # Express app setup (CORS, routes)
    │       ├── db.ts                 # PostgreSQL connection & queries
    │       ├── middleware/
    │       │   └── auth.ts           # JWT auth middleware
    │       ├── routes/
    │       │   ├── auth.ts           # POST /api/auth/register, login, GET /me
    │       │   ├── courses.ts        # CRUD /api/courses, PATCH status
    │       │   ├── enrollments.ts    # POST /api/enrollments, PATCH review
    │       │   └── schedules.ts      # CRUD /api/courses/:id/schedules
    │       └── __tests__/
    │           ├── setup.ts
    │           ├── helpers.ts
    │           └── routes/           # Route-level integration tests
    │
    └── web/                  # @course-manager/web - Frontend application
        ├── package.json
        ├── vite.config.ts
        ├── vitest.config.ts
        ├── index.html
        └── src/
            ├── main.tsx              # App entry point
            ├── routeTree.gen.ts      # Auto-generated route tree
            ├── styles/globals.css    # App-level styles
            ├── api/
            │   ├── client.ts         # HTTP client (fetch + JWT token management)
            │   ├── mock-data.ts      # Mock data for development
            │   └── storage.ts        # LocalStorage wrapper (auth persistence)
            ├── lib/
            │   └── schemas.ts        # Zod validation schemas
            ├── hooks/
            │   ├── use-queries.ts    # TanStack Query hooks (all API calls)
            │   └── use-auth-guard.ts # Auth protection hook
            ├── components/
            │   ├── index.ts          # Component barrel exports
            │   ├── empty-state.tsx   # Empty state placeholder
            │   ├── form-field.tsx    # Form field wrappers (text, textarea, select, datetime)
            │   └── stat-card.tsx     # Statistics display card
            ├── __tests__/            # Frontend tests
            └── routes/
                ├── __root.tsx
                ├── index.tsx              # → Redirects to /landing
                ├── landing.tsx            # Public landing page
                ├── login.tsx              # Login & registration
                ├── teacher/
                │   ├── route.tsx          # Teacher layout (sidebar + topbar)
                │   ├── index.tsx          # Dashboard
                │   ├── calendar.tsx       # Calendar view
                │   ├── courses.tsx        # Course list & management
                │   ├── courses.$courseId.tsx  # Course detail/edit
                │   ├── enrollments.tsx    # Enrollment review
                │   ├── students.tsx       # Student directory
                │   ├── reports.tsx        # Reports & analytics
                │   └── feedback.$courseId.tsx  # Feedback editor
                └── student/
                    ├── route.tsx          # Student layout (bottom nav + sidebar)
                    ├── index.tsx          # Dashboard / Schedule
                    ├── courses.$courseId.tsx  # Course detail view
                    ├── enrollments.tsx    # My enrollments
                    ├── grades.tsx         # Gradebook
                    ├── assignments.tsx    # Assignment center
                    ├── resources.tsx      # Resource library
                    └── feedback.$courseId.tsx  # Course feedback
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register new user (teacher/student) |
| POST | `/api/auth/login` | No | Login, returns JWT token |
| GET | `/api/auth/me` | Yes | Get current user info |
| GET | `/api/courses` | Yes | List courses (with search/category/status filters) |
| GET | `/api/courses/:id` | Yes | Get course detail (includes schedules) |
| POST | `/api/courses` | Teacher | Create course |
| PUT | `/api/courses/:id` | Teacher | Update course |
| DELETE | `/api/courses/:id` | Teacher | Delete course |
| PATCH | `/api/courses/:id/status` | Teacher | Update course status |
| GET | `/api/courses/:id/schedules` | Yes | List schedules for a course |
| POST | `/api/courses/:id/schedules` | Teacher | Create schedule |
| PUT | `/api/schedules/:id` | Teacher | Update schedule |
| DELETE | `/api/schedules/:id` | Teacher | Delete schedule |
| POST | `/api/enrollments` | Student | Apply to enroll in a course |
| GET | `/api/enrollments` | Yes | List my enrollments (student) / by course (teacher) |
| GET | `/api/enrollments/course/:id` | Teacher | List enrollments for a course |
| PATCH | `/api/enrollments/:id/review` | Teacher | Approve/reject enrollment |
| DELETE | `/api/enrollments/:id` | Student | Cancel enrollment |
| GET | `/api/health` | No | Health check |

## Commands

```bash
# Install dependencies
pnpm install

# Development (all packages: web + api)
pnpm dev

# Build all packages
pnpm build

# Type checking
pnpm typecheck

# Run tests (all packages)
pnpm test

# Run tests with coverage
pnpm test:coverage

# Lint
pnpm lint

# Clean build artifacts
pnpm clean
```

## Design System

### Colors
- **Primary**: Blue-600 (#2563eb) - Main actions, active states
- **Background**: White (#ffffff) / Gray-50 (#f8fafc)
- **Text**: Slate-900 (#0f172a), Slate-500 (#64748b), Slate-400 (#94a3b8)
- **Border**: Slate-200 (#e2e8f0)
- **Success**: Emerald-500 (#10b981)
- **Warning**: Amber-500 (#f59e0b)
- **Destructive**: Red-500 (#ef4444)

### Typography
- **Font Family**: Lexend
- **Sizes**: 10px (labels), 12px (small), 14px (body), 16px (subheading), 18-24px (heading)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Layout
- **Desktop**: 256px sidebar + fluid content area + optional right panel
- **Mobile**: Full-width content + 64px bottom navigation bar
- **Breakpoint**: `lg` (1024px) for desktop/mobile switch
- **Max content width**: 1280px (7xl)

## Conventions

### Component Development
- All shared/reusable components go in `packages/ui/src/components/`
- Page-specific components stay in `apps/web/src/routes/` or `apps/web/src/components/`
- Use `cn()` utility for conditional class merging
- Follow shadcn/ui patterns: React.forwardRef, CVA for variants, Radix UI primitives
- Export all components from `packages/ui/src/index.ts`

### Routing
- TanStack Router file-based routing with `createFileRoute()`
- Layout routes use `route.tsx` with `<Outlet />`
- Dynamic params: `$paramName` in filename (e.g., `feedback.$courseId.tsx`)
- Route tree auto-generated by `@tanstack/router-plugin/vite`

### Data Fetching
- API client with JWT auth in `apps/web/src/api/client.ts`
- TanStack Query hooks in `apps/web/src/hooks/use-queries.ts`
- Query keys follow pattern: `[role, resource]` (e.g., `["teacher", "courses"]`)
- Auth token stored in localStorage via `api/client.ts` (getToken/setToken/clearToken)
- Auth guard hook in `apps/web/src/hooks/use-auth-guard.ts`
- Form validation schemas in `apps/web/src/lib/schemas.ts` (Zod)

### Styling
- TailwindCSS v4 with `@import "tailwindcss"` syntax
- Design tokens defined in `packages/ui/src/globals.css` using `@theme`
- No separate CSS modules - all styling via Tailwind utility classes
- Responsive: mobile-first, use `md:`, `lg:` breakpoints

### Backend
- Express app configured in `apps/api/src/app.ts`, server in `index.ts`
- PostgreSQL via `pg` driver, connection/queries in `apps/api/src/db.ts`
- JWT auth middleware in `apps/api/src/middleware/auth.ts`
- SQL migrations in `apps/api/sql/` (numbered: 001_, 002_, ...)
- Environment variables in `apps/api/.env` (DATABASE_URL, JWT_SECRET, PORT)

### Testing
- Vitest for all packages (config in each package's `vitest.config.ts`)
- Backend: Supertest for HTTP integration tests in `apps/api/src/__tests__/`
- Frontend: Component and API client tests in `apps/web/src/__tests__/`
- UI: Component tests in `packages/ui/src/__tests__/`

### Roles
- **Teacher (EduManager)**: Dashboard, Calendar, Courses (CRUD), Course Detail, Enrollments (review), Students, Reports, Feedback Editor
- **Student (EduPortal)**: Dashboard/Schedule, Course Detail, Enrollments (apply/cancel), Gradebook, Assignments, Resources, Feedback Detail
