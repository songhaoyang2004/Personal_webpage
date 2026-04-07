#!/usr/bin/env bash
# 在 ECS 上执行：bash deploy/server-update.sh
# 前提：项目已在 /var/www/personal-webpage，且当前用户有权 sudo

set -euo pipefail
ROOT="${ROOT:-/var/www/personal-webpage}"
cd "$ROOT"

echo "==> git pull"
sudo git pull

echo "==> frontend build"
cd "$ROOT/frontend"
npm ci
npm run build

echo "==> restart resume API"
sudo systemctl restart personal-webpage
sudo systemctl is-active personal-webpage

echo "==> nginx: 若尚未配置 /api 反代，则从示例生成（仅公网 IP 时改为 default_server）"
if ! sudo nginx -T 2>/dev/null | grep -q 'location /api/'; then
  sudo cp -f "$ROOT/deploy/nginx-site.conf.example" /etc/nginx/sites-available/personal-webpage
  if grep -q 'your-domain.com' /etc/nginx/sites-available/personal-webpage; then
    sudo sed -i 's/^\([[:space:]]*\)listen 80;/\1listen 80 default_server;/' /etc/nginx/sites-available/personal-webpage
    sudo sed -i 's/^\([[:space:]]*\)server_name .*/\1server_name _;/' /etc/nginx/sites-available/personal-webpage
  fi
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo ln -sf /etc/nginx/sites-available/personal-webpage /etc/nginx/sites-enabled/personal-webpage
fi
sudo nginx -t
sudo systemctl reload nginx

echo "==> checks"
curl -sS -o /dev/null -w "via nginx /api/resume HTTP %{http_code}\n" http://127.0.0.1/api/resume
curl -sS http://127.0.0.1:8000/health || true

echo "==> done. Open http://$(curl -sS ifconfig.me 2>/dev/null || echo YOUR_PUBLIC_IP)/"
