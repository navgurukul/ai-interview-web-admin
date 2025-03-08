# AI Interview 后台管理系统

这是一个使用 NextJS 15、React 19 和 Ant Design 构建的 AI Interview 后台管理系统。

## 功能特点

- **用户管理**：支持用户的增删改查
- **职位管理**：支持职位的增删改查
- **题目管理**：支持题目的增删改查
- **系统设置**：可自定义系统名称、Logo、主题和语言

## 技术栈

- NextJS 15 (App Router)
- React 19
- Ant Design
- TypeScript

## 如何运行

1. 安装依赖：
   ```bash
   npm install
   ```

2. 创建环境变量文件 `.env.local`：
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 构建生产版本：
   ```bash
   npm run build
   ```

5. 启动生产服务器：
   ```bash
   npm start
   ```

## 系统说明

### 用户管理

用户管理页面提供以下功能：
- 查看用户列表
- 添加新用户
- 编辑用户信息
- 删除用户

用户具有以下属性：
- 用户名 (user_name)
- 员工ID (staff_id)
- 邮箱 (email)
- 角色 (role)：管理员(1)、普通用户(2)、访客(0)
- 状态 (status)：激活(0)、未激活(1)

### 职位管理

职位管理页面提供以下功能：
- 查看职位列表
- 添加新职位
- 编辑职位信息
- 删除职位

职位具有以下属性：
- 职位名称 (job_title)
- 职位描述 (job_description)
- 技术技能 (technical_skills)
- 软技能 (soft_skills)
- 创建时间 (create_date)

### 题目管理

题目管理页面提供以下功能：
- 查看题目列表
- 添加新题目
- 编辑题目信息
- 删除题目

题目具有以下属性：
- 题目内容 (question)
- 参考答案 (answer)
- 考察点 (examination_points)
- 适用职位 (job_title)
- 语言 (language)：中文、英文
- 难度 (difficulty)：简单、中等、困难
- 题目类型 (type)：简答题、选择题、编程题

### 系统设置

系统设置页面允许管理员：
- 修改系统名称
- 设置系统Logo
- 选择界面主题（浅色、深色）
- 选择系统语言（中文、英文）

## API 集成

系统已集成后端 API，支持以下操作：

### 用户API
- 获取用户列表 (GET /api/v1/user)
- 获取单个用户 (GET /api/v1/user/:id)
- 创建用户 (POST /api/v1/user)
- 更新用户 (PUT /api/v1/user/:id)
- 删除用户 (DELETE /api/v1/user/:id)

### 职位API
- 获取职位列表 (GET /api/v1/job)
- 获取单个职位 (GET /api/v1/job/:id)
- 创建职位 (POST /api/v1/job)
- 更新职位 (PUT /api/v1/job/:id)
- 删除职位 (DELETE /api/v1/job/:id)

### 题目API
- 获取题目列表 (GET /api/v1/question)
- 获取单个题目 (GET /api/v1/question/:id)
- 创建题目 (POST /api/v1/question)
- 更新题目 (PUT /api/v1/question/:id)
- 删除题目 (DELETE /api/v1/question/:id)

API 响应格式为：
```json
{
  "code": "0",     // 0表示成功，其他表示错误码
  "message": "success",
  "data": {}       // 响应数据
}
``` 