# 金融仪表台

一个静态网页测试版金融仪表台，当前包含：

- 全球金融监控
- 关注新闻与影响分析
- 选股策略工作台

当前版本使用模拟数据，后续可接入服务器端行情、新闻搜索、Codex 分析和权限控制。

## 本地预览

直接用浏览器打开 `index.html` 即可。

## 上传到 GitHub

在本地项目目录执行：

```bash
git init
git add index.html styles.css app.js README.md .gitignore
git commit -m "Initial financial dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/YOUR_REPO.git
git push -u origin main
```

把 `YOUR_NAME/YOUR_REPO` 换成你的 GitHub 仓库地址。

## 服务器部署

在 Ubuntu 服务器执行：

```bash
sudo apt update
sudo apt install -y nginx git
sudo mkdir -p /var/www/financial-dashboard
sudo chown -R $USER:$USER /var/www/financial-dashboard
git clone https://github.com/YOUR_NAME/YOUR_REPO.git /var/www/financial-dashboard
```

创建 Nginx 配置：

```bash
sudo nano /etc/nginx/sites-available/financial-dashboard
```

填入：

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/financial-dashboard;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/financial-dashboard /etc/nginx/sites-enabled/financial-dashboard
sudo nginx -t
sudo systemctl reload nginx
```

然后在腾讯云安全组放行 80 端口，访问：

```text
http://你的服务器IP
```

## 更新部署

以后本地修改后：

```bash
git add index.html styles.css app.js README.md .gitignore
git commit -m "Update dashboard"
git push
```

服务器更新：

```bash
cd /var/www/financial-dashboard
git pull
```
