# TODO: 回归测试 & 新需求（2026-02-21）

> 创建时间：2026-02-21
> 线上地址：http://100.23.242.232

---

## 测试覆盖情况

| 页面 | 状态 |
|------|------|
| 登录/注册页 | ✅ 已测 |
| 教师 Dashboard | ✅ 已测 |
| 教师 课程列表 | ✅ 已测 |
| 教师 课程详情 | ✅ 已测 |
| 教师 日历 | ✅ 已测 |
| 教师 学生列表 | ✅ 已测 |
| 教师 选课管理 | ✅ 已测 |
| 教师 报告 | ✅ 已测 |
| 教师 设置 | ✅ 已测 |
| 教师 帮助 | ✅ 已测 |
| 教师 课后反馈编辑器 | ✅ 已测 |
| 学生注册 + Dashboard | ✅ 已测 |
| 公开课程浏览 `/courses` | ✅ 已测 |
| 公开课程详情 `/courses/:id` | ✅ 已测（发现 BUG） |
| 学生 选课申请/我的课程 | ⚠️ 因 BUG-03 受阻 |

---

## BUG 列表

### BUG-01：注册表单校验错误过早触发 ❌
- **复现步骤**：进入登录页 → 切换到 Sign Up 标签 → 点击 Student 或 Teacher 角色按钮
- **现象**：三个校验错误（"请输入姓名"、"请输入邮箱"、"密码至少需要6位"）立即显示，用户尚未填写任何字段
- **原因**：TanStack Form 的 `touchAllFields` 被提前触发，或 validator mode 为 `onChange` 而非 `onBlur`/`onSubmit`
- **期望**：校验错误仅在提交时或字段失焦后显示
- **优先级**：P1（影响首次用户体验）

### BUG-02：侧边栏导航中英文混用 ❌
- **复现步骤**：登录教师账号，查看左侧导航栏
- **现象**："Dashboard" 显示为英文，其余导航项（日历、课程、学生、选课管理、报告、设置、帮助）显示为中文
- **原因**：`Dashboard` 的 i18n key 在 zh 翻译文件中未正确翻译（或 key 使用了英文 fallback）
- **期望**：所有导航项语言保持一致（根据系统语言设置显示）
- **优先级**：P2

### BUG-03：公开课程详情页无法渲染 ❌
- **复现步骤**：进入 `/courses`，点击任意课程卡片
- **现象**：URL 变为 `/courses/:id`，但页面仍显示课程列表，课程详情内容不可见
- **根本原因**：`routes/courses.tsx` 在 TanStack Router 中充当 `/courses/*` 的 layout 路由；`courses.$courseId.tsx` 是其子路由，内容渲染在 `<Outlet />` 中；但 `PublicCourseBrowsePage` 没有 `<Outlet />`，导致子路由内容被吞没
- **修复方案**：
  1. 将 `routes/courses.tsx` 改为纯 layout（只渲染 `<Outlet />`）
  2. 新建 `routes/courses.index.tsx` 渲染 `PublicCourseBrowsePage`
- **优先级**：P0（核心功能不可用）

### BUG-04：课程反馈编辑器显示硬编码 Mock 数据 ❌
- **复现步骤**：访问 `/teacher/feedback/:courseId`
- **现象**：课程名显示为 "Advanced Mathematics"（硬编码），日期为 "Oct 20, 2023"，出席学生为固定 5 人（Sarah、James 等），均为 mock 数据
- **期望**：根据实际 courseId 加载真实课程名、日期和学生数据
- **优先级**：P1

---

## 新功能需求

### FEAT-01：登录入口去除角色选择 🆕
- **需求**：登录流程不需要选择学生/老师，直接凭账号密码登录；系统根据账号的 `role` 字段自动跳转到对应 Dashboard
- **仅注册时**：注册时保留 Student/Teacher 选择
- **修改范围**：
  - `apps/web/src/pages/auth/login/index.tsx`（或 login 相关页面）
  - 登录表单：移除角色选择按钮，仅保留邮箱 + 密码输入 + Login 按钮
  - 注册表单：保留 Student/Teacher 选择
  - 登录成功后：读取 `user.role` 并跳转到 `/teacher` 或 `/student`
- **优先级**：P0（用户明确需求）

### FEAT-02：课程浏览页使用学生 Layout（带侧边栏）🆕
- **需求**：`/courses` 和 `/courses/:id` 页面在学生登录时应显示左侧导航菜单
- **现状**：公开课程浏览页是根级路由，不在 `(app)/student` layout 下，故没有侧边栏
- **修复方案**：将 `/courses` 和 `/courses/:id` 路由移入学生 layout（或为登录用户注入 layout wrapper）
- **优先级**：P1

---

## 其他观察（不阻断，待讨论）

- 部分页面标题/文案中英文混用（如 Enrollment Management 标题是英文，但页面其他部分是中文）
- Support 页面 FAQ 问题为英文，其余内容为中文
- Reports 页面图表区域为 placeholder（无真实数据可视化）
