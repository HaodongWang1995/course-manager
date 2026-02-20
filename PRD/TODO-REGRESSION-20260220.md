# 回归测试 TODO — 2026-02-20

> 通过 Playwright 对教师/学生两个账号全流程测试后发现的问题，及新增需求。

---

## 🐛 Bug（功能性问题）

### BUG-01：Settings 页显示硬编码 mock 数据
- **页面**：`/teacher/settings`（学生端同理）
- **现象**：Profile 区域显示 "Professor Smith" / "smith@edu.com"，与实际登录用户无关
- **影响**：Save Changes / Update Password 按钮未连接真实 API，修改无效
- **修复方向**：从 `/api/auth/me` 获取当前用户信息填充表单；Save Changes 调用 PUT `/api/auth/profile`；Update Password 调用 PUT `/api/auth/password`

### BUG-02：教师端查看学生列表为空（用户反馈同步）
- **页面**：`/teacher/students`
- **现象**：有学生提交了选课申请，但 Students 页面显示 0 条记录，且分页错误地显示 24 页
- **根本原因**：Students 页是完全的 mock 静态 UI，未连接 `/api/enrollments` 或学生查询 API
- **修复方向**：通过 `GET /api/enrollments?course_id=...` 或新增 `GET /api/students` 接口，展示真实选课学生列表；修复分页逻辑（0 条数据不应显示分页）

### BUG-03：课时时间显示时区不一致
- **页面**：`/teacher/courses/$courseId`（课程详情）vs `/teacher/calendar`
- **现象**：输入 09:00，课程详情页显示 17:00:00（多 8 小时），日历页显示 09:00 AM
- **根本原因**：PostgreSQL 返回的 ISO 时间字符串被浏览器视为 UTC，`toLocaleString("zh-CN")` 自动转换为本地时间（UTC+8），而日历组件用了不同的解析方式
- **修复方向**：统一时间存储策略（建议存储为带时区的 TIMESTAMPTZ，或前端存入时加上 +08:00 偏移）；所有页面统一用相同的时间格式化函数

### BUG-04：公开课程列表 `/courses/$courseId` 路由缺失
- **页面**：`/courses`（公开课程浏览页）
- **现象**：点击课程卡片后 URL 变为 `/courses/$courseId`，但页面无跳转，仍停留在列表页（路由未定义）
- **修复方向**：新增公开课程详情路由 `apps/web/src/routes/courses.$courseId.tsx`，或在点击时重定向至 `/student/courses/$courseId`（需登录）

### BUG-05：学生端 Dashboard 和 Schedule 导航项同时高亮
- **页面**：学生侧边栏
- **现象**：Dashboard 和 Schedule 两个菜单项都指向 `/student`，导致其中一个被选中时另一个也亮起（或两个都亮）
- **修复方向**：二选一 —— 删除多余的 Schedule 菜单项（当前 Dashboard 本身就是日程视图），或将 Schedule 单独拆分为一个路由 `/student/schedule`

### BUG-06：学生成绩页 `/student/grades` 使用了不同的布局组件
- **页面**：`/student/grades`
- **现象**：成绩页使用底部导航（Home / Grades / Schedule / Profile），与其他学生页面使用的侧边栏+顶栏布局完全不同；且底部导航中的 Schedule 指向 `/student/schedule`、Profile 指向 `/student/profile`（均不存在）
- **修复方向**：将成绩页纳入统一的学生 layout（`apps/web/src/routes/(app)/student/route.tsx`），移除独立的底部导航

---

## ⚠️ UI / 体验问题

### UI-01：学生端 app 内无法浏览可选课程
- **页面**：`/student/enrollments`
- **现象**：空状态文案"Browse courses and apply to get started"但无跳转按钮，学生无法从 app 内导航到 `/courses` 浏览课程
- **修复方向**：在空状态或页面顶部添加"浏览全部课程"按钮，跳转至 `/courses`

### UI-02：Messages 页为全 mock 静态数据
- **页面**：`/student/messages`
- **现象**：显示假老师（Prof. Zhang Wei）和假消息，无真实 API 支持
- **修复方向**：属于未实现功能，暂时隐藏侧边栏"Messages"菜单项，或替换为"即将推出"占位页

### UI-03：Reports 页为全 mock 静态数据
- **页面**：`/teacher/reports`
- **现象**：图表数据（Math 101 / Physics 202）和报告列表（Oct 2023）均为硬编码 mock，KPI 数值与真实数据无关
- **修复方向**：连接真实 API 数据，或隐藏虚假数字，仅展示结构占位

### UI-04：Dashboard 欢迎语硬编码 "Professor Smith"
- **页面**：`/teacher`（教师 Dashboard）
- **现象**：标题固定显示 "Good morning, Professor Smith!"，不使用当前登录用户的姓名
- **修复方向**：从 TanStack Query 的 `useCurrentUser()` 获取 `name` 字段，动态拼接问候语；问候语时段（morning/afternoon/evening）也应根据系统时间动态判断

### UI-05：Support 页为纯静态 UI
- **页面**：`/teacher/support`、`/student/support`
- **现象**：FAQ、Send Message 表单均无后端支持
- **修复方向**：可接受为展示页，但 Send Message 至少应有提交反馈或 toast 提示

---

## ✨ 新增需求

### FEAT-01：全站 i18n 多语言支持
- **需求**：所有界面文字通过 i18n 框架管理，不再硬编码英文或中文字符串
- **触发语言切换**：Settings 页已有语言选择器（English / 中文），需真正实现切换功能
- **当前问题**：
  - 大量页面文字混用英文/中文（导航栏英文、内容区中文，或全英文）
  - FileUploadZone "Drag & drop or click to upload" / "Max 50MB per file"、AttachmentList "No attachments yet" 等组件硬编码英文
  - 学生 index 页所有文字硬编码英文（"Weekly Schedule"、"List View"、"Morning"、"Afternoon" 等）
  - 选课状态筛选 "All/Pending/Approved/Rejected"、课程管理 "Courses Management" 等均为英文
- **技术方向**：
  - 推荐使用 `react-i18next` + `i18next`
  - 语言包放在 `apps/web/src/locales/zh.json` 和 `apps/web/src/locales/en.json`
  - `packages/ui` 内的组件文字通过 props 传入（`uploadText`、`emptyText` 等），由调用方负责传入 i18n 翻译后的字符串
  - Settings 页语言切换持久化到 `localStorage`，刷新后保持

### FEAT-02：教师端学生列表连接真实数据
- 同 BUG-02，单独作为功能需求跟踪
- 需要后端新增 `GET /api/teacher/students` 接口，返回所有向该教师课程申请选课的学生信息

---

## 📋 测试覆盖状态

| 功能 | 教师账号 | 学生账号 | 状态 |
|------|---------|---------|------|
| 注册/登录 | ✅ | ✅ | 正常 |
| Dashboard | ✅ | ✅ | 正常（内容有 mock 问题） |
| 创建/编辑课程 | ✅ | — | 正常 |
| 添加课时 | ✅ | — | 正常（时区 bug） |
| 上传附件 | ⚠️ stub 模式 | — | 功能存在，R2 未配置 |
| 查看附件 | ✅ | ✅ | 正常 |
| 课程日历 | ✅ | — | 正常 |
| 选课审核 | ✅（列表正确） | — | 正常 |
| 浏览/申请选课 | — | ✅ | 正常（入口隐蔽） |
| 查看选课状态 | — | ✅ | 正常 |
| 学生列表 | ❌ | — | 空数据 bug |
| 成绩页 | — | ❌ | 布局错误 + 全 mock |
| 消息页 | — | ❌ | 全 mock |
| Reports | ❌ | — | 全 mock |
| Settings | ❌ | ❌ | 硬编码 mock 用户 |
