# TODO: Next Sprint

> 创建时间：2026-02-20

---

## 1. 内部链接统一使用 TanStack Router `<Link>` 组件

**优先级**：🟡 MEDIUM
**背景**：部分页面内部跳转使用 `<a href>` 或 `window.location.href`，绕过了 TanStack Router 的客户端路由优化（预加载、状态保留、无整页刷新）。
**要求**：
- 全局搜索 `<a href=` 和 `window.location.href`，凡是跳转至站内路由的，替换为 `<Link to="...">` 组件
- `window.location.href = "/login"` 等认证跳转除外（发生在非 React 上下文，例如 `api/client.ts`）
- 确保替换后路由跳转行为一致，无页面闪烁

**涉及范围**：`apps/web/src/routes/` 下所有页面组件、`packages/ui/src/components/` 中含跳转的组件（如 sidebar、bottom-nav）

---

## 2. 日历页面修复：课程日期偏移 + 周/日视图不显示课程

**优先级**：🔴 HIGH
**背景**：Teacher 日历页（`/teacher/calendar`）存在两个 Bug：

### Bug 1 — 课程显示在错误日期（日期偏移）
- 课程实际在 20 号，但日历渲染到 21 号（或其他偏移日期）
- 根本原因：`start_time` 是 UTC ISO 字符串，`new Date(start_time)` 转为本地时间后 `.getDate()` 取的是本地日期，而月视图格子的日期是用另一种方式生成的，两者不一致导致错配
- 修复方向：统一使用本地时间（`toLocaleDateString` / `getFullYear/getMonth/getDate`）做日期匹配，不能混用 UTC 和本地时间

### Bug 2 — 周视图 / 日视图不渲染课程
- 切换到 Week 或 Day 视图后，时间轴上看不到任何课程卡片
- 数据已从 `useTeacherSchedule()` 拿到，但渲染逻辑中过滤条件（判断课程是否属于当天/当周）存在问题，导致所有课程都被过滤掉
- 修复方向：检查周/日视图中 `schedule.start_time` 与目标日期的比对逻辑，与 Bug 1 同样要统一时间处理方式

**验收标准**：
- 月视图中课程显示在正确日期格（与 `start_time` 本地日期一致）
- 周视图每列（每天）时间轴上显示对应的课程卡片
- 日视图当天时间轴显示所有课程，位置与时间对应

---
