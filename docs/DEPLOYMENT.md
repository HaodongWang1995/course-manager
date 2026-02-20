# Course Manager 部署指南

## 目录

1. [环境要求](#环境要求)
2. [本地开发环境搭建](#本地开发环境搭建)
3. [数据库初始化](#数据库初始化)
4. [启动开发服务](#启动开发服务)
5. [构建生产版本](#构建生产版本)
6. [生产环境部署](#生产环境部署)
7. [文件存储（Cloudflare R2）](#文件存储cloudflare-r2)
8. [环境变量说明](#环境变量说明)
9. [常见问题](#常见问题)

---

## 环境要求

| 工具 | 版本 | 说明 |
|------|------|------|
| Node.js | >= 18 | 推荐 LTS 版本 |
| pnpm | 9.15.0 | 包管理器（通过 `corepack enable` 启用） |
| PostgreSQL | >= 14 | 数据库 |
| Turborepo | ^2.4.0 | 构建系统（作为 devDependency 自动安装） |

---

## 本地开发环境搭建

### 1. 克隆项目

```bash
git clone <repo-url> course-manager
cd course-manager
```

### 2. 安装依赖

```bash
# 启用 corepack 以使用项目指定的 pnpm 版本
corepack enable

# 安装所有工作区依赖
pnpm install
```

### 3. 配置环境变量

在 `apps/api/` 目录下创建 `.env` 文件：

```bash
cp apps/api/.env.example apps/api/.env  # 或手动创建
```

`.env` 内容：

```env
PORT=3001
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=dev-secret-change-in-production
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/course_manager
```

> **注意**: 生产环境务必更换 `JWT_SECRET` 为强随机字符串。

---

## 数据库初始化

### 1. 创建数据库

```bash
# 通过 psql 连接 PostgreSQL
psql -U postgres

# 在 psql 中执行
CREATE DATABASE course_manager;
\q
```

### 2. 执行迁移脚本

按顺序执行 SQL 迁移文件：

```bash
# Phase 1: 用户、课程、课程表
psql -U postgres -d course_manager -f apps/api/sql/001_init.sql

# Phase 2: 选课系统
psql -U postgres -d course_manager -f apps/api/sql/002_enrollments.sql
```

### 数据库表结构

按顺序执行所有迁移文件：

```bash
psql -U postgres -d course_manager -f apps/api/sql/001_init.sql
psql -U postgres -d course_manager -f apps/api/sql/002_enrollments.sql
psql -U postgres -d course_manager -f apps/api/sql/003_features.sql
# 004_attachments.sql — 附件功能（待实现）
```

| 表名 | 迁移文件 | 说明 |
|------|----------|------|
| `users` | 001 | 用户表（teacher/student 角色） |
| `courses` | 001 | 课程表（关联 teacher_id） |
| `course_schedules` | 001 | 课程日程表（关联 course_id） |
| `enrollments` | 002 | 选课记录表（student_id + course_id 唯一） |
| `assignments` | 003 | 作业表 |
| `grades` | 003 | 成绩表 |
| `resources` | 003 | 课程资源表 |
| `feedback` | 003 | 课后反馈表 |
| `deadlines` | 003 | 教师待办/截止日期表 |
| `attachments` | 004（待实现） | 课程/课节附件表，关联 R2 文件 |

---

## 启动开发服务

### 方式一：同时启动前后端（推荐）

```bash
# 在项目根目录
pnpm dev
```

Turborepo 会并行启动：
- **API**: `http://localhost:3001` (Express 后端)
- **Web**: `http://localhost:5173` (Vite 前端开发服务器)

前端开发服务器已配置代理，`/api` 请求会自动转发到后端。

### 方式二：分别启动

```bash
# 终端 1 - 后端
cd apps/api
pnpm dev

# 终端 2 - 前端
cd apps/web
pnpm dev
```

### 验证服务

```bash
# 健康检查
curl http://localhost:3001/api/health
# 预期返回: {"status":"ok","timestamp":"..."}
```

---

## 构建生产版本

### 全量构建

```bash
pnpm build
```

构建产物：
- **API**: `apps/api/dist/` (编译后的 Node.js 代码)
- **Web**: `apps/web/dist/` (静态 HTML/JS/CSS 文件)

### 类型检查

```bash
pnpm typecheck
```

### 运行测试

```bash
# 全部测试
pnpm test

# 带覆盖率
pnpm test:coverage
```

---

## 生产环境部署

### 后端 (Express API)

#### 启动命令

```bash
cd apps/api
pnpm build          # TypeScript -> dist/
node dist/index.js  # 启动服务
```

#### 必需环境变量

```env
PORT=3001
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname>
JWT_SECRET=<强随机字符串-至少32位>
CORS_ORIGIN=https://your-frontend-domain.com
```

#### 部署选项

| 平台 | 适用场景 | 说明 |
|------|----------|------|
| Railway | 快速部署 | 支持 PostgreSQL 附加，自动检测 Node.js |
| Fly.io | 全球边缘 | 需要 `fly.toml` 配置 |
| Render | 免费层 | 自带 PostgreSQL |
| AWS ECS/Fargate | 企业级 | 需要 Docker 化 |

### 前端 (React SPA)

#### 构建产物

```bash
cd apps/web
pnpm build    # 输出到 dist/
```

#### 环境变量

前端通过 Vite 环境变量配置 API 地址：

```env
VITE_API_URL=https://api.your-domain.com
```

> 如果前后端同域部署（通过反向代理），`VITE_API_URL` 可留空，前端会使用相对路径 `/api`。

#### 部署选项

| 平台 | 适用场景 | 说明 |
|------|----------|------|
| Vercel | 最简单 | 零配置部署静态站点 |
| Netlify | 带表单/函数 | 支持 `_redirects` SPA 路由 |
| AWS S3 + CloudFront | 企业级 | CDN 加速 |
| Nginx | 自托管 | 需配置 SPA fallback |

#### Nginx 参考配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/course-manager/web;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 数据库 (PostgreSQL)

| 服务 | 说明 |
|------|------|
| Supabase | 免费层，自带 REST API |
| Railway PostgreSQL | 一键附加 |
| AWS RDS / Aurora | 企业级，推荐 Aurora Serverless |
| Neon | Serverless PostgreSQL |

---

## 文件存储（Cloudflare R2）

课程附件（PDF、PPT、课件等）存储于 Cloudflare R2，不经过 API 服务器（浏览器直传）。

### 为什么选 Cloudflare R2

| 方案 | 免费存储 | 出站流量 | 适合场景 |
|------|----------|----------|----------|
| AWS S3 | 5 GB（12 个月） | $0.09/GB | 企业级，生态最完整 |
| **Cloudflare R2** | **10 GB 永久** | **$0 永久免费** | 教育平台、文件下载多 ✅ |
| Backblaze B2 | 10 GB 永久 | 免费 3× 月均 | 存储成本最低 |

R2 选型理由：课程平台有大量学生下载行为，出站流量免费是核心优势。R2 兼容 S3 API，使用 `@aws-sdk/client-s3` 即可。

### 配置步骤

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com) → R2 → 创建 bucket（名称：`course-manager-files`）
2. R2 → 管理 API Tokens → 创建 Token（权限：Object Read & Write）
3. 配置 bucket CORS：

```json
[
  {
    "AllowedOrigins": ["https://your-domain.com", "http://localhost:5173"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

4. 在 API 环境变量中添加（见下方[环境变量说明](#环境变量说明)）

### 上传流程（Presigned URL 直传）

```
浏览器 ──1. 请求 presign──> API ──2. 生成 presigned PUT URL──> R2
浏览器 ──3. 直接 PUT 文件──────────────────────────────────────> R2
浏览器 ──4. confirm 元数据──> API ──5. 写入 PostgreSQL
```

API 服务器不处理文件内容，仅生成签名 URL 和保存元数据，不影响服务器带宽。

### 本地开发

本地开发可继续使用 Cloudflare R2（免费额度足够），或配置 [MinIO](https://min.io/) 作为本地 S3 兼容存储：

```bash
# 使用 Docker 运行本地 MinIO
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

---

## 环境变量说明

### 后端 (`apps/api/.env`)

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `PORT` | 否 | `3001` | API 服务端口 |
| `DATABASE_URL` | 是 | - | PostgreSQL 连接字符串 |
| `JWT_SECRET` | 是 | - | JWT 签名密钥，生产环境用强随机值 |
| `CORS_ORIGIN` | 否 | `localhost:5173-5176` | 允许的前端域名，逗号分隔 |
| `R2_ACCOUNT_ID` | 附件功能 | - | Cloudflare Account ID |
| `R2_ACCESS_KEY_ID` | 附件功能 | - | R2 API Token Access Key ID |
| `R2_SECRET_ACCESS_KEY` | 附件功能 | - | R2 API Token Secret Access Key |
| `R2_BUCKET_NAME` | 附件功能 | `course-manager-files` | R2 Bucket 名称 |
| `R2_PUBLIC_URL` | 附件功能 | - | R2 公开访问域名（如 `https://pub-xxx.r2.dev`） |

### 前端 (`apps/web/.env`)

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `VITE_API_URL` | 否 | `""` (空=相对路径) | API 基地址，跨域部署时需设置 |

---

## 常见问题

### Q: `pnpm install` 失败？

确保 pnpm 版本为 9.x：

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

### Q: 数据库连接失败？

1. 确认 PostgreSQL 服务已启动
2. 确认 `course_manager` 数据库已创建
3. 检查 `DATABASE_URL` 中的用户名、密码、端口

### Q: 前端请求 API 返回 CORS 错误？

检查后端 `CORS_ORIGIN` 是否包含前端的实际域名。多个域名用逗号分隔：

```env
CORS_ORIGIN=https://app.example.com,https://www.example.com
```

### Q: JWT Token 过期？

当前 JWT 未设置过期时间。生产环境建议在 `apps/api/src/routes/auth.ts` 中添加 `expiresIn` 配置。

### Q: 如何添加新的数据库迁移？

在 `apps/api/sql/` 下创建新文件，按编号递增命名：

```
003_<description>.sql
```

然后在目标数据库上手动执行该 SQL 文件。
