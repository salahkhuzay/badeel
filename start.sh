#!/usr/bin/env bash
# تشغيل منصة بديل محلياً بأمر واحد
set -e
cd "$(dirname "$0")"
[ -d node_modules ] || npm install --no-audit --no-fund
[ -d .next ] || npx next build
echo "▶ المنصة تعمل على: http://localhost:3000"
npx next start -H 0.0.0.0 -p 3000
