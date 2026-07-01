# 金融仪表台

金融仪表台测试版，当前包含：

- 全球金融监控
- 关注股票新闻热榜
- 选股策略工作台
- 轻量 Node 后端 API

## 当前前后端边界

目前项目已经做了逻辑分层：

```text
index.html          前端页面结构
styles.css          前端样式
app.js              前端交互与 API 调用

server.js           后端 HTTP 入口，兼容当前部署方式
server/config.js    后端配置、数据目录、刷新间隔、密钥读取
server/agent/       后端 agent 分析入口，未来 OpenAI/Codex 调用放这里
data/store.json     运行时缓存，不提交到 Git
```

前端只调用自己的后端接口，不保存任何 API Key 或 agent token。

后端负责：

- 定时获取关注新闻
- 过滤、去重、排序、缓存新闻
- 后续调用 agent 分析新闻
- 管理登录、权限、使用次数
- 向前端提供 `/api/...` 数据接口

## 本地运行

```bash
npm start
```

访问：

```text
http://127.0.0.1:3000
```

测试账号：

```text
demo / demo123
```

## 环境变量

复制 `.env.example` 作为服务器环境变量参考。

重要原则：

- 不要把真实 token 写入 `app.js`
- 不要把真实 token 提交到 GitHub
- agent/API Key 只能放在服务器环境变量里

示例：

```bash
export OPENAI_API_KEY="your_key_here"
export WATCH_NEWS_REFRESH_MS=1800000
npm start
```

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
npm start
```

建议正式运行时用 systemd 管理 Node 服务。

```ini
[Unit]
Description=Financial Dashboard API
After=network.target

[Service]
WorkingDirectory=/var/www/financial-dashboard
ExecStart=/usr/bin/node /var/www/financial-dashboard/server.js
Restart=always
RestartSec=3
Environment=PORT=3000
Environment=WATCH_NEWS_REFRESH_MS=1800000

[Install]
WantedBy=multi-user.target
```

## Nginx

当前为了兼容已有部署，前端静态文件仍在项目根目录。Nginx 可以继续这样配置：

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/financial-dashboard;
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

后续如果要进一步拆分，可以把前端迁移到 `public/` 或独立 `frontend/`，同时把 Nginx root 改过去。
