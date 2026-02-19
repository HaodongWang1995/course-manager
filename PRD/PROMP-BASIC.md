I am making a Todoist clone. I want it to have the following features

**不同用户的操作需求：** 
老师：创建课程（名称、简介、价格、日程）、编辑/下架课程、审核报名；
学生：浏览课程列表、查看课程详情与日程、搜索筛选、报名申请与状态查询。

For the tech stack, please use

- tanstack router and React
- tanstack query for request
- tanstack form for form logic and form component for reusebility
- @lukemorales/query-key-factory to manage tanstack query query key
- Follow figma design to create ui, as same as possible
- Write PC / h5 layout ,and reuse the layout for all pages as possible.
- aws Postgres for the database
- TypeScript
- zod for form validation
- Oxlint - please use context7 to get the updated doc and best practice
- oxfmt
- Vitest for testing
- Playwright
- Editorconfig

Please:

- include decent coverage of tests and sane linting and code formatting.
- use Playwright MCP server to test that UI is styled correctly and interactions work as planned
- use Context7 liberally to make sure you have the latest docs for various libraries.
- prepare this to be hosted on GitHub. Maintain a useful README for documentation, and mark the project as being Apache 2.0.
- prepare this to be deployed to AWS afterwards.