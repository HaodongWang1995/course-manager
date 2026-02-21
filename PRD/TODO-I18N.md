# TODO: 全量 i18n 国际化（中/英双语）

> 创建时间：2026-02-21

---

## 现状分析

### 技术栈
- `react-i18next` + `i18next`
- 语言文件：`apps/web/src/locales/en.json` / `zh.json`
- 初始化：`apps/web/src/lib/i18n.ts`（默认语言 `zh`，通过 `localStorage.lang` 持久化）
- `setLanguage(lang)` 工具函数已存在

### 已覆盖的 namespace
| namespace | 覆盖内容 |
|-----------|---------|
| `nav` | 侧边栏导航（`dashboard` zh 翻译缺失 ⚠️） |
| `enrollments` | 学生选课页 |
| `settings` | 设置页（教师/学生共用） |
| `support` | 帮助页 |
| `upload` | 文件上传组件 |
| `attachments` | 附件列表组件 |
| `schedule` | 学生日程页 |
| `common` | 通用（loading、cancel 等） |

### 未覆盖的页面（全部硬编码文案）
绝大多数页面文案是硬编码的中文或英文，没有使用 `useTranslation()`。

---

## 实施方案

### 原则
1. **key 命名规范**：`页面.区块.元素`，如 `courses.form.title`、`dashboard.kpi.students`
2. **复用 `common` namespace**：loading、cancel、confirm、empty state 等通用文案统一放 `common`
3. **zh 为主，en 为翻译**：先整理中文文案，再对应写英文
4. **不改组件逻辑**，只替换字符串字面量为 `t("key")`

### 修复顺序（优先级）
1. **P0** — 修复现有 namespace 的缺失/错误（`nav.dashboard`）
2. **P1** — 登录/注册页（最高曝光率）
3. **P1** — 教师核心流程：Dashboard、Courses、Course Detail
4. **P1** — 学生核心流程：Course Browse、Course Detail、Enrollments
5. **P2** — 教师：Calendar、Students、Enrollments、Reports
6. **P2** — 学生：Grades、Assignments、Resources
7. **P3** — 教师：Feedback Editor

---

## 任务清单

### Phase 0 — 修复现有缺失

#### P0-01：`nav.dashboard` 中文翻译缺失
- **文件**：`locales/zh.json`
- **现状**：`"dashboard": "Dashboard"`（英文）
- **修复**：`"dashboard": "仪表盘"` 或 `"dashboard": "首页"`（与设计确认）
- [ ] 修复

---

### Phase 1 — 登录/注册页

**新增 namespace: `auth`**

```json
// en.json
"auth": {
  "welcomeTitle": "Welcome Back",
  "welcomeSubtitle": "Manage your schedule and feedback with ease.",
  "iAmA": "I am a...",
  "student": "Student",
  "teacher": "Teacher",
  "loginTab": "Login",
  "signUpTab": "Sign Up",
  "emailLabel": "Email Address",
  "emailPlaceholder": "name@example.com",
  "passwordLabel": "Password",
  "passwordPlaceholder": "Enter your password",
  "rememberMe": "Remember me",
  "forgotPassword": "Forgot Password?",
  "loginBtn": "Login",
  "loginBtnLoading": "Logging in...",
  "noAccount": "Don't have an account?",
  "fullNameLabel": "Full Name",
  "fullNamePlaceholder": "Your full name",
  "regPasswordPlaceholder": "At least 6 characters",
  "signUpBtn": "Sign Up",
  "signUpBtnLoading": "Registering...",
  "hasAccount": "Already have an account?",
  "loginFailed": "Login failed",
  "registerFailed": "Registration failed"
}
```

- **涉及文件**：
  - `pages/auth/login/components/mobile-login-layout.tsx`
  - `pages/auth/login/components/desktop-login-layout.tsx`
- [ ] 添加 `auth` namespace 到 en.json / zh.json
- [ ] mobile-login-layout.tsx 替换所有硬编码文案
- [ ] desktop-login-layout.tsx 替换所有硬编码文案

---

### Phase 2 — 教师核心页面

#### P1-01：教师 Dashboard

**新增 namespace: `dashboard`**

```json
"dashboard": {
  "title": "Dashboard",
  "greeting": {
    "morning": "Good morning, {{name}}!",
    "afternoon": "Good afternoon, {{name}}!",
    "evening": "Good evening, {{name}}!"
  },
  "classesToday": "You have {{count}} classes today and {{urgent}} urgent deadlines.",
  "todaySchedule": "Today's Schedule",
  "viewCalendar": "View Full Calendar →",
  "quickActions": "Quick Actions",
  "actions": {
    "assignment": "Assignment",
    "announcement": "Announcement",
    "message": "Message",
    "report": "Report"
  },
  "upcomingDeadlines": "Upcoming Deadlines",
  "viewAll": "View All",
  "noDeadlines": "No upcoming deadlines",
  "kpi": {
    "totalStudents": "Total Students",
    "totalCourses": "Total Courses",
    "totalLessons": "Total Lessons",
    "avgAttendance": "Avg Attendance"
  }
}
```

- **涉及文件**：`pages/teacher/dashboard/index.tsx` 及其子组件
- [ ] 添加到 locale 文件
- [ ] 替换硬编码文案

#### P1-02：教师 课程列表

**新增 namespace: `teacherCourses`**

```json
"teacherCourses": {
  "title": "Courses Management",
  "subtitle": "Manage your courses and curriculum",
  "createBtn": "Create New Course",
  "searchPlaceholder": "Search courses...",
  "filter": "Filter",
  "students": "{{count}} Students",
  "lessons": "{{count}} Lessons",
  "progress": "Course Progress",
  "createNew": "Create New Course",
  "createNewDesc": "Add a new subject to your curriculum",
  "form": {
    "title": "Course Name",
    "titlePlaceholder": "e.g. Advanced Mathematics",
    "description": "Description",
    "descPlaceholder": "Course description...",
    "category": "Category",
    "price": "Price (¥)",
    "section": "Section",
    "days": "Days",
    "createTitle": "Create New Course",
    "editTitle": "Edit Course",
    "cancel": "Cancel",
    "submit": "Create Course",
    "update": "Save Changes"
  },
  "status": {
    "active": "Active",
    "inactive": "Inactive",
    "draft": "Draft"
  }
}
```

- **涉及文件**：`pages/teacher/courses/index.tsx` 及子组件
- [ ] 添加到 locale 文件
- [ ] 替换硬编码文案

#### P1-03：教师 课程详情

**新增 namespace: `teacherCourseDetail`**

```json
"teacherCourseDetail": {
  "back": "Back to Courses",
  "edit": "Edit",
  "scheduleTitle": "Course Schedules ({{count}})",
  "addSchedule": "Add Schedule",
  "attachmentsTitle": "Course Attachments ({{count}})",
  "assignmentsTitle": "Assignments ({{count}})",
  "addAssignment": "Add Assignment",
  "resourcesTitle": "Course Resources ({{count}})",
  "addResource": "Add Resource",
  "noAssignments": "No assignments",
  "noResources": "No resources",
  "scheduleForm": {
    "title": "Add Schedule",
    "lessonTitle": "Lesson Title",
    "lessonTitlePlaceholder": "e.g. Chapter 1: Introduction",
    "startTime": "Start Time",
    "endTime": "End Time",
    "room": "Room (optional)",
    "submit": "Add Schedule"
  }
}
```

- **涉及文件**：`pages/teacher/course-detail/index.tsx` 及子组件
- [ ] 添加到 locale 文件
- [ ] 替换硬编码文案

---

### Phase 3 — 学生核心页面

#### P1-04：公开课程浏览

**新增 namespace: `publicCourses`**

```json
"publicCourses": {
  "title": "Browse Courses",
  "subtitle": "Browse {{count}} available courses",
  "searchPlaceholder": "Search courses...",
  "categories": {
    "all": "All",
    "math": "Math",
    "physics": "Physics",
    "chemistry": "Chemistry",
    "english": "English",
    "cs": "Computer Science",
    "other": "Other"
  },
  "free": "Free",
  "lessons": "{{count}} Lessons",
  "noResults": "No courses found",
  "noResultsDesc": "Try adjusting your search or filters"
}
```

- **涉及文件**：`pages/public/courses/index.tsx`
- [ ] 添加到 locale 文件
- [ ] 替换硬编码文案

#### P1-05：公开课程详情 / 学生申请

**新增 namespace: `publicCourseDetail`**

```json
"publicCourseDetail": {
  "back": "Back to Courses",
  "intro": "Course Overview",
  "schedules": "Course Schedule",
  "materials": "Course Materials",
  "apply": "Apply for Enrollment",
  "notePlaceholder": "Application note (optional)",
  "applying": "Applying...",
  "applied": "Application submitted, awaiting teacher review",
  "approved": "Enrolled",
  "rejected": "Application rejected",
  "notLoggedIn": "Login to apply",
  "loginBtn": "Go to Login",
  "notStudent": "Only students can apply"
}
```

- **涉及文件**：
  - `pages/public/course-detail/index.tsx`
  - `pages/public/course-detail/components/enrollment-cta.tsx`
- [ ] 添加到 locale 文件
- [ ] 替换硬编码文案

---

### Phase 4 — 教师次要页面

#### P2-01：教师 日历（Calendar）

**新增 namespace: `teacherCalendar`**

```json
"teacherCalendar": {
  "title": "Calendar",
  "newEvent": "New Event",
  "upcomingEvents": "Upcoming Events",
  "noEvents": "No upcoming events",
  "views": {
    "month": "Month",
    "week": "Week",
    "day": "Day"
  },
  "eventForm": {
    "title": "Event Title",
    "course": "Course",
    "startTime": "Start Time",
    "endTime": "End Time",
    "room": "Room",
    "create": "Create Event"
  }
}
```

- **涉及文件**：`pages/teacher/calendar/index.tsx` 及子组件
- [ ] 添加到 locale 文件
- [ ] 替换硬编码文案

#### P2-02：教师 学生列表（Students）

**新增 namespace: `teacherStudents`**

```json
"teacherStudents": {
  "title": "Students",
  "subtitle": "All enrolled students",
  "shown": "{{count}} students shown",
  "exportCsv": "Export CSV",
  "printList": "Print List",
  "selected": "{{count}} selected",
  "columns": {
    "name": "Student Name",
    "id": "ID Number",
    "courses": "Enrolled Courses",
    "attendance": "Attendance Rate",
    "actions": "Actions"
  },
  "viewProfile": "View Profile",
  "noData": "No student data yet",
  "noMatch": "No matching students",
  "sort": {
    "nameAsc": "Sort by: Name (A-Z)",
    "nameDesc": "Sort by: Name (Z-A)",
    "attendanceHigh": "Sort by: Attendance (High)",
    "attendanceLow": "Sort by: Attendance (Low)",
    "id": "Sort by: Student ID"
  }
}
```

- **涉及文件**：`pages/teacher/students/index.tsx` 及子组件
- [ ] 添加到 locale 文件
- [ ] 替换硬编码文案

#### P2-03：教师 选课管理（Enrollments）

**新增 namespace: `teacherEnrollments`**

```json
"teacherEnrollments": {
  "title": "Enrollment Management",
  "subtitle": "Review and manage student enrollment applications",
  "noApplications": "No enrollment applications",
  "noApplicationsDesc": "No enrollment applications for this course",
  "approve": "Approve",
  "reject": "Reject",
  "rejectReason": "Reason (optional)",
  "applied": "Applied: {{date}}"
}
```

- **涉及文件**：`pages/teacher/enrollments/index.tsx` 及子组件
- [ ] 添加到 locale 文件
- [ ] 替换硬编码文案

#### P2-04：教师 报告（Reports）

**新增 namespace: `teacherReports`**

```json
"teacherReports": {
  "title": "Reports & Analytics",
  "subtitle": "Track course performance and student engagement",
  "kpi": {
    "totalStudents": "Total Students",
    "totalCourses": "Active Courses",
    "scheduledLessons": "Scheduled Lessons",
    "avgAttendance": "Avg Attendance"
  },
  "charts": {
    "attendance": "Attendance Trend",
    "enrollment": "Enrollment Overview",
    "performance": "Performance Distribution",
    "engagement": "Student Engagement"
  },
  "comingSoon": "Chart coming soon",
  "export": "Export Report"
}
```

- **涉及文件**：`pages/teacher/reports/index.tsx` 及子组件
- [ ] 添加到 locale 文件
- [ ] 替换硬编码文案

---

### Phase 5 — 学生次要页面

#### P2-05：学生 成绩（Grades）

**新增 namespace: `studentGrades`**

```json
"studentGrades": {
  "title": "Gradebook",
  "showing": "Showing:",
  "kpi": {
    "gpa": "GPA",
    "rank": "Class Rank",
    "completion": "Completion"
  },
  "performanceOverview": "Performance Overview",
  "vsAverage": "Vs. Class Average",
  "you": "You",
  "avg": "Avg",
  "courses": "Courses",
  "coursesCount": "{{count}} courses",
  "teacher": "Teacher: {{name}}",
  "overall": "Overall",
  "midterm": "Midterm",
  "final": "Final",
  "viewBreakdown": "View Breakdown"
}
```

- **涉及文件**：`pages/student/grades/index.tsx`
- [ ] 添加到 locale 文件
- [ ] 替换硬编码文案

#### P2-06：学生 作业（Assignments）

**新增 namespace: `studentAssignments`**

```json
"studentAssignments": {
  "title": "Assignment Center",
  "subtitle": "Track and submit your assignments",
  "filter": {
    "all": "All",
    "pending": "Pending",
    "submitted": "Submitted",
    "graded": "Graded",
    "overdue": "Overdue"
  },
  "urgentTitle": "Due Soon",
  "urgentDesc": "This assignment is due soon",
  "submitBtn": "Submit Assignment",
  "viewDetails": "View Details",
  "dueDate": "Due: {{date}}",
  "course": "Course: {{name}}",
  "noAssignments": "No assignments",
  "noAssignmentsDesc": "Assignments will appear here once your teacher posts them"
}
```

- **涉及文件**：`pages/student/assignments/index.tsx`
- [ ] 添加到 locale 文件
- [ ] 替换硬编码文案

#### P2-07：学生 资源（Resources）

**新增 namespace: `studentResources`**

```json
"studentResources": {
  "title": "Resource Library",
  "subtitle": "Access your course materials",
  "searchPlaceholder": "Search resources...",
  "filter": {
    "all": "All",
    "pdf": "PDF",
    "video": "Video",
    "doc": "Document",
    "other": "Other"
  },
  "download": "Download",
  "fileSize": "{{size}}",
  "course": "{{name}}",
  "noResources": "No resources",
  "noResourcesDesc": "Your teachers haven't shared any resources yet"
}
```

- **涉及文件**：`pages/student/resources/index.tsx`
- [ ] 添加到 locale 文件
- [ ] 替换硬编码文案

#### P2-08：学生 课程详情（enrolled）

**新增 namespace: `studentCourseDetail`**

```json
"studentCourseDetail": {
  "back": "Back",
  "scheduleTitle": "Schedule",
  "attachmentsTitle": "Attachments",
  "noAttachments": "No attachments",
  "download": "Download",
  "teacher": "Teacher: {{name}}",
  "lessons": "{{count}} Lessons"
}
```

- **涉及文件**：`pages/student/course-detail/index.tsx` 及子组件
- [ ] 添加到 locale 文件
- [ ] 替换硬编码文案

---

### Phase 6 — 反馈编辑器（教师）

#### P3-01：教师 反馈编辑器

**新增 namespace: `teacherFeedback`**

```json
"teacherFeedback": {
  "draft": "Draft",
  "presentStudents": "Present Students",
  "presentCount": "{{count}} students marked present for this session",
  "addStudent": "Add",
  "requirements": "Course Requirements",
  "requirementsDesc": "Instructions and prerequisites for students before class",
  "requirementsPlaceholder": "Pre-class instructions for students",
  "postClass": "Post-Class Feedback",
  "postClassDesc": "Notes and feedback from today's session",
  "postClassPlaceholder": "Write your post-class feedback here...",
  "mention": "Mention",
  "materials": "Materials Shared",
  "materialsDesc": "Files and resources shared during this session",
  "attachFile": "Attach File or Link",
  "homework": "Homework",
  "homeworkDesc": "Assign homework for the next session",
  "homeworkTitle": "Assignment Title",
  "homeworkTitlePlaceholder": "e.g. Chapter 4 Problem Set",
  "dueDate": "Due Date",
  "saveDraft": "Save Draft",
  "savePublish": "Save and Publish"
}
```

- **涉及文件**：`pages/teacher/feedback/index.tsx` 及子组件
- [ ] 添加到 locale 文件
- [ ] 替换硬编码文案

---

### Phase 7 — 公共组件 & Landing Page

#### P3-02：Landing Page

**新增 namespace: `landing`**

```json
"landing": {
  "heroTitle": "...",
  "heroSubtitle": "...",
  "ctaTeacher": "I'm a Teacher",
  "ctaStudent": "I'm a Student",
  ...
}
```

- **涉及文件**：`pages/landing/index.tsx`（或 `routes/landing.tsx`）
- [ ] 检查并替换硬编码文案

#### P3-03：公共 UI 组件中的硬编码文案
- `packages/ui/src/components/sidebar.tsx` — "Support" 文字
- `packages/ui/src/components/bottom-nav.tsx` — 任何硬编码文案
- `apps/web/src/components/empty-state.tsx` — 检查 prop 默认值

---

## 验收标准

1. 切换语言（设置页 Language 下拉）后，**全站所有页面**文案即时切换（无需刷新）
2. `zh.json` 和 `en.json` 中的 key 完全对齐（无缺失 key）
3. 无硬编码中文或英文字符串出现在 JSX 中（`t("key")` 替代）
4. `nav.dashboard` 中文翻译修复（BUG-02 关联）

---

## 工作量估算

| 阶段 | 内容 | 文件数 |
|------|------|-------|
| Phase 0 | 修复 nav.dashboard | 1 |
| Phase 1 | 登录/注册 | 2 |
| Phase 2 | 教师核心（Dashboard + Courses + Detail） | 5+ |
| Phase 3 | 学生核心（Browse + Detail） | 3 |
| Phase 4 | 教师次要（Calendar/Students/Enrollments/Reports） | 6+ |
| Phase 5 | 学生次要（Grades/Assignments/Resources/CourseDetail） | 5+ |
| Phase 6 | 反馈编辑器 | 2 |
| Phase 7 | Landing + 公共组件 | 3 |

总计：~27 个文件，新增 ~11 个 namespace（约 250+ 条翻译 key）
