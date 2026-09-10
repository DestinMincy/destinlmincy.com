#!/usr/bin/env bash
# chmod +x scripts/deploy.sh  (run once after adding this file to the repo)
set -euo pipefail
cd "$(dirname "$0")/.."
git pull origin master
npm ci
npm run db:deploy
npm run build
pm2 restart destinlmincy || pm2 start deploy/ecosystem.config.js
pm2 save
echo "Deploy complete"
