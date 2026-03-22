# 个人主页

前端（Vite）+ 后端（FastAPI）。可 **分离部署**（Vercel + Railway）或 **单机部署**（阿里云 ECS + Nginx），详见 **[deploy/ALIYUN.md](deploy/ALIYUN.md)**。

## 仓库结构

| 目录 | 说明 |
|------|------|
| `frontend/` | 页面与样式，部署到 **Vercel** |
| `backend/` | FastAPI 接口，部署到 **Railway** |

## 本地开发

**1. 后端**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**2. 前端**（另一终端，需安装 [Node.js](https://nodejs.org/) 18+）

```bash
cd frontend
npm install
npm run dev
```

`vite.config.js` 已将 `/api` 代理到 `http://127.0.0.1:8000`，本地无需配置 `VITE_API_URL`。

## 部署到 Railway（后端）

1. 在 [Railway](https://railway.app) 新建项目，选择 **Deploy from GitHub**（或本仓库）。
2. 在 **Settings → Root Directory** 设为 `backend`。
3. **Start Command**（若未自动识别 `Procfile`）：  
   `uvicorn main:app --host 0.0.0.0 --port $PORT`  
   Railway 会注入 `PORT` 环境变量。
4. 部署完成后，在 **Deployments → 你的服务 → Networking** 生成公网域名，例如 `https://xxx.up.railway.app`。记下该 **HTTPS 根地址**（无末尾 `/`）。

可选：在 Railway 里设置环境变量 `CORS_ORIGINS`，值为你的自定义域名（如 `https://example.com`），多个用英文逗号分隔。Vercel 默认域名 `*.vercel.app` 已由后端正则放行；若你为前端绑定了**自定义域名**，请把该 `https://…` 地址加入 `CORS_ORIGINS`。

## 部署到 Vercel（前端）

1. 在 [Vercel](https://vercel.com) 导入同一仓库。
2. **Root Directory** 设为 `frontend`。
3. **Environment Variables**（生产环境）新增：

   - **Name**：`VITE_API_URL`  
   - **Value**：你的 Railway 公网根地址，例如 `https://xxx.up.railway.app`（不要加 `/`）

4. 保存后重新部署。若先部署了前端再拿到 Railway 地址，改完环境变量后**必须 Redeploy** 一次，Vite 才会把 `VITE_API_URL` 打进构建产物。

## 仅用 Docker 跑后端

```bash
docker compose up -d --build
```

默认 `http://localhost:8000`，仅 API，不含前端静态页面。

## API 摘要

| 路径 | 说明 |
|------|------|
| `GET /health` | 健康检查 |
| `GET /api/resume` | 完整简历 JSON |
| `GET /api/projects` | 项目列表 |
| `GET /api/skills` | 技能 |
| `GET /api/contact` | 邮箱（及可选电话） |
| `GET/POST /api/message` | 留言（内存存储） |

## 阿里云 ECS（单服务器 + Nginx）

在同一台机器上提供页面与 API：**不要设置** `VITE_API_URL`，用 Nginx 把 `/api` 反代到本机 Gunicorn。完整步骤与示例配置见 **[deploy/ALIYUN.md](deploy/ALIYUN.md)**（含 `deploy/nginx-site.conf.example`、`deploy/personal-webpage.service.example`）。

## 修改简历内容

编辑 `backend/main.py` 中的 `resume_data`，再重新部署对应环境。
