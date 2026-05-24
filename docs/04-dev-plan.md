# 开发执行计划

## 阶段一：MVP核心功能（网页版）
### Step 1 — 项目初始化
- [ ] Next.js + TypeScript + Tailwind 项目搭建
- [ ] 蓝色主题配置
- [ ] 基础布局（导航栏 + 侧边栏 + 响应式）
- [ ] shadcn/ui 基础组件安装

### Step 2 — 数据库与后端基础
- [ ] Supabase 项目创建
- [ ] 数据库表设计（chapters, sections, knowledge_points, questions, user_answers, study_progress）
- [ ] Prisma schema 定义
- [ ] API 基础框架

### Step 3 — PDF处理管线
- [ ] PDF上传页面
- [ ] pdf-parse 文本提取
- [ ] AI API 调用（DeepSeek/OpenAI）结构化文本
- [ ] 解析结果存储到数据库

### Step 4 — 知识框架展示
- [ ] 树形组件（章 → 节 → 知识点）
- [ ] 展开/收起交互
- [ ] 知识点详情查看

### Step 5 — 基础刷题
- [ ] 章节选择器
- [ ] 逐题展示 → 作答 → 答案+解析
- [ ] 做题记录存储

### Step 6 — 首页
- [ ] 备考指南展示
- [ ] 教材变动展示
- [ ] 学习统计概览

## 阶段二：智能功能
### Step 7 — 学习分析引擎
- [ ] 知识点掌握度计算
- [ ] 薄弱点识别
- [ ] 智能出题算法

### Step 8 — 搜索功能
- [ ] 知识点全文搜索
- [ ] 题目搜索

## 阶段三：体验优化 + 小程序
### Step 9 — UI与性能打磨
- [ ] PWA支持
- [ ] 加载性能优化
- [ ] 动画与过渡

### Step 10 — 微信小程序
- [ ] 小程序注册
- [ ] 小程序端开发
- [ ] 审核上线
