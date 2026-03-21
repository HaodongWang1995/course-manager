# Design: 课后学生个性化反馈功能

> 对应 PRD: [PRD-student-feedback.md](./PRD-student-feedback.md)
>
> 本文档已根据 Codex 审核意见修订（2026-03-22）

---

## 1. 数据库设计

### Migration: `apps/api/sql/006_student_lesson_feedback.sql`

```sql
-- 课后学生个性化反馈表
-- 设计决策：仅存 schedule_id + student_id，course_id/teacher_id 通过 JOIN 推导
-- 避免冗余字段导致数据不一致
CREATE TABLE IF NOT EXISTS student_lesson_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES course_schedules(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  suggestion TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(schedule_id, student_id)
);

-- 检查约束：rating/comment/suggestion 至少有一个非空
-- 注意：空草稿通过 DELETE 实现，不存在全空记录
ALTER TABLE student_lesson_feedback ADD CONSTRAINT chk_feedback_content
  CHECK (rating IS NOT NULL OR comment IS NOT NULL OR suggestion IS NOT NULL);

-- 索引（根据实际查询模式优化）
-- 学生端核心查询：WHERE student_id = ? AND status = 'published'
CREATE INDEX IF NOT EXISTS idx_slf_student_status ON student_lesson_feedback(student_id, status);
-- 老师端查看某节课：WHERE schedule_id = ?
CREATE INDEX IF NOT EXISTS idx_slf_schedule ON student_lesson_feedback(schedule_id);
-- 老师端批量发布：WHERE schedule_id = ? AND status = 'draft'
-- (covered by idx_slf_schedule + filter)
```

### 关键设计决策

1. **去除冗余字段**：不再存储 `course_id` 和 `teacher_id`，通过 `schedule_id → course_schedules → courses` JOIN 获取，消除数据不一致风险
2. **空草稿 = 删除**：当老师清空所有字段时，直接 DELETE 该记录，避免约束冲突
3. **并发安全**：UPSERT 使用 `WHERE status = 'draft'` 条件，防止覆盖已发布记录

### 关键查询模式

| 场景 | 查询策略 |
|------|----------|
| 老师查看某节课所有学生反馈 | `idx_slf_schedule` + LEFT JOIN enrollments |
| 学生查看自己已发布反馈 | `idx_slf_student_status` (student_id, 'published') |
| 老师批量发布 | `idx_slf_schedule` + status filter |
| 老师查看学生历史 | `idx_slf_student_status` + schedule JOIN |

---

## 2. 后端 API 设计

### 新增文件: `apps/api/src/routes/student-feedback.ts`

### 注册路由: `apps/api/src/app.ts`

```typescript
import studentFeedbackRoutes from "./routes/student-feedback.js";
// ...
app.use("/api/student-feedback", studentFeedbackRoutes);
```

### 接口详细设计

#### 2.1 GET `/schedule/:scheduleId` — 获取某节课所有学生反馈

**权限**: authRequired, teacherOnly

**逻辑**:
1. 验证 schedule 存在，JOIN course_schedules → courses 获取 course_id
2. 验证当前 teacher 是该课程的授课老师
3. 查询该课程所有 approved 的 enrollment 学生
4. LEFT JOIN student_lesson_feedback 获取已有反馈
5. 返回完整学生列表（含已写和未写反馈的）

**响应**:
```typescript
{
  schedule: { id, lesson_number, title, start_time, end_time },
  course: { id, title },
  students: [
    {
      student_id: string,
      student_name: string,
      student_avatar: string | null,
      feedback: {
        id: string,
        rating: number | null,
        comment: string | null,
        suggestion: string | null,
        status: 'draft' | 'published',
        updated_at: string
      } | null  // null 表示未写
    }
  ]
}
```

#### 2.2 POST `/` — 创建/更新单条反馈

**权限**: authRequired, teacherOnly

**请求体**:
```typescript
{
  schedule_id: string,
  student_id: string,
  rating?: number | null,  // 1-5, optional
  comment?: string | null,
  suggestion?: string | null
}
```

**逻辑**:
1. 验证 schedule 存在，JOIN 获取 course_id
2. 验证 teacher 拥有该课程
3. 验证 schedule.end_time < NOW()（课时已结束）
4. 验证 student 已选该课程（enrollment approved）
5. **空内容检测**：如果 rating/comment/suggestion 全为空/null，则 DELETE 已有草稿记录，返回 `{ deleted: true }`
6. **并发安全 UPSERT**：
   ```sql
   INSERT INTO student_lesson_feedback (schedule_id, student_id, rating, comment, suggestion)
   VALUES ($1, $2, $3, $4, $5)
   ON CONFLICT (schedule_id, student_id)
   DO UPDATE SET rating = $3, comment = $4, suggestion = $5, updated_at = NOW()
   WHERE student_lesson_feedback.status = 'draft'
   RETURNING *
   ```
   如果 RETURNING 无结果且记录存在，说明该记录已发布，返回 409 Conflict
7. 返回完整反馈记录

#### 2.3 POST `/batch` — 批量保存反馈

**权限**: authRequired, teacherOnly

**请求体**:
```typescript
{
  schedule_id: string,
  feedbacks: [
    { student_id: string, rating?: number | null, comment?: string | null, suggestion?: string | null }
  ]
}
```

**逻辑**:
1. 验证 schedule、课程归属、课时已结束
2. **大小限制**：feedbacks 数组最大 50 条
3. 逐条处理（非事务，单条失败不影响其他）：
   - 空内容 → DELETE 草稿
   - 已发布 → 跳过，记录到 skipped
   - 正常 → UPSERT
4. 返回 `{ success: [...], skipped: [...], deleted: [...], errors: [...] }`

#### 2.4 PATCH `/schedule/:scheduleId/publish` — 一键发布

**权限**: authRequired, teacherOnly

**逻辑**:
1. 验证权限（schedule → course → teacher）
2. 单条 SQL 原子操作：
   ```sql
   UPDATE student_lesson_feedback SET status = 'published', updated_at = NOW()
   WHERE schedule_id = $1 AND status = 'draft'
   AND (rating IS NOT NULL OR comment IS NOT NULL OR suggestion IS NOT NULL)
   ```
3. 返回 `{ published_count: number }`

#### 2.5 PATCH `/:id/revoke` — 撤回反馈

**权限**: authRequired, teacherOnly

**逻辑**:
1. 查询反馈，JOIN schedule → course 验证当前老师拥有该课程
2. 验证 status = 'published'
3. `UPDATE ... SET status = 'draft', updated_at = NOW()`
4. 返回更新后的反馈

#### 2.6 GET `/my` — 学生获取自己的反馈

**权限**: authRequired（通过 req.user.userId 隔离数据）

**查询参数**: `?course_id=&page=1&limit=20`

**逻辑**:
1. 从 JWT 获取 student_id
2. **limit 上限**：最大 50，默认 20
3. 查询：
   ```sql
   SELECT f.*, cs.lesson_number, cs.title AS lesson_title, cs.start_time AS lesson_date,
          c.title AS course_title, u.name AS teacher_name
   FROM student_lesson_feedback f
   JOIN course_schedules cs ON cs.id = f.schedule_id
   JOIN courses c ON c.id = cs.course_id
   JOIN users u ON u.id = c.teacher_id
   WHERE f.student_id = $1 AND f.status = 'published'
   ```
4. 可选 course_id 筛选：`AND cs.course_id = $2`
5. ORDER BY cs.start_time DESC
6. 分页: OFFSET + LIMIT
7. 返回 `{ data: [...], total: number, page: number, limit: number }`

#### 2.7 GET `/my/latest` — 学生最近一条反馈

**权限**: authRequired

**逻辑**: 同 `/my` 但 LIMIT 1，无分页。返回单条记录或 null。

> 注意：此接口返回"最近一条已发布反馈"，不判断"是否为新"。前端文案使用"最近反馈"而非"新反馈"。

#### 2.8 GET `/my/course/:courseId` — 学生某课程反馈

**权限**: authRequired

**查询参数**: `?page=1&limit=20`

**逻辑**: 同 `/my` 但固定 course_id 筛选，支持分页

#### 2.9 GET `/student/:studentId/course/:courseId` — 老师查看学生历史

**权限**: authRequired, teacherOnly

**逻辑**:
1. 验证 teacher 拥有该课程
2. 查询该学生在该课程的所有反馈（含 draft）
3. JOIN course_schedules 获取课时信息
4. ORDER BY cs.start_time DESC

### 边界情况处理

| 场景 | 处理策略 |
|------|----------|
| 课后补报名的学生 | 补报名后出现在反馈名单中，历史已结束课时的反馈由老师自行决定是否补写 |
| 学生退课 | 退课后不再出现在新课时的反馈名单中，但已有反馈记录保留（学生仍可查看） |
| 老师变更 | 历史反馈记录不受影响（通过 schedule → course 关联），新老师可看到历史记录 |
| 撤回后学生可见性 | 撤回后 status 变为 draft，学生端查询只显示 published，立即不可见 |

---

## 3. 前端设计

### 3.1 新增类型定义

**文件**: `apps/web/src/api/client.ts`（在现有类型旁新增）

```typescript
export interface StudentLessonFeedback {
  id: string;
  schedule_id: string;
  student_id: string;
  rating: number | null;
  comment: string | null;
  suggestion: string | null;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export interface StudentFeedbackWithContext extends StudentLessonFeedback {
  course_title: string;
  teacher_name: string;
  lesson_number: number;
  lesson_title: string;
  lesson_date: string;
}

export interface ScheduleFeedbackStudent {
  student_id: string;
  student_name: string;
  student_avatar: string | null;
  feedback: StudentLessonFeedback | null;
}

export interface ScheduleFeedbackResponse {
  schedule: { id: string; lesson_number: number; title: string; start_time: string; end_time: string };
  course: { id: string; title: string };
  students: ScheduleFeedbackStudent[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface BatchSaveResult {
  success: string[];
  skipped: string[];
  deleted: string[];
  errors: Array<{ student_id: string; error: string }>;
}
```

### 3.2 API 客户端方法

**文件**: `apps/web/src/api/client.ts`（新增 `studentFeedbackApi` 对象）

```typescript
export const studentFeedbackApi = {
  // 老师端
  getScheduleFeedbacks(scheduleId: string) {
    return request<ScheduleFeedbackResponse>(`/api/student-feedback/schedule/${scheduleId}`);
  },
  saveFeedback(data: { schedule_id: string; student_id: string; rating?: number | null; comment?: string | null; suggestion?: string | null }) {
    return request<StudentLessonFeedback | { deleted: true }>('/api/student-feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  batchSave(data: { schedule_id: string; feedbacks: Array<{ student_id: string; rating?: number | null; comment?: string | null; suggestion?: string | null }> }) {
    return request<BatchSaveResult>('/api/student-feedback/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  publishAll(scheduleId: string) {
    return request<{ published_count: number }>(`/api/student-feedback/schedule/${scheduleId}/publish`, {
      method: 'PATCH',
    });
  },
  revoke(id: string) {
    return request<StudentLessonFeedback>(`/api/student-feedback/${id}/revoke`, {
      method: 'PATCH',
    });
  },
  getStudentHistory(studentId: string, courseId: string) {
    return request<StudentLessonFeedback[]>(`/api/student-feedback/student/${studentId}/course/${courseId}`);
  },

  // 学生端
  getMyFeedbacks(params?: { course_id?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.course_id) searchParams.set('course_id', params.course_id);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const qs = searchParams.toString();
    return request<PaginatedResponse<StudentFeedbackWithContext>>(`/api/student-feedback/my${qs ? `?${qs}` : ''}`);
  },
  getMyLatest() {
    return request<StudentFeedbackWithContext | null>('/api/student-feedback/my/latest');
  },
  getMyCourseFeedbacks(courseId: string, params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const qs = searchParams.toString();
    return request<PaginatedResponse<StudentFeedbackWithContext>>(`/api/student-feedback/my/course/${courseId}${qs ? `?${qs}` : ''}`);
  },
};
```

### 3.3 Query Keys

**文件**: `apps/web/src/lib/query-keys.ts`（新增）

```typescript
export const studentFeedbackKeys = createQueryKeys("studentFeedback", {
  bySchedule: (scheduleId: string) => ({ queryKey: [scheduleId] }),
  studentHistory: (studentId: string, courseId: string) => ({ queryKey: [studentId, courseId] }),
  myFeedbacks: (params?: { course_id?: string; page?: number }) => ({ queryKey: [params] }),
  myLatest: null,
  myCourse: (courseId: string, params?: { page?: number }) => ({ queryKey: [courseId, params] }),
});

// 更新 mergeQueryKeys
export const queryKeys = mergeQueryKeys(
  authKeys,
  teacherKeys,
  studentKeys,
  courseKeys,
  feedbackKeys,
  attachmentKeys,
  studentFeedbackKeys,
);
```

### 3.4 Query Hooks

**文件**: `apps/web/src/hooks/use-queries.ts`（新增 hooks）

```typescript
// ── Student Lesson Feedback ──────────────────────────

// 老师端
export function useScheduleFeedbacks(scheduleId: string) {
  return useQuery({
    queryKey: studentFeedbackKeys.bySchedule(scheduleId).queryKey,
    queryFn: () => studentFeedbackApi.getScheduleFeedbacks(scheduleId),
    enabled: !!scheduleId,
  });
}

export function useSaveStudentFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentFeedbackApi.saveFeedback,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: studentFeedbackKeys.bySchedule(variables.schedule_id).queryKey,
      });
    },
  });
}

export function useBatchSaveStudentFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentFeedbackApi.batchSave,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: studentFeedbackKeys.bySchedule(variables.schedule_id).queryKey,
      });
    },
  });
}

export function usePublishScheduleFeedbacks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentFeedbackApi.publishAll,
    onSuccess: (_data, scheduleId) => {
      queryClient.invalidateQueries({
        queryKey: studentFeedbackKeys.bySchedule(scheduleId).queryKey,
      });
    },
  });
}

export function useRevokeStudentFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentFeedbackApi.revoke,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentFeedbackKeys._def });
    },
  });
}

export function useStudentFeedbackHistory(studentId: string, courseId: string) {
  return useQuery({
    queryKey: studentFeedbackKeys.studentHistory(studentId, courseId).queryKey,
    queryFn: () => studentFeedbackApi.getStudentHistory(studentId, courseId),
    enabled: !!studentId && !!courseId,
  });
}

// 学生端
export function useMyFeedbacks(params?: { course_id?: string; page?: number }) {
  return useQuery({
    queryKey: studentFeedbackKeys.myFeedbacks(params).queryKey,
    queryFn: () => studentFeedbackApi.getMyFeedbacks(params),
  });
}

export function useMyLatestFeedback() {
  return useQuery({
    queryKey: studentFeedbackKeys.myLatest.queryKey,
    queryFn: () => studentFeedbackApi.getMyLatest(),
  });
}

export function useMyCourseFeedbacks(courseId: string, params?: { page?: number }) {
  return useQuery({
    queryKey: studentFeedbackKeys.myCourse(courseId, params).queryKey,
    queryFn: () => studentFeedbackApi.getMyCourseFeedbacks(courseId, params),
    enabled: !!courseId,
  });
}
```

### 3.5 表单验证 Schema

**文件**: `apps/web/src/lib/schemas.ts`（新增）

```typescript
export const studentFeedbackSchema = z.object({
  rating: z.number().min(1).max(5).nullable().optional(),
  comment: z.string().max(2000).nullable().optional(),
  suggestion: z.string().max(2000).nullable().optional(),
});

export type StudentFeedbackFormData = z.infer<typeof studentFeedbackSchema>;
```

> 注意：不再在 schema 层强制"至少一项"，因为空内容保存时会触发 DELETE 操作（清空草稿）。

### 3.6 页面组件

#### 老师端 — 反馈编辑页

**文件**: `apps/web/src/routes/(app)/teacher/student-feedback.$scheduleId.tsx`

**布局**:
```
┌──────────────────────────────────────────────┐
│ ← 返回  课程名称 > 第N课 (日期)              │
├──────────────────────────────────────────────┤
│                                              │
│ ┌─ 学生1 ──────────────────────────────────┐ │
│ │ [头像] 张三              保存状态: 草稿   │ │
│ │ 评分: ★★★★☆                              │ │
│ │ 课堂评语: [________________]              │ │
│ │ 改进建议: [________________]              │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌─ 学生2 ──────────────────────────────────┐ │
│ │ [头像] 李四              保存状态: 未填写  │ │
│ │ 评分: ☆☆☆☆☆                              │ │
│ │ 课堂评语: [________________]              │ │
│ │ 改进建议: [________________]              │ │
│ └──────────────────────────────────────────┘ │
│                                              │
├──────────────────────────────────────────────┤
│        [保存全部草稿]    [发布全部反馈]       │
└──────────────────────────────────────────────┘
```

**H5 适配**:
- 学生卡片全宽展示
- 底部操作栏固定在屏幕底部
- 评分星星加大点击热区

**自动保存策略**（收敛为单一策略）:
- **触发条件**：输入内容变化后 debounce 3 秒自动保存
- **状态管理**：每个学生卡片维护独立的 `dirty | saving | saved | error` 状态
- **批量保存**：「保存全部草稿」按钮只保存 dirty 状态的卡片，跳过无变化的
- **发布冲突**：发布时如果有 dirty/saving 的卡片，先等待保存完成

**交互**:
- 单个学生输入变化后 debounce 3s 自动保存草稿
- 「保存全部草稿」调用 batch API（仅 dirty 项）
- 「发布全部反馈」先弹确认 Dialog，确认后调用 publish API
- 已发布的学生卡片显示 "已发布" Badge，输入框禁用，显示「撤回」按钮
- 撤回后卡片恢复可编辑状态

#### 老师端 — 入口修改

**文件**: `apps/web/src/routes/(app)/teacher/courses.$courseId.tsx`（修改现有文件）

- 在课时列表（Schedules）中，每条已结束的课时增加「写反馈」图标按钮
- 点击跳转到 `/teacher/student-feedback/${scheduleId}`

**文件**: `apps/web/src/routes/(app)/route.tsx`（修改侧边栏）

- 在 teacherSidebarItems 中增加「学生反馈」菜单项（在 "reports" 之后）

#### 老师端 — 反馈历史页

**文件**: `apps/web/src/routes/(app)/teacher/student-feedback-history.$studentId.$courseId.tsx`

**布局**: 时间线形式，每条反馈显示课时信息 + 评分 + 评语 + 建议

#### 学生端 — 课后反馈页

**文件**: `apps/web/src/routes/(app)/student/lesson-feedback.tsx`

**布局**:
```
┌──────────────────────────────────────────────┐
│ 课后反馈                                      │
│ ┌──────────────────────────────┐              │
│ │ 筛选课程: [全部课程 ▼]       │              │
│ └──────────────────────────────┘              │
│                                              │
│ ┌─ 反馈卡片 ──────────────────────────────┐  │
│ │ Python入门 · 第3课 · 2026-03-20        │  │
│ │ 老师: 李老师                            │  │
│ │ 评分: ★★★★☆                            │  │
│ │ 评语: 今天表现不错，积极参与课堂讨论...   │  │
│ │ 建议: 课后多练习 for 循环的嵌套用法      │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ ┌─ 反馈卡片 ──────────────────────────────┐  │
│ │ Python入门 · 第2课 · 2026-03-18        │  │
│ │ ...                                     │  │
│ └────────────────────────────────────────┘  │
│                                              │
│              [加载更多]                       │
└──────────────────────────────────────────────┘
```

**H5 适配**: 卡片全宽，筛选器可折叠

#### 学生端 — 入口修改

**文件**: `apps/web/src/routes/(app)/route.tsx`（修改侧边栏）

- 在 studentSidebarItems 中增加「课后反馈」菜单项（在 "messages" 之后）
- 注意与现有的 feedback（课程级反馈）区分

**文件**: `apps/web/src/routes/(app)/student/index.tsx`（Dashboard 修改）

- 增加最近反馈提示卡片（调用 `/my/latest`）
- 文案使用"最近反馈"而非"新反馈"（无已读状态追踪）

---

## 4. 国际化

**文件**: `apps/web/src/locales/zh.json` + `en.json`

新增 namespace `studentLessonFeedback`:

```json
{
  "studentLessonFeedback": {
    "title": "课后反馈",
    "writeFeedback": "写反馈",
    "rating": "课堂表现评分",
    "comment": "课堂评语",
    "commentPlaceholder": "请输入对该学生的课堂表现评价...",
    "suggestion": "改进建议",
    "suggestionPlaceholder": "请输入学习改进建议...",
    "saveAllDrafts": "保存全部草稿",
    "publishAll": "发布全部反馈",
    "publishConfirm": "确认发布该课时所有反馈？发布后学生即可查看。",
    "revoke": "撤回",
    "revokeConfirm": "确认撤回该反馈？撤回后学生将无法查看。",
    "statusDraft": "草稿",
    "statusPublished": "已发布",
    "statusNotWritten": "未填写",
    "noFeedback": "暂无课后反馈",
    "filterByCourse": "筛选课程",
    "allCourses": "全部课程",
    "loadMore": "加载更多",
    "lessonEnded": "课时已结束",
    "lessonNotEnded": "课时尚未结束",
    "latestFeedback": "最近反馈",
    "viewAll": "查看全部",
    "feedbackHistory": "反馈历史",
    "savedAt": "保存于",
    "publishedCount": "已发布 {count} 条反馈",
    "atLeastOneField": "评分、评语、建议至少填一项",
    "saving": "保存中...",
    "saved": "已保存",
    "saveError": "保存失败",
    "conflictPublished": "该反馈已发布，请先撤回再编辑",
    "batchLimitExceeded": "单次最多保存 50 条反馈"
  }
}
```

---

## 5. 文件变更清单

### 新增文件

| 文件 | 说明 |
|------|------|
| `apps/api/sql/006_student_lesson_feedback.sql` | 数据库 migration |
| `apps/api/src/routes/student-feedback.ts` | API 路由 |
| `apps/api/src/__tests__/routes/student-feedback.test.ts` | API 测试 |
| `apps/web/src/routes/(app)/teacher/student-feedback.$scheduleId.tsx` | 老师反馈编辑页 |
| `apps/web/src/routes/(app)/teacher/student-feedback-history.$studentId.$courseId.tsx` | 老师反馈历史页 |
| `apps/web/src/routes/(app)/student/lesson-feedback.tsx` | 学生课后反馈页 |

### 修改文件

| 文件 | 修改内容 |
|------|----------|
| `apps/api/src/app.ts` | 注册 student-feedback 路由 |
| `apps/web/src/api/client.ts` | 新增类型定义 + `studentFeedbackApi` |
| `apps/web/src/lib/query-keys.ts` | 新增 `studentFeedbackKeys` + 更新 mergeQueryKeys |
| `apps/web/src/hooks/use-queries.ts` | 新增 query hooks |
| `apps/web/src/lib/schemas.ts` | 新增验证 schema |
| `apps/web/src/locales/zh.json` | 新增 i18n 翻译 |
| `apps/web/src/locales/en.json` | 新增 i18n 翻译 |
| `apps/web/src/routes/(app)/route.tsx` | 老师/学生侧边栏增加菜单项 |
| `apps/web/src/routes/(app)/teacher/courses.$courseId.tsx` | 课时列表增加「写反馈」按钮 |
| `apps/web/src/routes/(app)/student/index.tsx` | Dashboard 增加最近反馈卡片 |

---

## 6. 测试计划

### 单元/集成测试（Vitest + Supertest）

| 测试场景 | 验证内容 |
|----------|----------|
| POST /student-feedback | 正常创建、upsert、权限校验、课时未结束拒绝 |
| POST /student-feedback（空内容） | 清空所有字段时删除草稿记录 |
| POST /student-feedback（并发） | 已发布记录拒绝更新，返回 409 |
| POST /student-feedback/batch | 批量保存、跳过已发布、部分失败处理、50条限制 |
| PATCH publish | 仅发布有内容的 draft、权限校验 |
| PATCH revoke | 仅撤回已发布、权限校验 |
| GET /schedule/:id | 含未写反馈的学生、权限校验 |
| GET /my | 分页、course_id 筛选、仅返回 published、limit上限 |
| 数据隔离 | 学生只能看到自己的、老师只能操作自己课程的 |

### E2E 测试（Playwright）

| 场景 | 步骤 |
|------|------|
| 老师写反馈 | 登录 → 课程详情 → 点击"写反馈" → 填写 → 保存草稿 → 发布 |
| 学生看反馈 | 登录 → 课后反馈页 → 验证显示已发布内容 → 课程筛选 |
| 权限隔离 | 学生登录 → 验证看不到 draft 状态反馈 |
| 撤回流程 | 老师撤回已发布反馈 → 学生端验证消失 → 老师修改后重新发布 |

---

## 7. 开发顺序

| 阶段 | 任务 | 依赖 |
|------|------|------|
| **Phase 1** | Migration SQL + API 路由 + 单元测试 | 无 |
| **Phase 2** | 前端类型 + API client + query keys + hooks + schema | Phase 1 |
| **Phase 3** | 老师端反馈编辑页 + 入口修改 + 侧边栏 | Phase 2 |
| **Phase 4** | 学生端反馈查看页 + Dashboard 卡片 + 侧边栏 | Phase 2 |
| **Phase 5** | i18n + 响应式优化 + E2E 测试 | Phase 3, 4 |
