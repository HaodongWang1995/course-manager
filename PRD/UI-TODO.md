# UI TODO — Figma vs 系统对比

> 生成时间：2026-02-19
> 最后更新：2026-02-20
> Figma 文件：[Course Manager](https://www.figma.com/design/kiN4DAQTZVR7zcJu9pP67a/Course-Manager)
> 对比范围：全部页面（Login、Teacher 6 页、Student 5 页）

---

## 状态说明

- ✅ **Done** — 已实现，与 Figma 设计对齐
- ⚠️ **Partial** — 部分实现或有细微差距（可接受）

---

## 1. Login 登录页

**Figma node:** `4:950`
**路由:** `/login`

| # | 优先级 | 差异描述 | 状态 |
|---|--------|----------|------|
| 1.1 | 🟡 | Figma 顶部有装饰性插图（笔记本/书桌场景图） | ✅ 已添加 hero 图片区块（Unsplash 图） |
| 1.2 | 🟡 | Figma 角色选择器 "I am a…"，卡片带图标，选中态蓝色边框 | ✅ 实现完整：label、GraduationCap/BookOpen 图标、border-[#137FEC] 选中态 |
| 1.3 | 🟢 | Email 输入框 Mail 图标，Password Lock 图标 | ✅ 已实现（Mail、Lock lucide 图标） |

---

## 2. Teacher Dashboard 教师仪表盘

**Figma node:** `4:1554`
**路由:** `/teacher`

| # | 优先级 | 差异描述 | 状态 |
|---|--------|----------|------|
| 2.1 | 🟡 | Figma Header 右侧 "Fall Semester 2023" 学期下拉选择器 | ✅ 已实现带下拉菜单的学期选择器 |
| 2.2 | 🟡 | Figma 今日课程每行课程类型角标（Lecture / Lab / Admin） | ✅ `getCourseType()` 函数 + typeStyles badge |
| 2.3 | 🟡 | Figma 今日课程每行显示学生人数（如 "42 Students"） | ✅ `item.students` + Users 图标 |
| 2.4 | 🟢 | Figma Upcoming Deadlines 左侧彩色竖条（红/黄/蓝） | ✅ `border-l-4 border-l-red-500/amber/blue` |
| 2.5 | 🟢 | Figma 小日历可点击跳转 | ✅ 每天点击 navigate to `/teacher/calendar` |

---

## 3. Teacher Calendar 教师日历

**Figma node:** `4:2271`
**路由:** `/teacher/calendar`

| # | 优先级 | 差异描述 | 状态 |
|---|--------|----------|------|
| 3.1 | 🔴 | Figma 有 **Month（月视图）** | ✅ `MonthView` 组件实现，默认视图为 Month |
| 3.2 | 🟡 | Figma 周视图为 **Sun–Sat 7 天** | ✅ `weekDays = Array.from({ length: 7 }, ...)` Sun–Sat |
| 3.3 | 🟡 | Figma 右侧边栏 **Upcoming Events** 列表 | ✅ 右侧 Upcoming Events 卡片，含日期/时间 |
| 3.4 | 🟡 | Figma Deadlines 彩色左边框（红/黄/蓝） | ✅ `deadlineColors` 数组 `border-l-4` 样式 |
| 3.5 | 🟢 | Figma 底部 "Quick Add Task" CTA | ✅ 右侧边栏 Quick Add Task 虚线卡片 |

---

## 4. Teacher Courses 课程管理

**Figma node:** `4:2675`
**路由:** `/teacher/courses`

| # | 优先级 | 差异描述 | 状态 |
|---|--------|----------|------|
| 4.1 | 🔴 | Figma 课程卡片有**彩色渐变封面图 + 学科代码角标** | ✅ `coverGradients` + `getCourseCode()` + badge |
| 4.2 | 🔴 | Figma 每张课程卡显示 **Course Progress 进度条** | ✅ `<Progress value={progress} />` |
| 4.3 | 🟡 | Figma 展示 Section 信息（如 "Section A • Mon, Wed"） | ✅ Section + 星期显示 |
| 4.4 | 🟡 | Figma 卡片展示学生人数 + 课时数 | ✅ `enrollmentCount Students` + `lessonCount Lessons` |
| 4.5 | 🟡 | Figma 网格末尾 **"Create New Course" 占位卡片** | ✅ 虚线占位卡片 |
| 4.6 | 🟡 | Figma 搜索旁有 **Filter 按钮** | ✅ `DropdownMenu` Filter 按钮 |

---

## 5. Teacher Students 学生目录

**Figma node:** `4:3102`
**路由:** `/teacher/students`

| # | 优先级 | 差异描述 | 状态 |
|---|--------|----------|------|
| 5.1 | 🟢 | Figma 左侧面板 "Avg. Attendance" 大号蓝色数字 | ✅ 实现，显示平均出勤率 |
| 5.2 | 🟢 | Figma 表格行选择 Checkbox | ✅ `selectedIds` state + checkbox 实现 |

---

## 6. Teacher Reports 报表分析

**Figma node:** `4:3488`
**路由:** `/teacher/reports`

| # | 优先级 | 差异描述 | 状态 |
|---|--------|----------|------|
| 6.1 | 🟡 | Figma KPI：Average Grade、Active Students、Submission Rate、Feedback Pending | ✅ 4 个 KPI 与 Figma 一致 |
| 6.2 | 🟡 | Figma Feedback Completion 大号百分比圆形（75% COMPLETED） | ✅ 圆形边框 + 75% 大数字 + COMPLETED 文字 |
| 6.3 | 🟢 | Figma Average Performance 柱状图（按学科） | ✅ BarChart 按课程展示 |

---

## 7. Teacher Feedback Editor 课后反馈编辑

**Figma node:** `4:680`
**路由:** `/teacher/feedback/:courseId`

| # | 优先级 | 差异描述 | 状态 |
|---|--------|----------|------|
| 7.1 | 🟡 | Figma Header "Draft Saved" 自动保存状态提示 | ✅ `saveStatus` + CheckCircle2 + 时间戳 |
| 7.2 | 🟢 | Figma Course Requirements 可折叠区块 | ✅ `<Collapsible>` + `requirementsOpen` state |

---

## 8. Student Dashboard / Schedule 学生课表

**Figma node:** `4:1927`（PC）、`4:251`（Mobile）
**路由:** `/student`

| # | 优先级 | 差异描述 | 状态 |
|---|--------|----------|------|
| 8.1 | 🔴 | Figma（PC版）为**周视图日历课表**（带时间轴） | ✅ 完整周视图网格，8AM–6PM 时间轴 |
| 8.2 | 🔴 | Figma 点击课程右侧弹出**课程详情面板** | ✅ `CourseDetailPanel` 含 Instructions/Feedback/Resources tabs |
| 8.3 | 🔴 | Figma（Mobile）按 Morning/Afternoon 分组，含快捷按钮 | ✅ `MobileScheduleView` + Requirements + Post Feedback 按钮 |
| 8.4 | 🟡 | Figma 学生 Sidebar 包含 Messages 入口 | ✅ `studentSidebarItems` 含 Messages → `/student/messages` |
| 8.5 | 🟡 | Figma 有 List View / Calendar View 切换 | ✅ List/Calendar 切换按钮 |

---

## 9. Student Feedback Detail 学生反馈详情

**Figma node:** `4:854`
**路由:** `/student/feedback/:courseId`

| # | 优先级 | 差异描述 | 状态 |
|---|--------|----------|------|
| 9.1 | 🔴 | Figma 有 **RESOURCES 下载区** | ✅ `useCourseResources` + FileIcon + Download 按钮 |
| 9.2 | 🟡 | Figma 教师**头像 + 姓名 + 院系** | ✅ 蓝色首字母 Avatar + 姓名 + "Department" |
| 9.3 | 🟡 | Figma 完整日期时间区间 | ✅ 日期 + 时间格式化 |
| 9.4 | 🟡 | Figma 紧急 Due Date 红色文字 | ✅ `isUrgentDue()` → `text-red-500` |
| 9.5 | 🟢 | Figma "Message Teacher" 固定底部全宽蓝色按钮 | ✅ Mobile: `fixed bottom-0`，Desktop: `hidden lg:block` |

---

## 10. Student Assignments 作业中心

**Figma node:** `4:3701`
**路由:** `/student/assignments`

| # | 优先级 | 差异描述 | 状态 |
|---|--------|----------|------|
| 10.1 | 🟡 | Figma 顶部 **Priority 英雄卡片**（背景渐变、红色 Due 角标、Submit 按钮） | ✅ 渐变蓝紫英雄卡片 + AlertTriangle 红色角标 |
| 10.2 | 🟢 | Figma 每个作业卡左侧彩色竖条 | ✅ `courseColor` 竖条 |
| 10.3 | 🟢 | Figma 作业卡展示文件附件数量 | ✅ `filesAttached` + Paperclip 图标 |

---

## 11. Student Resources 资源库

**Figma node:** `4:3911`
**路由:** `/student/resources`

| # | 优先级 | 差异描述 | 状态 |
|---|--------|----------|------|
| 11.1 | 🟡 | Figma 页面标题为 **"Library"** | ✅ `<h1>Library</h1>` |
| 11.2 | 🟡 | Figma 有学科**分类 Tab** | ✅ CATEGORIES tabs（All/Math/Science/Literature/History） |
| 11.3 | 🟡 | Figma "Recent & Featured" 为**缩略图卡片** | ✅ 2×N 网格，彩色渐变封面 + 文件类型角标 |
| 11.4 | 🟢 | Figma 每个资源项展示**文件大小** | ✅ `resource.meta` 含大小信息 |

---

## 12. Student Grades 成绩册

**Figma node:** `4:4145`
**路由:** `/student/grades`

| # | 优先级 | 差异描述 | 状态 |
|---|--------|----------|------|
| 12.1 | 🟡 | Figma Performance Overview 为**雷达图/蜘蛛图** | ✅ `RadarChart` with You vs Avg |
| 12.2 | 🟢 | Figma 课程列表左侧**学科图标**（彩色圆形） | ✅ `courseIcons` 轮换彩色图标 |
| 12.3 | 🟢 | Figma "View Breakdown" 按钮 | ✅ 蓝色背景 "View Breakdown" + ChevronRight |

---

## 汇总统计

| 优先级 | 数量 | 状态 |
|--------|------|------|
| 🔴 HIGH | 7 项 | ✅ 全部完成 |
| 🟡 MEDIUM | 26 项 | ✅ 全部完成 |
| 🟢 LOW | 13 项 | ✅ 全部完成 |
| **总计** | **46 项** | **✅ 100% 完成** |
