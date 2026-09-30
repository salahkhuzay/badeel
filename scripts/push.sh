#!/usr/bin/env bash
# ==========================================================================
# إعداد Git المحلي + دفع المستودع (يُستخدم بعد إعادة تهيئة البيئة)
# الاستخدام:  ./scripts/push.sh "رسالة الالتزام"        [مع رمز GitHub في البيئة]
#   أو:       GITHUB_TOKEN=xxx ./scripts/push.sh "رسالة الالتزام"
# ==========================================================================
set -e
cd "$(dirname "$0")/.."

REPO="salahkhuzay/badeel"
MSG="${1:-chore: تحديث}"

# 1) هوية الالتزام (ملف .git/config يُستثنى من حفظ البيئة، فنعيد ضبطه)
git config user.name "Salah Al-Khuzai"
git config user.email "salahkhuzay@users.noreply.github.com"

# 2) الالتزام
git add -A
if ! git diff --cached --quiet; then
  git -c commit.gpgsign=false commit -q -m "$MSG"
  echo "✅ تم الالتزام: $MSG"
else
  echo "ℹ️ لا توجد تغييرات جديدة للالتزام"
fi

# 3) الدفع
if [ -n "$GITHUB_TOKEN" ]; then
  BARE="https://github.com/${REPO}.git"
  AUTHED="https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO}.git"
  git remote set-url origin "$AUTHED"
  git branch -M main
  git push -u origin main
  git remote set-url origin "$BARE"     # تنظيف الرمز من الإعدادات
  echo "✅ تم الدفع إلى https://github.com/${REPO} (وحُذف الرمز من إعدادات Git)"
else
  echo "ℹ️ لم يُمرَّر GITHUB_TOKEN — تم الالتزام محلياً فقط."
  echo "   للدفع:  GITHUB_TOKEN=<رمز-جديد> ./scripts/push.sh \"رسالة\""
fi
