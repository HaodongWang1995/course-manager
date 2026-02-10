# Phase 1: 认证 + 课程CRUD + 学生浏览

**日期**: 2026-02-10
**分支**: master
**变更类型**: 新功能

---

## 概述

将前端原型从 localStorage mock 数据层升级为真实的前后端分离架构。新增 Express.js 后端 API 服务（`apps/api`），连接 Aurora Serverless PostgreSQL 数据库，实现用户认证（注册/登录）、老师端课程 CRUD 管理、学生端课程浏览功能。

## 架构变更

```
之前: React → localStorage (mock data)
之后: React → TanStack Query → Express.js API (port 3001) → Aurora Serverless PostgreSQL
```

## 新增文件

### 后端 API (`apps/api/`) — 全新模块

| 文件 | 说明 |
|------|------|
| `package.json` | Express + pg + bcryptjs + jsonwebtoken 依赖配置 |
| `tsconfig.json` | TypeScript 编译配置 |
| `sql/001_init.sql` | 数据库初始化脚本（users / courses / course_schedules 三张表） |
| `src/index.ts` | Express 服务入口，CORS、JSON 解析、路由挂载 |
| `src/db.ts` | PostgreSQL 连接池配置 |
| `src/middleware/auth.ts` | JWT 认证中间件（authRequired / teacherOnly / signToken） |
| `src/routes/auth.ts` | 认证路由：POST /register, POST /login, GET /me |
| `src/routes/courses.ts` | 课程 CRUD：GET/POST/PUT/DELETE /courses, PATCH /courses/:id/status |
| `src/routes/schedules.ts` | 课时 CRUD：GET/POST /courses/:courseId/schedules, PUT/DELETE /schedules/:id |

### 前端新增文件

| 文件 | 说明 |
|------|------|
| `apps/web/src/api/client.ts` | API 请求封装（JWT 自动附加、401 重定向、类型定义） |
| `apps/web/src/routes/student/courses.$courseId.tsx` | 学生端课程详情页（课程信息 + 日程列表 + 价格） |
| `apps/web/src/routes/teacher/courses.$courseId.tsx` | 老师端课程详情/编辑页（含课时管理） |

## 修改文件

| 文件 | 变更说明 |
|------|----------|
| `apps/web/vite.config.ts` | 添加 `/api` 代理到 localhost:3001 |
| `apps/web/src/hooks/use-queries.ts` | Auth/Courses/Schedules hooks 改为调用真实 API；其余 hooks 保持 localStorage 不变 |
| `apps/web/src/routes/login.tsx` | 重写为登录/注册双 Tab 表单，支持邮箱+密码认证，中文 UI |
| `apps/web/src/routes/teacher/route.tsx` | 添加 JWT 认证守卫 + 角色检查 + 退出登录按钮 + 动态用户名 |
| `apps/web/src/routes/student/route.tsx` | 添加 JWT 认证守卫 + 角色检查 + 退出登录按钮 + 动态用户名 |
| `apps/web/src/routes/teacher/courses.tsx` | 适配新数据模型（id/title/status/price/category），添加上架/下架功能 |
| `apps/web/src/routes/student/index.tsx` | 从日程视图改为课程浏览页面（搜索 + 分类筛选 + 卡片列表） |
| `pnpm-lock.yaml` | 新增 API 依赖锁定 |

## 删除文件

| 文件 | 原因 |
|------|------|
| `apps/web/src/routes/teacher/courses/$courseId.tsx` | 旧嵌套路由文件，替换为 dot 命名约定的 `courses.$courseId.tsx` |

## 数据库 Schema

```sql
-- users: 用户表（UUID主键，email唯一，bcrypt密码哈希，teacher/student角色）
-- courses: 课程表（关联teacher_id，支持active/draft/archived状态，价格/分类）
-- course_schedules: 课时表（关联course_id，级联删除，课时编号/时间/教室）
```

## API 端点

| Method | Path | 权限 | 说明 |
|--------|------|------|------|
| POST | /api/auth/register | 公开 | 用户注册 |
| POST | /api/auth/login | 公开 | 用户登录，返回 JWT |
| GET | /api/auth/me | 登录用户 | 获取当前用户信息 |
| GET | /api/courses | 登录用户 | 课程列表（老师看自己的，学生看 active） |
| GET | /api/courses/:id | 登录用户 | 课程详情（含日程） |
| POST | /api/courses | 老师 | 创建课程 |
| PUT | /api/courses/:id | 老师 | 编辑课程 |
| DELETE | /api/courses/:id | 老师 | 删除课程 |
| PATCH | /api/courses/:id/status | 老师 | 切换课程状态 |
| GET | /api/courses/:id/schedules | 登录用户 | 获取课时列表 |
| POST | /api/courses/:id/schedules | 老师 | 添加课时 |
| PUT | /api/schedules/:id | 老师 | 编辑课时 |
| DELETE | /api/schedules/:id | 老师 | 删除课时 |

## 部署要求

1. 在 Aurora Serverless PostgreSQL 上执行 `sql/001_init.sql`
2. 设置环境变量：`DATABASE_URL`、`JWT_SECRET`、`CORS_ORIGIN`
3. 开发环境：`pnpm dev` 同时启动 web (5173) 和 api (3001)
4. 生产环境：PM2 运行 API，Nginx 反向代理 `/api` → `localhost:3001`

## 向后兼容

- `packages/ui/` 所有组件 100% 保持不变
- 非 Phase 1 功能（Dashboard、Calendar、Students、Reports、Grades、Assignments、Resources、Feedback）仍使用 localStorage，无影响
- 路由结构和布局组件仅添加了认证守卫，原有布局不变
