# PRD: 课后学生个性化反馈功能

## TL;DR

在现有课程级反馈（Course Feedback）基础上，新增 **课后学生个性化反馈** 功能。老师在每节课结束后，可以针对每个学生撰写个性化的课堂表现反馈（如表现评价、学习建议、需改进的地方等）。学生登录后可以在自己的反馈页面看到老师针对自己的历次课后反馈记录。

---

## 背景

当前系统已有的反馈功能（`/api/feedback`）是 **课程级别** 的反馈，面向课程内所有学生统一发布，包含课堂总结、课前要求、行动项等。但教育场景中，老师往往需要对每个学生的课堂表现给出个性化的点评和建议，帮助学生了解自己的学习状态和改进方向。

目前系统缺少这种 **一对一的、按课时维度的** 学生反馈能力。

---

## 需求目标

- 老师在每节课（Schedule/Lesson）结束后，可以针对该课上的每个已选课学生撰写个性化反馈
- 反馈内容包括：课堂表现评分、文字评语、改进建议
- 老师可以保存草稿、稍后继续编辑、一键发布
- 学生登录后可以在专属页面查看所有老师给自己的课后反馈，按时间倒序排列
- 学生只能看到针对自己的反馈，不能看到其他学生的反馈
- 支持 PC 和 H5 响应式布局

---

## 用户故事

### 老师视角

1. **作为老师**，我想在每节课结束后，快速查看该课的学生名单，并逐个给出课堂反馈，以便学生了解自己的表现。
2. **作为老师**，我想对每个学生的课堂表现打分（如 A/B/C/D 或 1-5 星），并附上文字评语，让反馈更具体。
3. **作为老师**，我想保存反馈草稿，在不同时间继续编辑，不必一次写完所有学生的反馈。
4. **作为老师**，我想一键发布某节课的所有反馈，让学生统一收到通知。
5. **作为老师**，我想查看自己给某个学生的历史反馈记录，了解学生的成长趋势。

### 学生视角

1. **作为学生**，我想在登录后看到老师给我的最新课后反馈，了解自己的课堂表现。
2. **作为学生**，我想查看所有历史反馈，追踪自己的学习进步。
3. **作为学生**，我想按课程筛选反馈，查看某门课的所有反馈记录。
4. **作为学生**，我想看到评分和文字评语的详细内容。

---

## 功能需求

### 1. 数据模型

新增 `student_lesson_feedback` 表：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID (PK) | 反馈唯一标识 |
| schedule_id | UUID (FK → course_schedules) | 关联的课时 |
| course_id | UUID (FK → courses) | 关联的课程 |
| teacher_id | UUID (FK → users) | 撰写反馈的老师 |
| student_id | UUID (FK → users) | 被反馈的学生 |
| rating | INTEGER | 课堂表现评分（1-5） |
| comment | TEXT | 文字评语 |
| suggestion | TEXT | 改进建议 |
| status | VARCHAR | 状态：draft / published |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

约束：
- UNIQUE (schedule_id, student_id) — 每节课每个学生只有一条反馈
- teacher_id 必须是课程的授课老师
- student_id 必须是已选该课程的学生（enrollment status = approved）
- rating 为可选字段，允许 NULL（老师可以只写文字不打分）
- comment 和 suggestion 至少需要填写一个，或者填写 rating

业务规则：
- **课时结束判断**：当 course_schedules.end_time < NOW() 时，该课时视为已结束，老师方可撰写反馈
- **部分发布**：发布操作仅发布当前已有内容的反馈（status = draft 且 comment/suggestion/rating 至少有一个非空），未撰写的学生不受影响
- **已发布反馈修改**：已发布的反馈不可直接编辑。如需修正，老师可以「撤回」反馈（状态回到 draft），修改后重新发布
- **batch API 原子性**：批量保存采用逐条处理策略，单条失败不影响其他，返回每条的成功/失败状态

### 2. API 接口

#### 老师端

| Method | Path | 说明 |
|--------|------|------|
| GET | `/api/student-feedback/schedule/:scheduleId` | 获取某节课所有学生的反馈列表（含未写反馈的学生） |
| GET | `/api/student-feedback/student/:studentId/course/:courseId` | 获取某学生在某课程的所有历史反馈 |
| POST | `/api/student-feedback` | 创建/更新学生反馈（upsert by schedule_id + student_id） |
| POST | `/api/student-feedback/batch` | 批量保存某节课多个学生的反馈 |
| PATCH | `/api/student-feedback/schedule/:scheduleId/publish` | 一键发布某节课所有已填写的反馈 |
| PATCH | `/api/student-feedback/:id/revoke` | 撤回已发布的反馈（回到 draft 状态） |

#### 学生端

| Method | Path | 说明 |
|--------|------|------|
| GET | `/api/student-feedback/my` | 获取当前学生的所有反馈（支持 course_id 筛选，分页: page + limit，默认 limit=20） |
| GET | `/api/student-feedback/my/latest` | 获取最新一条反馈 |
| GET | `/api/student-feedback/my/course/:courseId` | 获取某课程的所有反馈 |

### 3. 老师端页面

#### 入口
- 在课程详情页的课时列表中，每节已结束的课时旁增加「写反馈」按钮
- 在老师侧边栏增加「学生反馈」导航项

#### 反馈编辑页 (`/teacher/student-feedback/:scheduleId`)
- 顶部显示课程名称、课时信息（第 N 课、日期时间）
- 学生列表，每个学生卡片包含：
  - 学生头像、姓名
  - 评分选择器（1-5 星）
  - 文字评语输入框
  - 改进建议输入框
  - 保存状态指示（草稿/已保存/已发布）
- 底部操作栏：
  - 「保存全部草稿」按钮
  - 「发布全部反馈」按钮（发布后学生可见）
- 支持自动保存草稿

#### 反馈历史页 (`/teacher/student-feedback/history/:studentId/:courseId`)
- 展示老师给某个学生在某门课的所有历史反馈
- 时间线形式展示
- 可从学生名单页跳转过来

### 4. 学生端页面

#### 入口
- 在学生侧边栏增加「课后反馈」导航项（注意与现有的 `/student/feedback/:courseId` 课程级反馈区分，该页面保持不变）
- 在学生 Dashboard 增加最新反馈提示卡片

#### 课后反馈页 (`/student/lesson-feedback`)
> 注意：路由使用 `/student/lesson-feedback` 而非 `/student/my-feedback`，避免与现有的 `/student/feedback/:courseId`（课程级反馈）混淆
- 顶部课程筛选器（下拉选择课程，默认显示全部）
- 反馈列表（时间倒序），每条反馈卡片包含：
  - 课程名称、课时信息（第 N 课、日期）
  - 老师姓名
  - 评分（星星可视化）
  - 文字评语
  - 改进建议
- 空状态提示：「暂无课后反馈」
- 支持分页加载

### 5. 权限控制

- 老师只能为自己教授的课程的学生写反馈
- 老师只能编辑未发布（draft）的反馈；已发布的需先撤回再编辑
- 学生只能查看自己的反馈，且只能看已发布的
- 未选课的学生不应出现在反馈名单中

### 6. 国际化

- 新增 i18n key namespace: `studentLessonFeedback`
- 覆盖中文（zh.json）和英文（en.json）

---

## 与现有反馈功能的关系

| 维度 | 现有 Course Feedback | 新增 Student Lesson Feedback |
|------|---------------------|------------------------------|
| 粒度 | 课程级别 | 课时 + 学生级别 |
| 对象 | 面向课程所有学生 | 针对单个学生 |
| 内容 | 课堂总结、课前要求、行动项 | 个性化评分、评语、改进建议 |
| 频率 | 每门课一条（最新覆盖） | 每节课每个学生一条 |
| 可见性 | 课程所有选课学生 | 仅本人可见 |

两个功能互不影响、共存使用。

---

## 非目标 (Non-Goals)

- 不支持学生对反馈的回复或互动
- 不支持反馈的导出或打印
- 不做反馈的数据分析和统计图表（后续迭代）
- 不做消息推送通知（后续迭代）
- 不支持反馈模板功能（后续迭代）

---

## 成功指标

- 老师在课后 24 小时内完成反馈填写率 >= 70%
- 学生查看反馈的打开率 >= 80%
- 每条反馈平均文字长度 >= 20 字
- 页面加载时延 <= 1.5 秒

---

## 技术考虑

- 数据库新增 migration 文件 `006_student_lesson_feedback.sql`
- 后端新增 route 文件 `apps/api/src/routes/student-feedback.ts`
- 前端新增页面组件遵循现有路由约定（file-based routing）
- 复用现有 UI 组件（Card, Button, Input, Select, Badge 等）
- Query hooks 添加到现有 `use-queries.ts`
- 查询 key 添加到现有 `query-keys.ts`
- 表单验证 schema 添加到现有 `schemas.ts`

---

## 里程碑

| 阶段 | 内容 | 预估 |
|------|------|------|
| Phase 1 | 数据库 + API 接口 + 单元测试 | - |
| Phase 2 | 老师端反馈编辑页 | - |
| Phase 3 | 学生端反馈查看页 | - |
| Phase 4 | i18n + 响应式适配 + E2E 测试 | - |
