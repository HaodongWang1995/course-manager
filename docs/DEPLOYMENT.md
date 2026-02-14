# Course Manager 部署指南

## 目录

1. [环境要求](#环境要求)
2. [本地开发环境搭建](#本地开发环境搭建)
3. [数据库初始化](#数据库初始化)
4. [启动开发服务](#启动开发服务)
5. [构建生产版本](#构建生产版本)
6. [生产环境部署](#生产环境部署)
7. [环境变量说明](#环境变量说明)
8. [常见问题](#常见问题)

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

| 表名 | 说明 |
|------|------|
| `users` | 用户表（teacher/student 角色） |
| `courses` | 课程表（关联 teacher_id） |
| `course_schedules` | 课程日程表（关联 course_id） |
| `enrollments` | 选课记录表（student_id + course_id 唯一） |

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

## 环境变量说明

### 后端 (`apps/api/.env`)

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `PORT` | 否 | `3001` | API 服务端口 |
| `DATABASE_URL` | 是 | - | PostgreSQL 连接字符串 |
| `JWT_SECRET` | 是 | - | JWT 签名密钥，生产环境用强随机值 |
| `CORS_ORIGIN` | 否 | `localhost:5173-5176` | 允许的前端域名，逗号分隔 |

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
