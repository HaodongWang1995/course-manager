# TODO: 附件功能（课程 & 课节文件上传/下载）

> 创建时间：2026-02-20

---

## 需求概述

教师在新建/编辑课程时，或在新增单节课（schedule）时，可以上传附件（课件 PDF、PPT、资料等）。学生在课程详情页可以看到所有附件列表并下载。

---

## 存储方案选型

**推荐：Cloudflare R2**

| 方案 | 免费额度 | 存储价格 | 出站流量 | 备注 |
|------|----------|----------|----------|------|
| AWS S3 | 5 GB / 12 个月 | $0.023/GB | $0.09/GB | 行业标准，但 egress 贵 |
| **Cloudflare R2** | **10 GB 永久免费** | $0.015/GB | **$0 永久免费** | S3 兼容 API，推荐 ✅ |
| Backblaze B2 | 10 GB 永久免费 | $0.006/GB | 免费 3× 月均存储 | 存储最便宜，适合低下载场景 |

**选择 Cloudflare R2 的原因：**
- 课程平台下载量大，egress 免费是关键优势
- 10 GB 永久免费（非 12 个月限制）
- 完全兼容 S3 API，使用 `@aws-sdk/client-s3` 即可，无需额外学习成本
- 免费额度：1M PUT/月 + 10M GET/月，足够小型平台使用

---

## 实现方案：Presigned URL 直传

```
浏览器                     API Server              Cloudflare R2
  │                            │                        │
  │ 1. POST /api/attachments/presign (filename, type, courseId/scheduleId)
  │──────────────────────────> │                        │
  │                            │ 2. 生成 presigned PUT URL (有效期 10 分钟)
  │                            │ ──────────────────────>│
  │ 3. 返回 { uploadUrl, fileKey }                       │
  │ <──────────────────────────│                        │
  │ 4. 直接 PUT 文件到 uploadUrl (浏览器 → R2, 不经过 API)
  │ ──────────────────────────────────────────────────> │
  │ 5. 上传成功后，POST /api/attachments/confirm (fileKey, filename, size)
  │──────────────────────────> │                        │
  │                            │ 6. 保存元数据到 PostgreSQL
  │ 7. 返回 attachment 对象    │                        │
  │ <──────────────────────────│                        │
```

---

## 实现任务清单

### Phase 1 — 基础设施 & 后端

#### 1.1 Cloudflare R2 配置
- [x] 在 Cloudflare Dashboard 创建 R2 bucket（命名：`course-manager-files`）
- [x] 生成 R2 API Token（Access Key ID + Secret Access Key）
- [x] 配置 bucket CORS（允许 PUT/GET 来自应用域名）
- [x] 设置 R2 public URL（或使用 presigned GET URL）
- [x] 新增环境变量：
  ```env
  R2_ACCOUNT_ID=xxx
  R2_ACCESS_KEY_ID=xxx
  R2_SECRET_ACCESS_KEY=xxx
  R2_BUCKET_NAME=course-manager-files
  R2_PUBLIC_URL=https://pub-xxx.r2.dev  # 或自定义域名
  ```

#### 1.2 数据库迁移（004_attachments.sql）
```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES course_schedules(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES users(id),
  filename VARCHAR(255) NOT NULL,       -- 显示名称
  file_key VARCHAR(500) NOT NULL,       -- R2 中的对象 key
  file_type VARCHAR(50),                -- MIME type
  file_size BIGINT,                     -- 字节数
  created_at TIMESTAMP DEFAULT NOW(),
  -- 至少有一个关联
  CONSTRAINT attachment_has_parent CHECK (course_id IS NOT NULL OR schedule_id IS NOT NULL)
);
CREATE INDEX idx_attachments_course ON attachments(course_id);
CREATE INDEX idx_attachments_schedule ON attachments(schedule_id);
```

#### 1.3 安装依赖
```bash
pnpm --filter @course-manager/api add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

#### 1.4 新增 API 路由（apps/api/src/routes/attachments.ts）

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/api/attachments/presign` | Teacher | 生成 presigned PUT URL |
| POST | `/api/attachments/confirm` | Teacher | 上传成功后保存元数据 |
| GET  | `/api/courses/:id/attachments` | Auth | 获取课程附件列表 |
| GET  | `/api/schedules/:id/attachments` | Auth | 获取课节附件列表 |
| DELETE | `/api/attachments/:id` | Teacher（本人） | 删除附件（同步删除 R2 对象） |

**Presign 接口参数：**
```json
{
  "filename": "lecture-01.pdf",
  "content_type": "application/pdf",
  "file_size": 1048576,
  "course_id": "uuid",          // 二选一
  "schedule_id": "uuid"         // 二选一
}
```
**Presign 响应：**
```json
{
  "upload_url": "https://xxx.r2.cloudflarestorage.com/...",
  "file_key": "courses/uuid/2026-02-20-lecture-01.pdf"
}
```

#### 1.5 文件 key 命名规则
```
courses/{course_id}/{timestamp}-{sanitized_filename}
schedules/{schedule_id}/{timestamp}-{sanitized_filename}
```

---

### Phase 2 — 前端

#### 2.1 公共组件（packages/ui）
- [x] `FileUploadZone` 组件：拖放 / 点击上传，显示进度条，支持多文件
- [x] `AttachmentList` 组件：显示附件列表，每项含文件名、大小、类型图标、下载按钮

#### 2.2 API Client 更新（apps/web/src/api/client.ts）
```typescript
export interface Attachment {
  id: string;
  filename: string;
  file_key: string;
  file_type?: string;
  file_size?: number;
  created_at: string;
}

export const attachmentApi = {
  presign(data: { filename: string; content_type: string; file_size?: number; course_id?: string; schedule_id?: string }) {
    return request<{ upload_url: string; file_key: string }>("/api/attachments/presign", { method: "POST", body: JSON.stringify(data) });
  },
  confirm(data: { file_key: string; filename: string; file_size?: number; file_type?: string; course_id?: string; schedule_id?: string }) {
    return request<Attachment>("/api/attachments/confirm", { method: "POST", body: JSON.stringify(data) });
  },
  listByCourse(courseId: string) {
    return request<Attachment[]>(`/api/courses/${courseId}/attachments`);
  },
  listBySchedule(scheduleId: string) {
    return request<Attachment[]>(`/api/schedules/${scheduleId}/attachments`);
  },
  delete(id: string) {
    return request<{ success: boolean }>(`/api/attachments/${id}`, { method: "DELETE" });
  },
};
```

#### 2.3 TanStack Query hooks（use-queries.ts）
- [x] `useCourseAttachments(courseId)` — 获取课程附件
- [x] `useScheduleAttachments(scheduleId)` — 获取课节附件
- [x] `useUploadAttachment()` — presign + 直传 + confirm 的封装 mutation

#### 2.4 Teacher 端修改
- [x] `teacher/courses.$courseId.tsx`：课程编辑页面新增「Attachments」区块，支持上传和删除
- [x] `teacher/calendar.tsx` — New Event 对话框新增附件上传字段
- [x] `teacher/courses.index.tsx` — Create Course 对话框新增附件字段（可选，或仅在详情页管理）

#### 2.5 Student 端修改
- [x] `student/courses.$courseId.tsx`：课程详情页展示附件列表（含下载按钮）
- [x] `student/index.tsx` — CourseDetailPanel 中展示课节附件

---

### Phase 3 — 安全 & 优化

- [x] **文件大小限制**：presign 接口校验 `file_size ≤ 50MB`（可配置）
- [x] **文件类型白名单**：仅允许 `pdf, doc, docx, ppt, pptx, xls, xlsx, jpg, png, mp4, zip`
- [x] **访问控制**：GET 附件列表需要登录，且只能查看自己已报名的课程附件
- [x] **presigned GET URL**：如果 bucket 不公开，文件下载也使用 presigned GET URL（有效期 1 小时）
- [x] **生产 docker-compose**：新增 R2 环境变量到 `docker-compose.prod.yml`

---

## 验收标准

1. 教师在课程详情页可以上传 PDF/PPT 等文件，上传进度可见
2. 教师在新增课节（New Event 对话框）时可以添加附件
3. 学生在课程详情页看到「附件」区块，每个文件可点击下载
4. 学生在日程详情面板（CourseDetailPanel）可看到该节课的附件
5. 文件存储在 Cloudflare R2，不经过 API 服务器（直传）
6. 删除附件后 R2 中的对象同步删除，不留孤立文件

---

## 预估工作量

| 阶段 | 内容 | 优先级 |
|------|------|--------|
| Phase 1 | R2 配置 + DB 迁移 + API 路由 | 🔴 先做 |
| Phase 2.1 | 公共 UI 组件 | 🔴 先做 |
| Phase 2.2-2.4 | Teacher 上传功能 | 🔴 核心 |
| Phase 2.5 | Student 下载功能 | 🔴 核心 |
| Phase 3 | 安全加固 | 🟡 后做 |
