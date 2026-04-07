#!/usr/bin/env bash
# 当前目录是「上传的静态站、没有 .git」时用本脚本迁成 git 仓库部署。
# 在 ECS 上以 root 执行：  bash <(curl -fsSL https://raw.githubusercontent.com/songhaoyang2004/Personal_webpage/main/deploy/migrate-to-git.sh)
# 或已能 git clone 时：先 clone 到别处，再复制本文件执行。
#
# 默认：备份 /var/www/personal-webpage → personal-webpage.bak.时间戳 ，再 clone 同路径。

set -euo pipefail
ROOT="${ROOT:-/var/www/personal-webpage}"
REPO_URL="${REPO_URL:-https://github.com/songhaoyang2004/Personal_webpage.git}"

if [ "$(id -u)" -ne 0 ]; then
  echo "请用 root 执行：sudo bash $0"
  exit 1
fi

mkdir -p /var/www
cd /var/www

if [ -d "$ROOT/.git" ]; then
  echo "==> 已是 git 仓库，直接更新"
  cd "$ROOT"
  git pull
  bash "$ROOT/deploy/server-update.sh"
  exit 0
fi

if [ -d "$ROOT" ] && [ ! -d "$ROOT/.git" ]; then
  BAK="personal-webpage.bak.$(date +%Y%m%d-%H%M%S)"
  echo "==> 备份无 git 的旧目录 → /var/www/$BAK"
  mv "$ROOT" "$BAK"
fi

if [ ! -d "$ROOT" ]; then
  echo "==> git clone $REPO_URL → $ROOT"
  git clone "$REPO_URL" "$ROOT"
fi

cd "$ROOT"
git pull

echo "==> Python venv + 依赖"
cd "$ROOT/backend"
if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
deactivate

echo "==> systemd 简历 API"
if [ -f "$ROOT/deploy/personal-webpage.service.example" ]; then
  cp -f "$ROOT/deploy/personal-webpage.service.example" /etc/systemd/system/personal-webpage.service
fi
chown -R www-data:www-data "$ROOT" 2>/dev/null || true
systemctl daemon-reload
systemctl enable personal-webpage
systemctl restart personal-webpage
systemctl is-active personal-webpage

echo "==> 构建前端 + Nginx（沿用 server-update.sh）"
bash "$ROOT/deploy/server-update.sh"

echo "==> 完成。浏览器访问公网 IP，Ctrl+F5 强刷。"
