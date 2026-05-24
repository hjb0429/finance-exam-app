# CLAUDE.md — 中级财务管理考试智能学习平台

## 项目概述
面向中级财务管理考试的AI智能学习平台。支持网页端（PC + 手机）和微信小程序（后期），通过AI解析PDF教材生成知识框架和个性化题库。

## 核心目录结构
```
中级财务管理考试app/
├── finance-exam-app/     # 主项目代码 (Next.js)
├── docs/                 # 项目文档
│   ├── 01-requirements.md    # 需求文档
│   ├── 02-tech-stack.md      # 技术栈文档
│   ├── 03-design-spec.md     # 设计规范（颜色、字体、布局、组件）
│   └── 04-dev-plan.md        # 开发执行计划（分阶段步骤）
├── devlog/               # 开发日志（每日自动记录）
└── CLAUDE.md             # 本文件
```

## 开发规范

### 技术栈
- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- shadcn/ui 组件库
- Supabase (PostgreSQL + Storage + Auth)
- Prisma ORM
- AI: DeepSeek / OpenAI API

### 代码风格
- TypeScript strict mode
- React Server Components 优先，需要交互时使用 Client Components
- 使用 src/ 目录结构
- API 路由放在 src/app/api/ 下

### 设计规范参考
- 颜色、字体、布局、组件风格详见：docs/03-design-spec.md
- 淡蓝色主色调：#1976D2 / #E3F2FD / #F0F7FF

### 开发流程
1. 每步只做一个功能模块
2. 完成一个模块、验证通过后，再进行下一个
3. 每日更新 devlog/ 记录完成和待办事项
4. 重大变更前查阅 docs/ 中的对应文档

### 注意事项
- 项目文件夹含中文，npm 命令需在 finance-exam-app/ 子目录下执行
- 优先使用免费服务额度 (Supabase免费计划、Vercel免费计划)
- 初期不做用户认证系统，单用户模式
- 手机端响应式优先
