# 傻瓜式：在阿里云 ECS 上部署本仓库（个人主页）

你只要：**有一台阿里云 ECS、能 SSH 登录、按顺序复制命令**。  
本教程**只推荐 Ubuntu 22.04 镜像**（命令最简单）。若你选的是 Alibaba Cloud Linux，请改用 `yum/dnf` 自行安装对应包，或重装为 Ubuntu 22.04。

---

## 〇、你会得到什么

- 浏览器访问 **`http://你的公网IP`**（或以后你的域名）→ 打开个人主页  
- 简历数据来自本机运行的 **FastAPI**，经 **Nginx** 把 `/api` 转到后端  
- 前端构建时**不要设置** `VITE_API_URL`（保持默认空），这样网页请求的是同域 `/api/...`，不用折腾跨域  

---

## 一、在阿里云买一台 ECS（5 分钟）

1. 打开 [阿里云 ECS 控制台](https://ecs.console.aliyun.com) → **创建实例**（或「购买」）。  
2. **地域**：离你近的即可。  
3. **镜像**：务必选 **Ubuntu 22.04 64 位**（公共镜像里搜 Ubuntu）。  
4. **规格**：1 核 2 GB 可以跑通学习用站点。  
5. **公网 IP**：勾选 **分配公网 IPv4 地址**（按流量或按带宽均可，否则你无法从外网访问）。  
6. **安全组**：创建或选择时，入方向至少要有：**22、80、443**（没有就后面在控制台加上）。  
7. **登录凭证**：二选一  
   - **密钥对**（推荐）：下载 `.pem`，SSH 时用；或  
   - **密码**：自己设一个 root 密码（控制台可重置）。  
8. 下单付款，等实例 **运行中**，记下 **公网 IP**（例如 `47.xxx.xxx.xxx`）。

---

## 二、放行端口（必须）

1. 控制台 → **云服务器 ECS** → 你的实例 → **安全组** → 点进规则。  
2. **入方向** 确认有：  

| 端口 | 用途   |
|------|--------|
| 22   | SSH 远程 |
| 80   | 网站 HTTP |
| 443  | HTTPS（以后） |

没有就 **手动添加**：端口范围填 `22/22`、`80/80`、`443/443`，授权对象 `0.0.0.0/0`（仅学习可用；生产可再收紧）。

---

## 三、登录到你的服务器（任选一种）

**方式 A：你本机 Windows 自带 PowerShell**

```powershell
ssh root@你的公网IP
```

第一次会问 `yes/no`，输入 `yes`。若用密钥：

```powershell
ssh -i "C:\路径\你的密钥.pem" root@你的公网IP
```

**方式 B：阿里云网页**  
控制台 → 实例 → **远程连接** → **Workbench** 或 **VNC**（按页面提示操作）。

登录成功后，后面所有命令都在 **服务器里的黑色终端** 执行。

---

## 四、一键安装软件（Ubuntu 22.04）

下面整段复制粘贴执行（会装 Git、Nginx、Python、Certbot、Node 20）：

```bash
apt update && apt install -y git nginx python3 python3-venv python3-pip certbot python3-certbot-nginx curl
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v
npm -v
```

看到 `node -v` 有版本号即可。

---

## 五、下载你的项目代码

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/songhaoyang2004/Personal_webpage.git personal-webpage
cd personal-webpage
```

若提示仓库不存在：确认 GitHub 上仓库名、是否公开；私有仓库需配置 [GitHub Token](https://github.com/settings/tokens) 或使用 SSH 密钥克隆。

---

## 六、安装并启动后端（FastAPI + Gunicorn）

```bash
cd /var/www/personal-webpage/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
deactivate
```

把服务交给 systemd（开机自启）：

```bash
sudo cp /var/www/personal-webpage/deploy/personal-webpage.service.example /etc/systemd/system/personal-webpage.service
sudo systemctl daemon-reload
sudo systemctl enable --now personal-webpage
```

若启动失败，多半是权限：先给目录属主（再启动一次）：

```bash
sudo chown -R www-data:www-data /var/www/personal-webpage
sudo systemctl restart personal-webpage
```

**自检（必须在服务器里成功）：**

```bash
curl -s http://127.0.0.1:8000/health
```

应输出：`{"status":"ok"}`。  
若不是，看日志：

```bash
sudo journalctl -u personal-webpage -e --no-pager
```

---

## 七、构建前端（不要设 VITE_API_URL）

```bash
cd /var/www/personal-webpage/frontend
npm ci
npm run build
```

构建完成后，静态文件在：`/var/www/personal-webpage/frontend/dist`。

---

## 八、配置 Nginx（网站入口）

### 8.1 复制配置文件

```bash
sudo cp /var/www/personal-webpage/deploy/nginx-site.conf.example /etc/nginx/sites-available/personal-webpage
```

### 8.2 改两处（二选一）

**情况 A：你暂时只有公网 IP，没有域名**

```bash
sudo nano /etc/nginx/sites-available/personal-webpage
```

把文件里的：

```nginx
    listen 80;
    server_name your-domain.com www.your-domain.com;
```

改成：

```nginx
    listen 80 default_server;
    server_name _;
```

保存退出（nano：`Ctrl+O` 回车，`Ctrl+X`）。

然后删掉 Ubuntu 默认站点（否则会抢 80 端口）：

```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

**情况 B：你已有域名**（且已在阿里云 **域名解析** 把域名 **A 记录** 指到这台 ECS 公网 IP）

把 `server_name` 改成你的域名，例如：

```nginx
    server_name example.com www.example.com;
```

### 8.3 启用站点并重载

```bash
sudo ln -sf /etc/nginx/sites-available/personal-webpage /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 九、用浏览器验收

在电脑浏览器打开：

```text
http://你的公网IP
```

应能看到个人主页；简历等接口应能加载。  
若页面能开但简历不显示：再执行一次 `curl -s http://127.0.0.1:8000/health`，并检查安全组是否放行 **80**。

---

## 十、HTTPS（可选，建议有域名再做）

1. 域名 **A 记录** 已指向本机公网 IP。  
2. 第八步里 **不要用** `server_name _` 抢默认，应用**你的域名** 的 `server_name`。  
3. 在服务器执行（把域名换成你的）：

```bash
sudo certbot --nginx -d example.com -d www.example.com
```

按提示选 **重定向 HTTP 到 HTTPS**。证书会自动续期。

---

## 十一、以后更新网站内容

在服务器执行：

```bash
cd /var/www/personal-webpage
sudo git pull
cd frontend && npm ci && npm run build
sudo systemctl restart personal-webpage
sudo nginx -t && sudo systemctl reload nginx
```

你在 GitHub 上改简历（`backend/main.py`）并 `git push` 后，在服务器 `git pull` 再按上面重启即可。

---

## 常见问题（一眼对照）

| 现象 | 怎么办 |
|------|--------|
| SSH 连不上 | 看安全组是否放行 22；实例是否运行；IP 是否抄错 |
| 浏览器打不开网站 | 安全组是否放行 **80**；`sudo systemctl status nginx` |
| 能开网页，简历加载失败 | `curl http://127.0.0.1:8000/health`；`sudo systemctl status personal-webpage` |
| 只显示 Nginx 欢迎页 | 是否已 `rm default` 且 `sites-enabled` 已链到 `personal-webpage` |
| 502 Bad Gateway | 后端没起来，看 `journalctl -u personal-webpage -e` |

---

## 和「Vercel + Railway」的差别（心里有个数）

- **阿里云单机**：前后端同域名，**不需要** `VITE_API_URL`。  
- **Vercel + Railway**：前端构建时要填 `VITE_API_URL` 指向后端地址。  

你现在按本文部署，走的就是**单机同域**方案。
