# TODO: i18n 翻译缺失 — 附件上传区域和学生排序选项

> 创建时间：2026-02-25
> 优先级：P1
> 状态：待修复
> 来源：线上回归测试 (http://100.23.242.232)

---

## 问题描述

线上回归测试发现两处 i18n 翻译缺失，导致界面显示原始 key 或英文硬编码文本：

### 问题 1：教师课程详情 — 附件上传区域显示 "upload.prompt" / "upload.maxSize"

- **现象**：附件上传区域不显示中文提示，而是直接显示 i18n key 文本 `upload.prompt` 和 `upload.maxSize`
- **根因**：`pages/teacher/course-detail/index.tsx:176-177` 使用 `t("upload.prompt")` 和 `t("upload.maxSize")`，但 `t` 函数来自 `useTranslation("teacherCourseDetail")` 命名空间。`upload` key 定义在 `locales/zh.json` 根级别（第 170 行），而 `teacherCourseDetail` 命名空间（第 430 行）缺少对应的 `upload` 子对象。

### 问题 2：教师学生目录 — 排序选项硬编码英文

- **现象**：学生目录排序下拉菜单最后一项显示 "Sort by: Student ID"，其余选项已正确翻译
- **根因**：`pages/teacher/students/components/student-table.tsx:127` 硬编码了英文字符串，未使用 `t()` 函数

## 复现步骤

### 问题 1
1. 登录教师账号 (teacher@test.com)
2. 进入 课程 → 任意课程详情
3. 滚动到"课程附件"区域
4. 观察上传区域显示 `upload.prompt` 和 `upload.maxSize`

### 问题 2
1. 登录教师账号 (teacher@test.com)
2. 进入 学生 页面
3. 查看排序下拉菜单最后一项

## 涉及模块

- `apps/web/src/pages/teacher/course-detail/index.tsx` (第 176-177 行)
- `apps/web/src/pages/teacher/students/components/student-table.tsx` (第 127 行)
- `apps/web/src/locales/zh.json` (teacherCourseDetail 命名空间)
- `apps/web/src/locales/en.json` (teacherCourseDetail 命名空间)

## 任务清单

- [ ] 在 `teacherCourseDetail` 命名空间中添加 `upload` 子对象（zh.json + en.json）
- [ ] 将 student-table.tsx 中 "Sort by: Student ID" 替换为 `t("table.sort.id")` 并在 locale 文件 `teacherStudents` 命名空间中添加对应 key
- [ ] 重新构建并部署到线上验证
