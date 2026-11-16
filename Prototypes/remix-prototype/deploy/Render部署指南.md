# Render.com 免费部署指南

## 前置条件
1. 一个 **GitHub 账号**（没有的话去 https://github.com 注册）
2. 把项目上传到 GitHub

---

## 第一步：上传项目到 GitHub

### 方法 A：用 GitHub 网页上传（推荐）

1. 打开 https://github.com/new
2. 填写仓库名：`ai-clinical-prototype`
3. 设为 **Public**（免费版必须公开）
4. 点击 **Create repository**
5. 点击 **uploading an existing file**
6. 把整个 `remix-prototype` 文件夹**拖进去**（排除 `node_modules` 文件夹）
7. 点击 **Commit changes**

### 方法 B：用 Git 命令行上传

```bash
cd remix-prototype

# 初始化 Git
git init
git add .
git commit -m "Initial commit"

# 关联 GitHub（替换为你的用户名）
git remote add origin https://github.com/你的用户名/ai-clinical-prototype.git
git branch -M main
git push -u origin main
```

---

## 第二步：部署到 Render

1. 打开 https://render.com
2. 点击 **Get Started** → 用 **GitHub 账号登录**
3. 登录后点击 **New +** → **Web Service**
4. 选择 **Build and deploy from a Git repository** → **Next**
5. 找到你的 `ai-clinical-prototype` 仓库 → 点击 **Connect**

### 配置页面：

| 配置项 | 填写内容 |
|--------|---------|
| **Name** | `ai-clinical-prototype`（随意） |
| **Region** | 选 `Singapore` 或 `Oregon`（离中国近选新加坡） |
| **Branch** | `main` |
| **Root Directory** | 留空 |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** |

### 添加环境变量：

点击 **Environment Variables** → **Add Environment Variable**：

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DASHSCOPE_API_KEY` | `sk-a0e4986a69574ae3a05bd019a26513c4` |

4. 点击 **Create Web Service**
5. 等待部署完成（约 3-5 分钟）
6. 部署成功后会生成一个 URL：`https://ai-clinical-prototype.onrender.com`

---

## 第三步：访问

打开 Render 给的 URL 即可使用：
- ✅ AI Draft 完整功能（参数收集 + LLM 生成草稿）
- ✅ AI Monitoring（UI 展示）
- ✅ 公网访问，无需内网

---

## 常见问题

### Q: 第一次访问很慢？
Render 免费版闲置 15 分钟后会休眠，首次访问需要 30-60 秒冷启动。

### Q: API Key 安全吗？
环境变量只在服务器端可见，别人无法通过网页看到你的 Key。

### Q: 想更新代码？
直接推送到 GitHub 的 `main` 分支，Render 会自动重新部署。

### Q: 免费版有什么限制？
- 750 小时/月（够一个服务 24 小时运行）
- 512 MB 内存（够用）
- 闲置 15 分钟后休眠
