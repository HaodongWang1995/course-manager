# Course Manager 部署指南

## 目录

1. [环境要求](#环境要求)
2. [本地开发环境搭建](#本地开发环境搭建)
3. [数据库初始化](#数据库初始化)
4. [启动开发服务](#启动开发服务)
5. [构建生产版本](#构建生产版本)
6. [生产环境部署（Docker Compose）](#生产环境部署docker-compose)
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

按顺序执行所有 SQL 迁移文件：

```bash
psql -U postgres -d course_manager -f apps/api/sql/001_init.sql
psql -U postgres -d course_manager -f apps/api/sql/002_enrollments.sql
psql -U postgres -d course_manager -f apps/api/sql/003_features.sql
psql -U postgres -d course_manager -f apps/api/sql/004_attachments.sql
```

### 数据库表结构

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
| `attachments` | 004 | 课程/课节附件表，关联 R2 文件 |

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

## 生产环境部署（Docker Compose）

当前生产环境部署在 AWS EC2 上，使用 Docker Compose 管理三个容器：PostgreSQL、API、Web（含 Nginx 反向代理）。

### 服务器信息

| 项目 | 值 |
|------|----|
| 实例 ID | `i-0e834d5065a4ee7ff` |
| 区域 | `us-west-2` |
| Elastic IP | `100.23.242.232` |
| 访问地址 | http://100.23.242.232/ |
| SSH 密钥 | `~/.ssh/course-manager-key.pem` |
| SSH 用户 | `ec2-user` |
| 项目路径 | `/home/ec2-user/course-manager` |
| 实例规格 | `t2.micro`（已添加 2GB swap 防 OOM） |

### 容器架构

```
用户请求 ──> EC2 :80
                │
         ┌──────▼──────────────────────────────┐
         │  Docker Compose                     │
         │                                     │
         │  web (nginx + React SPA)  :80       │
         │    └── /api/* ──> api:3001          │
         │                                     │
         │  api (Express)            :3001     │
         │    └── PostgreSQL DB      ──> db    │
         │                                     │
         │  db (PostgreSQL)          :5432     │
         └─────────────────────────────────────┘
```

> API 容器不对外暴露端口，只在 Docker 内部网络通信。

### 前置条件

服务器上需要安装：
- Docker & Docker Compose
- Git

### 首次部署

```bash
# 1. SSH 登录
ssh -i ~/.ssh/course-manager-key.pem ec2-user@100.23.242.232

# 2. 克隆仓库
git clone <repo-url> ~/course-manager
cd ~/course-manager

# 3. 创建 API 环境变量文件
cat > apps/api/.env << 'EOF'
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@db:5432/course_manager
JWT_SECRET=<强随机字符串>
CORS_ORIGIN=http://100.23.242.232
# 附件功能（可选，留空则为 stub 模式）
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=course-manager-files
R2_PUBLIC_URL=
EOF

# 4. 执行数据库迁移（首次，容器启动后）
docker-compose -f docker-compose.prod.yml up -d db
sleep 5
docker-compose -f docker-compose.prod.yml exec db psql -U postgres -d course_manager \
  -f /docker-entrypoint-initdb.d/001_init.sql
# ... 依次执行 002-004

# 5. 启动所有服务
docker-compose -f docker-compose.prod.yml up -d --build
```

### 日常更新部署（一键）

在本地项目根目录执行：

```bash
# 1. 推送代码到 GitHub
git push origin master

# 2. 登录服务器，拉取最新代码并重建
ssh -i ~/.ssh/course-manager-key.pem ec2-user@100.23.242.232 \
  "cd ~/course-manager && git pull origin master && \
   docker-compose -f docker-compose.prod.yml up -d --build"
```

或使用本地脚本一步完成：

```bash
git push origin master && \
ssh -i ~/.ssh/course-manager-key.pem ec2-user@100.23.242.232 \
  "cd ~/course-manager && git pull origin master && \
   docker-compose -f docker-compose.prod.yml up -d --build 2>&1 | tail -20"
```

> **注意**：`t2.micro` 内存仅 1GB，构建时可能 OOM。服务器已配置 2GB swapfile，如遇问题执行：
> ```bash
> # 在服务器上添加/检查 swap
> sudo swapon --show
> # 若为空，执行：
> sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile \
>   && sudo mkswap /swapfile && sudo swapon /swapfile
> ```

### 验证部署

```bash
# API 健康检查
curl http://100.23.242.232/api/health
# 预期：{"status":"ok","timestamp":"..."}

# 检查容器状态
ssh -i ~/.ssh/course-manager-key.pem ec2-user@100.23.242.232 \
  "docker-compose -f ~/course-manager/docker-compose.prod.yml ps"
```

### Docker Compose 常用命令

```bash
# 在服务器上操作（先 SSH 进去）
cd ~/course-manager

# 查看容器状态
docker-compose -f docker-compose.prod.yml ps

# 查看实时日志
docker-compose -f docker-compose.prod.yml logs -f

# 查看 API 日志
docker-compose -f docker-compose.prod.yml logs -f api

# 重启单个服务
docker-compose -f docker-compose.prod.yml restart api

# 停止所有服务
docker-compose -f docker-compose.prod.yml down

# 重建并启动（代码更新后）
docker-compose -f docker-compose.prod.yml up -d --build
```

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
    "AllowedOrigins": ["http://100.23.242.232", "http://localhost:5173"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

4. 在服务器 `apps/api/.env` 中填入 R2 凭据（见[环境变量说明](#环境变量说明)）

> **未配置 R2 时**：API 以 stub 模式运行，上传请求会返回错误，其余功能正常。

### 上传流程（Presigned URL 直传）

```
浏览器 ──1. 请求 presign──> API ──2. 生成 presigned PUT URL──> R2
浏览器 ──3. 直接 PUT 文件──────────────────────────────────────> R2
浏览器 ──4. confirm 元数据──> API ──5. 写入 PostgreSQL
```

API 服务器不处理文件内容，仅生成签名 URL 和保存元数据，不影响服务器带宽。

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

### Q: SSH 连接被拒绝（Permission denied）？

EC2 实例首次创建时，`authorized_keys` 由 cloud-init 自动配置。若丢失，可通过以下步骤恢复：

1. 停止实例
2. 修改 user data 为以下脚本：
```bash
#!/bin/bash
mkdir -p /home/ubuntu/.ssh
echo "ssh-rsa <你的公钥>" > /home/ubuntu/.ssh/authorized_keys
chmod 700 /home/ubuntu/.ssh
chmod 600 /home/ubuntu/.ssh/authorized_keys
chown -R ubuntu:ubuntu /home/ubuntu/.ssh
```
3. 启动实例（cloud-init 会执行脚本）

### Q: `pnpm install` 失败？

确保 pnpm 版本为 9.x：

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

### Q: 数据库连接失败？

1. 确认 `db` 容器正常运行：`docker-compose -f docker-compose.prod.yml ps`
2. 确认 `DATABASE_URL` 使用 Docker 内网地址：`postgresql://postgres:postgres@db:5432/course_manager`
3. 检查用户名、密码是否与 `docker-compose.prod.yml` 中 `POSTGRES_*` 变量一致

### Q: 前端请求 API 返回 CORS 错误？

检查后端 `CORS_ORIGIN` 是否包含前端的实际域名：

```env
CORS_ORIGIN=http://100.23.242.232
```

### Q: 构建时 OOM（内存不足）？

t2.micro 仅 1GB 内存。检查并开启 swap：

```bash
sudo swapon --show
# 若为空，执行：
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Q: JWT Token 过期？

当前 JWT 未设置过期时间。生产环境建议在 `apps/api/src/routes/auth.ts` 中添加 `expiresIn` 配置。

### Q: 如何添加新的数据库迁移？

在 `apps/api/sql/` 下创建新文件，按编号递增命名（如 `005_xxx.sql`），然后在生产数据库中手动执行：

```bash
docker-compose -f docker-compose.prod.yml exec db \
  psql -U postgres -d course_manager -f /path/to/005_xxx.sql
```
