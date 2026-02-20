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

## 2. 日历页面修复：当天日期错误 + 日/周视图不显示当前课程

**优先级**：🔴 HIGH
**背景**：Teacher 日历页（`/teacher/calendar`）存在两个 Bug：

### Bug 1 — 当天日期高亮显示不正确
- 月视图或周视图中，"今天"的日期格显示有误（可能高亮了错误的日期，或未高亮今天）
- 原因排查方向：`isToday()` 判断逻辑、时区偏差、日期对象构造方式

### Bug 2 — 日视图 / 周视图不显示当前已有的课程
- 切换到"Day"或"Week"视图后，课程安排（schedules）没有渲染到对应的时间格内
- 数据来源：`useTeacherSchedule()` hook → `GET /api/teachers/schedule`
- 原因排查方向：时间匹配逻辑（是否用 `start_time` 对比当天日期）、视图切换时数据没有正确过滤/渲染

**验收标准**：
- 月视图今天的格子有明显高亮
- 周视图当周每天显示对应的课程卡片
- 日视图当天显示所有课程，时间轴位置正确

---
