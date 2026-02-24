---
name: claude-code-workflow
description: 软件开发生命周期工作流技能。根据关键词触发五种模式：新增TODO、新增需求、按优先级开发、测试功能、回归测试。
---

# Claude Code 项目工作流

## 概述

本技能根据用户给出的关键词，执行固定的项目开发流程。共有五种模式：

| 关键词 | Slash Command | 模式 | 说明 |
|--------|---------------|------|------|
| `【新增TODO】` | `/new-todo` | 新增TODO | 创建 TODO 文档到 PRD/，标注优先级 |
| `【新增需求】` | `/new-requirement` | 新增需求 | 收集需求、写PRD文档、提交git |
| `【按优先级开发】` | `/dev-priority` | 开发模式 | 按优先级循环开发，直到全部完成 |
| `【测试功能】` | `/test-feature` | 测试模式 | 全量测试，问题自动生成 TODO |
| `回归测试` | — | 回归测试模式 | 全量测试、排查问题、更新TODO |

---

## 约定

### 目录结构
- PRD/需求/TODO 文档：`PRD/`
- 已完成的文档归档：`PRD/archived/`

### 文件命名规则

**需求文件：**
```
(状态)-(需求名字)-YYYYMMDD.md
```
状态枚举：`未开始` / `开发中` / `已开发` / `已部署`

**TODO 文件：**
```
TODO-(标题简写)-YYYYMMDD.md
```

### 优先级定义

| 级别 | 含义 | 示例 |
|------|------|------|
| **P0** | 核心功能不可用，阻断用户流程 | 登录失败、选课报错 |
| **P1** | 功能异常但有 workaround，或重要体验问题 | 显示错误、数据不一致 |
| **P2** | UI 细节、优化项、非紧急改进 | 对齐偏差、文案修改 |

### Commit Message 规范
```
<类型>(<范围>): <简短描述>
```

类型：`feat` / `fix` / `test` / `docs` / `chore` / `refactor`

---

## 模式一：新增 TODO

**触发：** 用户消息包含 `【新增TODO】` 或执行 `/new-todo`

详细流程见 `.claude/commands/new-todo.md`

**摘要：** 与用户对话了解问题 → 确认 → 创建 TODO 文件到 `PRD/` → 提交 git

---

## 模式二：新增需求

**触发：** 用户消息包含 `【新增需求】` 或执行 `/new-requirement`

详细流程见 `.claude/commands/new-requirement.md`

**摘要：** 收集需求 → 确认 → 分析技术方案 → 创建 PRD 文件到 `PRD/` → 提交 git

---

## 模式三：按优先级开发

**触发：** 用户消息包含 `【按优先级开发】` 或执行 `/dev-priority`

详细流程见 `.claude/commands/dev-priority.md`

**摘要（循环流程）：**
```
┌─→ 扫描 PRD/ 下未归档的 TODO/需求
│   ├─ 无 → 全部完成，结束
│   └─ 有 → 按优先级排序，取最高的一个
│       ↓
│   开发 → 本地测试 → 提交 → 部署 → 回归 → 归档到 PRD/archived/
│       ↓
└── 重复
```

---

## 模式四：测试功能

**触发：** 用户消息包含 `【测试功能】` 或执行 `/test-feature`

详细流程见 `.claude/commands/test-feature.md`

**摘要：** 运行全量测试（单元 + E2E + 类型检查）→ 汇总结果 → 为每个问题创建 TODO 文件 → 提交 → 询问是否进入开发模式修复

---

## 模式五：回归测试

**触发：** 用户消息包含 `回归测试`

### 流程

**步骤 1 — 运行全量测试**

```bash
pnpm test -- --reporter=verbose
pnpm typecheck
cd apps/web && pnpm e2e
```

记录通过数量、失败数量、失败的测试名称。

**步骤 2 — 分析失败原因**

对于每个失败的测试：
- 查看错误信息和堆栈
- 定位问题代码
- 分析根本原因

**步骤 3 — 关联历史需求**

查看 `PRD/` 和 `PRD/archived/` 目录，找到与失败相关的需求文件。

**步骤 4 — 记录问题**

为每个问题创建 TODO 文件（同测试模式步骤 5）。

**步骤 5 — 提交并询问**

提交 TODO 文件后，询问用户是否进入【按优先级开发】修复问题。

---

## 部署约定

本项目部署到 **EC2 (IP: 100.23.242.232)** via Docker Compose：

```bash
# 构建 → 传输 → 启动
docker compose -f docker-compose.prod.yml build
docker save course-manager-web course-manager-api | \
  ssh -i ~/.ssh/course-manager-key.pem ec2-user@100.23.242.232 'docker load'
scp docker-compose.prod.yml ec2-user@100.23.242.232:~/course-manager/
ssh -i ~/.ssh/course-manager-key.pem ec2-user@100.23.242.232 \
  "cd ~/course-manager && docker compose -f docker-compose.prod.yml up -d"

# 验证
curl http://100.23.242.232/api/health
```

**注意：** t2.micro 内存有限，如 build 失败先运行 `docker builder prune -af`

---

## 注意事项

- 每个步骤完成后简要告知用户进度
- 遇到不确定的情况先读取项目文件，不要猜测
- 所有 git 操作前检查 `git status`
- 部署前必须确认用户同意
