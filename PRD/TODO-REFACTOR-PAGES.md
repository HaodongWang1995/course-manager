# TODO: 路由 / 页面结构重构

> 创建时间：2026-02-21
> 目标：将所有页面逻辑从 `routes/` 文件中抽离，统一放入 `apps/web/src/pages/`，
> 每个页面一个文件夹，内部子组件放 `components/` 子目录。
> 路由文件只保留 `createFileRoute()` 声明 + 页面组件 import。

---

## 规则摘要

```
apps/web/src/
├── routes/                          ← 只放 createFileRoute() + import
│   └── (app)/teacher/calendar.tsx   ← 3~10 行，仅做接线
└── pages/                           ← 所有页面逻辑在此
    └── teacher/
        └── calendar/
            ├── index.tsx            ← CalendarPage（数据 hook、状态、布局）
            └── components/
                ├── calendar-grid.tsx
                ├── new-event-dialog.tsx
                └── upcoming-events-list.tsx
```

**不需要迁移的文件**（保持现状）：
- `routes/__root.tsx` — 根布局，已是纯 layout
- `routes/(app)/route.tsx` — app layout，已是纯 layout
- `routes/(app)/teacher/route.tsx` — teacher layout，已是纯 layout
- `routes/(app)/student/route.tsx` — student layout，已是纯 layout
- `routes/index.tsx` — 只做重定向
- `routes/(app)/student/schedule.tsx` — 仅重定向，无逻辑
- `routes/(app)/student/messages.tsx` — 仅占位，极简

---

## 迁移任务清单

优先级排序：文件行数越大 → 收益越大，优先迁移。

---

### 🔴 HIGH（> 500 行）

#### ✅ REFACTOR-01：teacher/courses.$courseId — 778 行（已完成）

**路由文件**（迁移后仅 ~5 行）：
```
routes/(app)/teacher/courses.$courseId.tsx
```

**目标结构**：
```
pages/teacher/course-detail/
├── index.tsx                    ← TeacherCourseDetailPage
│                                   (所有 hooks、状态、handleSave 等)
└── components/
    ├── course-info-card.tsx     ← 课程信息展示 + 编辑表单（title/desc/price/category）
    ├── schedule-section.tsx     ← 课时列表 + 删除按钮
    ├── add-schedule-dialog.tsx  ← AddScheduleDialog（含 TanStack Form）
    ├── attachment-section.tsx   ← FileUploadZone + AttachmentList
    ├── assignment-section.tsx   ← 作业列表 + 删除
    ├── add-assignment-dialog.tsx ← AddAssignmentDialog
    ├── resource-section.tsx     ← 资源列表 + 删除
    └── add-resource-dialog.tsx  ← AddResourceDialog
```

---

#### ✅ REFACTOR-02：student/index — 715 行（学生日程页）（已完成）

**路由文件**：
```
routes/(app)/student/index.tsx
```

**目标结构**：
```
pages/student/schedule/
├── index.tsx                    ← StudentSchedulePage（hooks、日期计算、viewMode 状态）
└── components/
    ├── calendar-grid.tsx        ← 桌面周历表格（小时行 × 5天列 + 事件块）
    ├── course-detail-panel.tsx  ← 右侧详情面板（含 Tabs: Instructions/Feedback/Resources）
    ├── list-schedule-view.tsx   ← 桌面列表视图
    └── mobile-schedule-view.tsx ← 手机当日课程（Morning/Afternoon 分组）
```

---

#### ✅ REFACTOR-03：login — 701 行（已完成）

**路由文件**：
```
routes/login.tsx
```

**目标结构**：
```
pages/auth/login/
├── index.tsx                    ← LoginPage（tab 切换 login/register、路由跳转逻辑）
└── components/
    ├── login-form.tsx           ← 登录 TanStack Form（email + password）
    └── register-form.tsx        ← 注册 TanStack Form（name + email + password + role）
```

---

#### ✅ REFACTOR-04：landing — 555 行（已完成）

**路由文件**：
```
routes/landing.tsx
```

**目标结构**：
```
pages/landing/
├── index.tsx                    ← LandingPage（组合各 section）
└── components/
    ├── hero-section.tsx         ← 顶部 Hero（标题、CTA 按钮）
    ├── features-section.tsx     ← 功能介绍网格
    ├── course-highlights.tsx    ← 课程卡片预览
    └── cta-section.tsx          ← 底部行动召唤区
```

---

#### REFACTOR-05：teacher/courses.index — 543 行（课程列表）

**路由文件**：
```
routes/(app)/teacher/courses.index.tsx
```

**目标结构**：
```
pages/teacher/courses/
├── index.tsx                    ← TeacherCoursesPage（search/filter 状态、hooks）
└── components/
    ├── course-card.tsx          ← 单课程卡片（状态徽章、操作按钮）
    ├── course-filters.tsx       ← 搜索框 + 状态/分类筛选
    └── create-course-dialog.tsx ← CreateCourseDialog（含 TanStack Form）
```

---

#### REFACTOR-06：teacher/students — 534 行

**路由文件**：
```
routes/(app)/teacher/students.tsx
```

**目标结构**：
```
pages/teacher/students/
├── index.tsx                    ← StudentsPage（hooks、搜索状态、分页）
└── components/
    ├── student-table.tsx        ← 学生列表表格（桌面）
    ├── student-card.tsx         ← 学生卡片（移动端）
    └── student-filters.tsx      ← 搜索 + 课程筛选
```

---

### 🟡 MEDIUM（200–500 行）

#### REFACTOR-07：teacher/feedback.$courseId — 438 行

```
pages/teacher/feedback/
├── index.tsx                    ← FeedbackEditorPage
└── components/
    ├── requirements-section.tsx ← 课程要求区块 + TanStack Form
    ├── feedback-section.tsx     ← 课后反馈区块
    └── homework-section.tsx     ← 作业区块
```

---

#### REFACTOR-08：courses.$courseId（公开详情）— 357 行

```
pages/public/course-detail/
├── index.tsx                    ← PublicCourseDetailPage
└── components/
    ├── course-header.tsx        ← 标题、价格、教师信息
    ├── schedule-list.tsx        ← 课时表
    └── enrollment-cta.tsx       ← 报名 / 查看状态 按钮区
```

---

#### REFACTOR-09：student/feedback.$courseId — 318 行

```
pages/student/feedback/
├── index.tsx                    ← StudentFeedbackPage
└── components/
    ├── feedback-form.tsx        ← 提交反馈表单（TanStack Form）
    └── feedback-display.tsx     ← 已有反馈展示
```

---

#### REFACTOR-10：teacher/settings — 269 行
#### REFACTOR-11：student/settings — 269 行

```
pages/teacher/settings/
├── index.tsx                    ← TeacherSettingsPage
└── components/
    ├── profile-form.tsx         ← 名称修改（TanStack Form）
    ├── password-form.tsx        ← 密码修改（TanStack Form）
    ├── notification-section.tsx ← 通知开关（静态 UI）
    └── appearance-section.tsx   ← 语言 / 主题切换

pages/student/settings/         ← 相同结构，复用 components 或分别创建
```

---

#### REFACTOR-12：student/assignments — 279 行

```
pages/student/assignments/
├── index.tsx                    ← StudentAssignmentsPage
└── components/
    ├── assignment-card.tsx      ← 单作业卡片（状态徽章、截止时间、提交按钮）
    └── assignment-filters.tsx   ← 搜索 + 状态筛选（All/Pending/Submitted/Late）
```

---

#### REFACTOR-13：student/courses.$courseId — 275 行

```
pages/student/course-detail/
├── index.tsx                    ← StudentCourseDetailPage
└── components/
    ├── course-header.tsx        ← 标题、教师、状态
    ├── schedule-section.tsx     ← 课时列表
    ├── enrollment-section.tsx   ← 报名 / 取消报名操作
    └── attachment-section.tsx   ← 附件下载列表
```

---

#### REFACTOR-14：teacher/enrollments — 223 行

```
pages/teacher/enrollments/
├── index.tsx                    ← TeacherEnrollmentsPage（hooks、审核逻辑）
└── components/
    ├── enrollment-card.tsx      ← 单申请卡（学生信息 + 通过/拒绝）
    └── status-filter.tsx        ← All/Pending/Approved/Rejected 筛选
```

---

#### REFACTOR-15：student/resources — 218 行

```
pages/student/resources/
├── index.tsx                    ← StudentResourcesPage
└── components/
    ├── featured-grid.tsx        ← Recent & Featured 卡片网格
    ├── resource-list.tsx        ← All Resources 列表
    └── category-filter.tsx      ← All/Math/Science 等分类 tab
```

---

#### REFACTOR-16：student/grades — 210 行

```
pages/student/grades/
├── index.tsx                    ← StudentGradesPage
└── components/
    ├── kpi-row.tsx              ← GPA / Rank / Completion 三格 KPI
    ├── course-grade-card.tsx    ← 单课程成绩卡（overall + midterm + final）
    └── radar-chart-section.tsx  ← Recharts RadarChart
```

---

### 🟢 LOW（< 200 行）

#### REFACTOR-17：teacher/support — 172 行
#### REFACTOR-18：student/support — 169 行

```
pages/teacher/support/
├── index.tsx                    ← TeacherSupportPage
└── components/
    ├── faq-section.tsx          ← FAQ 折叠列表
    └── contact-form.tsx         ← 联系表单（TanStack Form）

pages/student/support/          ← 相同结构
```

---

#### REFACTOR-19：student/enrollments — 169 行

```
pages/student/enrollments/
├── index.tsx                    ← StudentEnrollmentsPage
└── components/
    ├── enrollment-card.tsx      ← 单申请卡（状态徽章、取消按钮）
    └── status-filter.tsx        ← 状态筛选 tabs
```

---

#### REFACTOR-20：teacher/reports — 143 行

```
pages/teacher/reports/
├── index.tsx                    ← TeacherReportsPage
└── components/
    ├── kpi-section.tsx          ← KPI 统计卡片
    └── chart-placeholder.tsx    ← 图表占位区
```

---

#### ✅ REFACTOR-21：teacher/calendar — 712 行（已完成）

```
pages/teacher/calendar/
├── index.tsx                    ← TeacherCalendarPage（week state、schedule hooks）
└── components/
    ├── calendar-grid.tsx        ← 周历网格（含事件块渲染）
    ├── event-block.tsx          ← 单个课时块（颜色、点击展开）
    ├── new-event-dialog.tsx     ← NewEventDialog（TanStack Form）
    └── upcoming-list.tsx        ← 即将到来的课时列表（右侧面板）
```

---

#### REFACTOR-22：teacher/index（Dashboard）— 361 行

```
pages/teacher/dashboard/
├── index.tsx                    ← TeacherDashboardPage
└── components/
    ├── welcome-header.tsx       ← 问候语 + 日期
    ├── kpi-cards.tsx            ← 4 个 KPI 卡片（课程数、学生数等）
    ├── course-progress-list.tsx ← 课程完成进度列表
    └── deadline-list.tsx        ← 截止任务列表
```

---

#### REFACTOR-23：courses.tsx（公开课程列表）— 138 行

```
pages/public/courses/
├── index.tsx                    ← PublicCoursesPage
└── components/
    ├── course-card.tsx          ← 公开课程卡片
    └── search-filters.tsx       ← 搜索 + 分类筛选
```

---

## 最终目录结构（完成后）

```
apps/web/src/
├── routes/
│   ├── __root.tsx               ← 保持不变（根 layout）
│   ├── index.tsx                ← 保持不变（重定向）
│   ├── landing.tsx              ← 仅: createFileRoute + import LandingPage
│   ├── login.tsx                ← 仅: createFileRoute + import LoginPage
│   ├── courses.tsx              ← 仅: createFileRoute + import PublicCoursesPage
│   ├── courses.$courseId.tsx    ← 仅: createFileRoute + import PublicCourseDetailPage
│   └── (app)/
│       ├── route.tsx            ← 保持不变（app layout）
│       ├── teacher/
│       │   ├── route.tsx        ← 保持不变（teacher layout）
│       │   ├── index.tsx        ← 仅: createFileRoute + import TeacherDashboardPage
│       │   ├── calendar.tsx     ← 仅: createFileRoute + import TeacherCalendarPage
│       │   ├── courses.tsx      ← 仅: createFileRoute（courses layout）
│       │   ├── courses.index.tsx← 仅: createFileRoute + import TeacherCoursesPage
│       │   ├── courses.$courseId.tsx ← 仅: createFileRoute + import TeacherCourseDetailPage
│       │   ├── enrollments.tsx  ← 仅: createFileRoute + import TeacherEnrollmentsPage
│       │   ├── students.tsx     ← 仅: createFileRoute + import StudentsPage
│       │   ├── reports.tsx      ← 仅: createFileRoute + import ReportsPage
│       │   ├── feedback.$courseId.tsx ← 仅: createFileRoute + import FeedbackEditorPage
│       │   ├── settings.tsx     ← 仅: createFileRoute + import TeacherSettingsPage
│       │   └── support.tsx      ← 仅: createFileRoute + import TeacherSupportPage
│       └── student/
│           ├── route.tsx        ← 保持不变（student layout）
│           ├── index.tsx        ← 仅: createFileRoute + import StudentSchedulePage
│           ├── courses.$courseId.tsx ← 仅: createFileRoute + import StudentCourseDetailPage
│           ├── enrollments.tsx  ← 仅: createFileRoute + import StudentEnrollmentsPage
│           ├── grades.tsx       ← 仅: createFileRoute + import GradesPage
│           ├── assignments.tsx  ← 仅: createFileRoute + import AssignmentsPage
│           ├── resources.tsx    ← 仅: createFileRoute + import ResourcesPage
│           ├── feedback.$courseId.tsx ← 仅: createFileRoute + import StudentFeedbackPage
│           ├── settings.tsx     ← 仅: createFileRoute + import StudentSettingsPage
│           ├── support.tsx      ← 仅: createFileRoute + import StudentSupportPage
│           ├── messages.tsx     ← 保持不变（极简占位）
│           └── schedule.tsx     ← 保持不变（重定向）
└── pages/
    ├── auth/
    │   └── login/
    │       ├── index.tsx
    │       └── components/
    │           ├── login-form.tsx
    │           └── register-form.tsx
    ├── landing/
    │   ├── index.tsx
    │   └── components/
    │       ├── hero-section.tsx
    │       ├── features-section.tsx
    │       ├── course-highlights.tsx
    │       └── cta-section.tsx
    ├── public/
    │   ├── courses/
    │   │   ├── index.tsx
    │   │   └── components/
    │   │       ├── course-card.tsx
    │   │       └── search-filters.tsx
    │   └── course-detail/
    │       ├── index.tsx
    │       └── components/
    │           ├── course-header.tsx
    │           ├── schedule-list.tsx
    │           └── enrollment-cta.tsx
    ├── teacher/
    │   ├── dashboard/
    │   │   ├── index.tsx
    │   │   └── components/
    │   │       ├── welcome-header.tsx
    │   │       ├── kpi-cards.tsx
    │   │       ├── course-progress-list.tsx
    │   │       └── deadline-list.tsx
    │   ├── calendar/
    │   │   ├── index.tsx
    │   │   └── components/
    │   │       ├── calendar-grid.tsx
    │   │       ├── event-block.tsx
    │   │       ├── new-event-dialog.tsx
    │   │       └── upcoming-list.tsx
    │   ├── courses/
    │   │   ├── index.tsx
    │   │   └── components/
    │   │       ├── course-card.tsx
    │   │       ├── course-filters.tsx
    │   │       └── create-course-dialog.tsx
    │   ├── course-detail/
    │   │   ├── index.tsx
    │   │   └── components/
    │   │       ├── course-info-card.tsx
    │   │       ├── schedule-section.tsx
    │   │       ├── add-schedule-dialog.tsx
    │   │       ├── attachment-section.tsx
    │   │       ├── assignment-section.tsx
    │   │       ├── add-assignment-dialog.tsx
    │   │       ├── resource-section.tsx
    │   │       └── add-resource-dialog.tsx
    │   ├── enrollments/
    │   │   ├── index.tsx
    │   │   └── components/
    │   │       ├── enrollment-card.tsx
    │   │       └── status-filter.tsx
    │   ├── students/
    │   │   ├── index.tsx
    │   │   └── components/
    │   │       ├── student-table.tsx
    │   │       ├── student-card.tsx
    │   │       └── student-filters.tsx
    │   ├── reports/
    │   │   ├── index.tsx
    │   │   └── components/
    │   │       ├── kpi-section.tsx
    │   │       └── chart-placeholder.tsx
    │   ├── feedback/
    │   │   ├── index.tsx
    │   │   └── components/
    │   │       ├── requirements-section.tsx
    │   │       ├── feedback-section.tsx
    │   │       └── homework-section.tsx
    │   ├── settings/
    │   │   ├── index.tsx
    │   │   └── components/
    │   │       ├── profile-form.tsx
    │   │       ├── password-form.tsx
    │   │       ├── notification-section.tsx
    │   │       └── appearance-section.tsx
    │   └── support/
    │       ├── index.tsx
    │       └── components/
    │           ├── faq-section.tsx
    │           └── contact-form.tsx
    └── student/
        ├── schedule/
        │   ├── index.tsx
        │   └── components/
        │       ├── calendar-grid.tsx
        │       ├── course-detail-panel.tsx
        │       ├── list-schedule-view.tsx
        │       └── mobile-schedule-view.tsx
        ├── course-detail/
        │   ├── index.tsx
        │   └── components/
        │       ├── course-header.tsx
        │       ├── schedule-section.tsx
        │       ├── enrollment-section.tsx
        │       └── attachment-section.tsx
        ├── enrollments/
        │   ├── index.tsx
        │   └── components/
        │       ├── enrollment-card.tsx
        │       └── status-filter.tsx
        ├── grades/
        │   ├── index.tsx
        │   └── components/
        │       ├── kpi-row.tsx
        │       ├── course-grade-card.tsx
        │       └── radar-chart-section.tsx
        ├── assignments/
        │   ├── index.tsx
        │   └── components/
        │       ├── assignment-card.tsx
        │       └── assignment-filters.tsx
        ├── resources/
        │   ├── index.tsx
        │   └── components/
        │       ├── featured-grid.tsx
        │       ├── resource-list.tsx
        │       └── category-filter.tsx
        ├── feedback/
        │   ├── index.tsx
        │   └── components/
        │       ├── feedback-form.tsx
        │       └── feedback-display.tsx
        ├── settings/
        │   ├── index.tsx
        │   └── components/
        │       ├── profile-form.tsx
        │       ├── password-form.tsx
        │       ├── notification-section.tsx
        │       └── appearance-section.tsx
        └── support/
            ├── index.tsx
            └── components/
                ├── faq-section.tsx
                └── contact-form.tsx
```

---

## 迁移注意事项

### TypeScript 路径别名
所有 `pages/` 内文件使用 `@/` 绝对路径（已配置）：
```ts
import { useStudentGrades } from "@/hooks/use-queries";
import { Button } from "@course-manager/ui";
```

### 子组件 props 规范
- 子组件 **不调用** API hooks，只接收 props
- 数据请求、mutations、状态管理集中在 page 的 `index.tsx`
- 例外：复杂独立 Dialog（如 AddScheduleDialog）可接收 `onAdd` callback + `isLoading`

### i18n
- 子组件可以调用 `useTranslation()`（hooks 调用不是 API 请求）
- 或由 page 传入翻译后的字符串 prop（对极简组件更清晰）

### 迁移步骤（每个页面）
1. 在 `pages/{role}/{page}/` 创建 `index.tsx`，将 route 文件全部内容移入
2. 识别可拆分的大型子组件（>80 行的函数组件），移到 `components/`
3. 子组件改为接收 props（去掉内部 hook 调用，由 page 传入）
4. 更新 route 文件为极简 3 行
5. 运行 `pnpm typecheck` 确认无错误
6. 运行 `pnpm test` 确认测试仍通过

### 不破坏现有功能
- 路由路径（URL）完全不变（只是组件位置移动）
- TanStack Router 的 `routeTree.gen.ts` 不受影响（只扫描 `routes/` 文件名）
- 所有 `Route.useParams()` 调用移到 page 的 `index.tsx` 中

---

## 进度跟踪

| ID | 页面 | 原文件行数 | 子组件数 | 状态 |
|----|------|----------|---------|------|
| REFACTOR-01 | teacher/course-detail | 778 | 8 | ❌ |
| REFACTOR-21 | teacher/calendar | 712 | 4 | ❌ |
| REFACTOR-02 | student/schedule | 715 | 4 | ❌ |
| REFACTOR-03 | auth/login | 701 | 2 | ❌ |
| REFACTOR-04 | landing | 555 | 4 | ❌ |
| REFACTOR-05 | teacher/courses | 543 | 3 | ❌ |
| REFACTOR-06 | teacher/students | 534 | 3 | ❌ |
| REFACTOR-22 | teacher/dashboard | 361 | 4 | ❌ |
| REFACTOR-08 | public/course-detail | 357 | 3 | ❌ |
| REFACTOR-07 | teacher/feedback | 438 | 3 | ❌ |
| REFACTOR-09 | student/feedback | 318 | 2 | ❌ |
| REFACTOR-10 | teacher/settings | 269 | 4 | ❌ |
| REFACTOR-11 | student/settings | 269 | 4 | ❌ |
| REFACTOR-12 | student/assignments | 279 | 2 | ❌ |
| REFACTOR-13 | student/course-detail | 275 | 4 | ❌ |
| REFACTOR-14 | teacher/enrollments | 223 | 2 | ❌ |
| REFACTOR-15 | student/resources | 218 | 3 | ❌ |
| REFACTOR-16 | student/grades | 210 | 3 | ❌ |
| REFACTOR-17 | teacher/support | 172 | 2 | ❌ |
| REFACTOR-18 | student/support | 169 | 2 | ❌ |
| REFACTOR-19 | student/enrollments | 169 | 2 | ❌ |
| REFACTOR-20 | teacher/reports | 143 | 2 | ❌ |
| REFACTOR-23 | public/courses | 138 | 2 | ❌ |
