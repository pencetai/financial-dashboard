# 金融仪表台

金融仪表台测试版，当前包含：

- 全球金融监控
- 关注新闻与影响分析
- 选股策略工作台
- 轻量 Node API 后端骨架

当前数据仍是模拟数据，但接口已经按后续接入真实行情、新闻搜索、Codex 分析和用户权限的方向预留。

## 本地运行

静态预览：

```bash
打开 index.html
```

带 API 运行：

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

## API

```text
GET  /api/market/overview
POST /api/news/search
GET  /api/watchlist
POST /api/watchlist
GET  /api/auth/me
POST /api/auth/login
POST /api/auth/logout
POST /api/strategy/hot-money
```

## 服务器部署

在 Ubuntu 服务器拉取代码：

```bash
cd /var/www/financial-dashboard
git pull
```

安装 Node.js 后运行：

```bash
npm start
```

建议正式运行时用 systemd 管理 Node 服务。

创建服务文件：

```bash
sudo nano /etc/systemd/system/financial-dashboard.service
```

填入：

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

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable financial-dashboard
sudo systemctl start financial-dashboard
sudo systemctl status financial-dashboard
```

## Nginx 配置

如果使用 Node 后端，推荐让 Nginx 代理 `/api`，同时继续托管前端文件：

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

检查并重载：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 后续真实接入

建议顺序：

1. 用免费行情源替换 `/api/market/overview` 的模拟数据。
2. 给行情接口加缓存和更新时间。
3. 用真实搜索/Codex 替换 `/api/news/search`。
4. 把 `data/store.json` 换成 SQLite 或 PostgreSQL。
5. 完善登录、用户关注列表和搜索次数限制。
