#!/usr/bin/env bash
# ==========================================================================
# رفع مشروع بديل إلى GitHub بأمر واحد
# الاستخدام:  ./push-to-github.sh <اسم-حسابك-على-github> [اسم-المستودع]
# مثال:       ./push-to-github.sh ahmad badeel
# ==========================================================================
set -e
cd "$(dirname "$0")"

USERNAME="${1:?الاستخدام: ./push-to-github.sh <github-username> [repo-name]}"
REPO="${2:-badeel}"

if [ ! -d .git ]; then
  echo "✗ لا يوجد مستودع Git هنا. نفّذ أولاً: git init -b main && git add -A && git commit -m 'first commit'"
  exit 1
fi

git branch -M main
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/${USERNAME}/${REPO}.git"

echo "▶ الدفع إلى https://github.com/${USERNAME}/${REPO} ..."
echo "  (سيطلب GitHub اسم المستخدم و Personal Access Token ككلمة مرور)"
git push -u origin main

echo
echo "✅ تم الرفع بنجاح"
echo "   المستودع:  https://github.com/${USERNAME}/${REPO}"
echo "   ملاحظة: إذا لم تكن أنشأت المستودع بعد، أنشئه فارغاً (بدون README) من:"
echo "   https://github.com/new?name=${REPO}"
