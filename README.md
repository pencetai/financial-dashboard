# 金融仪表台

金融仪表台测试版，包含：

- 全球金融监控
- 关注股票新闻热榜
- 选股策略工作台
- 轻量 Node 后端 API
- React/Vite 前端，视觉风格合并自 Lovable 原型

## 结构

```text
src/                 React 前端源码
dist/                前端构建产物，不提交 Git
server.js            后端 HTTP 入口与 API
server/config.js     后端配置、数据目录、刷新间隔
server/agent/        后续 Agent 新闻分析入口
data/store.json      运行时缓存，不提交 Git
lovable-export/      Lovable 原始源码备份，不提交 Git
```

前端只调用 `/api/...`，不保存 API Key 或 Agent token。
后端负责新闻获取、过滤、去重、排序、缓存、权限控制和后续 Agent 调用。

## 本地运行

首次安装：

```bash
npm install
```

开发前端：

```bash
npm run dev
```

启动后端：

```bash
npm start
```

生产构建：

```bash
npm run build
npm start
```

构建后，`server.js` 会优先发布 `dist/` 中的 React 前端。

## API

```text
GET  /api/market/overview
GET  /api/watch/news
POST /api/news/search
GET  /api/watchlist
POST /api/watchlist
GET  /api/auth/me
POST /api/auth/login
POST /api/auth/logout
POST /api/strategy/hot-money
```

## 服务器部署

```bash
cd /var/www/financial-dashboard
git pull
npm install
npm run build
sudo systemctl restart financial-dashboard
```

如果还没有 systemd 服务，可以先用：

```bash
npm start
```

## Nginx

React 构建后建议把 Nginx 静态目录指向 `dist`：

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/financial-dashboard/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

更新 Nginx 后：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 密钥原则

- 不要把真实 token 写入前端
- 不要把真实 token 提交到 GitHub
- Agent/API Key 只放在服务器环境变量中
