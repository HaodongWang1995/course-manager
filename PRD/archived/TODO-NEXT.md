# TODO: Next Sprint

> 创建时间：2026-02-20
> 最后更新：2026-02-20

---

## 1. 内部链接统一使用 TanStack Router `<Link>` 组件

**优先级**：🟡 MEDIUM
**状态**：✅ Done

**修复内容**：
- `packages/ui` 新增 `@tanstack/react-router` 依赖
- `packages/ui/src/components/sidebar.tsx` — `<a href>` → `<Link to>`
- `packages/ui/src/components/bottom-nav.tsx` — `<a href>` → `<Link to>`
- `apps/web/src/routes/(app)/student/feedback.$courseId.tsx` — 2 处 `<a href="/student">` → `<Link to="/student">`
- `landing.tsx` 中的 `#hash` 锚点保留为 `<a href>`（页内跳转，非路由）

---

## 2. 日历页面修复：课程日期偏移 + 周/日视图不显示课程

**优先级**：🔴 HIGH
**状态**：✅ Done

**修复内容**：
- 新增 `parseLocalTime()` 工具函数：解析 `start_time` 时剥离 `Z` / `±HH:MM` 后缀，防止 UTC→本地时间转换导致日期偏移
- 将所有 `new Date(s.start_time)` 替换为 `parseLocalTime(s.start_time)`
- `weekEvents` 过滤器由 `Math.round` 改为 `Math.floor`，修复日期边界计算

---
