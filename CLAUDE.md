# Course Manager (EduManager / EduPortal)

A modern course management system built as a monorepo, supporting both Teacher and Student roles with responsive mobile/desktop layouts.

## Tech Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Framework**: React 19 + TypeScript
- **Build**: Vite 6
- **Styling**: TailwindCSS v4
- **Routing**: TanStack Router (file-based routing)
- **Server State**: TanStack Query v5
- **UI Components**: shadcn/ui pattern (Radix UI primitives + CVA + tailwind-merge)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Font**: Lexend (Google Fonts)

## Project Structure

```
course-manager/
├── package.json              # Root workspace config
├── pnpm-workspace.yaml       # pnpm workspace definition
├── turbo.json                # Turborepo task config
├── tsconfig.base.json        # Shared TypeScript config
├── CLAUDE.md                 # This file
│
├── packages/
│   └── ui/                   # @course-manager/ui - Shared component library
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts      # Barrel exports
│           ├── globals.css   # Design tokens & base styles
│           ├── lib/
│           │   └── utils.ts  # cn() utility (clsx + tailwind-merge)
│           └── components/
│               ├── button.tsx        # Button with variants (CVA)
│               ├── input.tsx         # Text input
│               ├── label.tsx         # Form label
│               ├── card.tsx          # Card container
│               ├── badge.tsx         # Status badges
│               ├── avatar.tsx        # User avatars
│               ├── progress.tsx      # Progress bars
│               ├── separator.tsx     # Visual separator
│               ├── tabs.tsx          # Tab navigation
│               ├── select.tsx        # Select dropdown
│               ├── checkbox.tsx      # Checkbox input
│               ├── dialog.tsx        # Modal dialogs
│               ├── dropdown-menu.tsx # Dropdown menus
│               ├── tooltip.tsx       # Tooltips
│               ├── scroll-area.tsx   # Custom scrollbars
│               ├── collapsible.tsx   # Collapsible sections
│               ├── sidebar.tsx       # Desktop sidebar navigation
│               ├── top-bar.tsx       # Top navigation bar
│               ├── bottom-nav.tsx    # Mobile bottom tab bar
│               ├── kpi-card.tsx      # KPI stat cards
│               ├── schedule-card.tsx # Class schedule cards
│               ├── course-card.tsx   # Course info cards
│               └── page-layout.tsx   # Page layout wrappers
│
└── apps/
    └── web/                  # @course-manager/web - Main application
        ├── package.json
        ├── vite.config.ts
        ├── index.html
        └── src/
            ├── main.tsx              # App entry point
            ├── routeTree.gen.ts      # Auto-generated route tree
            ├── styles/globals.css    # App-level styles
            ├── api/mock-data.ts      # Mock data for development
            ├── hooks/use-queries.ts  # TanStack Query hooks
            └── routes/
                ├── __root.tsx
                ├── index.tsx          # → Redirects to /login
                ├── login.tsx          # Login & role selection
                ├── teacher/
                │   ├── route.tsx      # Teacher layout (sidebar + topbar)
                │   ├── index.tsx      # Dashboard
                │   ├── calendar.tsx   # Calendar view
                │   ├── courses.tsx    # Course management
                │   ├── students.tsx   # Student directory
                │   ├── reports.tsx    # Reports & analytics
                │   └── feedback.$courseId.tsx  # Feedback editor
                └── student/
                    ├── route.tsx      # Student layout (bottom nav + sidebar)
                    ├── index.tsx      # Schedule (mobile home)
                    ├── grades.tsx     # Gradebook
                    ├── assignments.tsx # Assignment center
                    ├── resources.tsx  # Resource library
                    └── feedback.$courseId.tsx  # Course feedback detail
```

## Commands

```bash
# Install dependencies
pnpm install

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
- TanStack Query hooks in `apps/web/src/hooks/use-queries.ts`
- Query keys follow pattern: `[role, resource]` (e.g., `["teacher", "courses"]`)
- Mock data in `apps/web/src/api/mock-data.ts`

### Styling
- TailwindCSS v4 with `@import "tailwindcss"` syntax
- Design tokens defined in `packages/ui/src/globals.css` using `@theme`
- No separate CSS modules - all styling via Tailwind utility classes
- Responsive: mobile-first, use `md:`, `lg:` breakpoints

### Roles
- **Teacher (EduManager)**: Dashboard, Calendar, Courses, Students, Reports, Feedback Editor
- **Student (EduPortal)**: Schedule, Gradebook, Assignments, Resources, Feedback Detail
