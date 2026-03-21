#!/bin/bash
# auto-commit-daily.sh - 每日日报自动提交脚本
set -e

REPO="/root/.openclaw/workspace"
TODAY=$(date +%Y-%m-%d)
REPORT_FILE="$REPORT_DIR/${TODAY}.md"

cd "$REPO"

# 检查是否有变更
if git diff --quiet && git diff --cached --quiet; then
    echo "[$(date)] 无变更，跳过提交"
    exit 0
fi

# 添加所有变更（含新创建的日报文件）
git add .

# 提交（无变更文件时自动失败，上方检查已拦截）
git commit -m "📅 Daily Report: ${TODAY}"

# 推送
git push origin main

echo "[$(date)] 提交成功: ${TODAY}"
