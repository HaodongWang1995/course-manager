# 按优先级开发

扫描 PRD/ 目录下所有未完成的 TODO 和需求文档，按优先级逐个开发，循环直到全部完成。

## 循环流程

```
┌─→ 扫描 PRD/ 下未归档的 TODO/需求
│   ├─ 无文件 → 结束，告知用户"全部完成"
│   └─ 有文件 → 按优先级排序，取最高优先级的一个
│       ↓
│   开发 → 本地测试 → 提交 → 部署 → 回归 → 归档
│       ↓
└── 回到顶部，继续扫描
```

## 详细步骤

### 步骤 1 — 扫描并排序

1. 读取 `PRD/` 目录下所有 `.md` 文件（排除 `archived/` 子目录和非 TODO/需求文件）
2. 解析每个文件的优先级（P0 > P1 > P2）和状态
3. 过滤掉状态为「已开发」「已部署」的文件
4. 按优先级排序，同优先级按创建日期从早到晚
5. 向用户展示列表：

```
【待开发任务】（共 N 个）
1. [P0] {标题} — {文件名}
2. [P1] {标题} — {文件名}
3. [P2] {标题} — {文件名}

即将开始开发第 1 项：{标题}
```

### 步骤 2 — 开发功能

1. 读取该 TODO/需求文件，理解需求内容和验收标准
2. 分析当前项目结构，确认涉及的文件
3. 按验收标准实现功能：
   - 遵循现有代码风格和架构
   - 使用 i18n 处理所有用户可见文案
   - 组件文件不超过 400 行
4. 更新文件状态为「开发中」

### 步骤 3 — 本地测试

运行与该功能相关的测试：

```bash
# 单元/集成测试
pnpm test

# 类型检查
pnpm typecheck
```

如果测试失败，修复后重新测试，直到全部通过。

### 步骤 4 — 提交 git

```bash
git add .
git commit -m "feat({功能名}): {简短描述}"
```

### 步骤 5 — 部署

部署到 EC2：

```bash
# 本地构建镜像并推送
docker compose -f docker-compose.prod.yml build
docker save course-manager-web course-manager-api | ssh -i ~/.ssh/course-manager-key.pem ec2-user@100.23.242.232 'docker load'
scp docker-compose.prod.yml ec2-user@100.23.242.232:~/course-manager/
ssh -i ~/.ssh/course-manager-key.pem ec2-user@100.23.242.232 \
  "cd ~/course-manager && docker compose -f docker-compose.prod.yml up -d"

# 如有 DB 迁移
cat apps/api/sql/00X_xxx.sql | ssh -i ~/.ssh/course-manager-key.pem ec2-user@100.23.242.232 \
  "docker exec -i course-manager-postgres-1 psql -U postgres -d coursemanager"

# 验证
curl http://100.23.242.232/api/health
```

### 步骤 6 — 回归测试

使用 Playwright MCP 在线上环境进行基本回归：
1. 打开线上地址，验证新功能正常工作
2. 检查相关页面未被破坏
3. 如发现回归问题，立即修复并重新部署

### 步骤 7 — 归档

1. 在 TODO/需求文件中：勾选所有验收标准，更新状态为「已完成」
2. 将文件移入 `PRD/archived/`：
   ```bash
   mv PRD/{文件名} PRD/archived/
   ```
3. 提交归档：
   ```bash
   git add PRD/
   git commit -m "docs: 归档已完成的 {标题}"
   ```

### 步骤 8 — 循环

回到步骤 1，重新扫描 `PRD/` 目录。如果还有未完成的任务，继续下一个；如果没有了，告知用户：

```
【全部完成】
本次共完成 N 个任务：
1. ✅ {标题1}
2. ✅ {标题2}

所有 TODO 和需求已归档到 PRD/archived/。
```
