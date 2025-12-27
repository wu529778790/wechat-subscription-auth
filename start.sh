#!/bin/bash

# 微信订阅号认证系统 - 启动脚本

echo "=================================="
echo "  微信订阅号认证系统"
echo "  Nuxt 4 + 极简内存存储"
echo "=================================="
echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "❌ 未检测到 node_modules，请先运行:"
    echo "   pnpm install"
    echo ""
    exit 1
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env 文件，正在创建..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件，请先配置环境变量"
    echo ""
    echo "必须配置的项："
    echo "  - SITE_URL"
    echo "  - WECHAT_APPID"
    echo "  - WECHAT_APPSECRET"
    echo "  - WECHAT_TOKEN"
    echo "  - SESSION_SECRET"
    echo ""
    echo "配置完成后重新运行此脚本"
    exit 1
fi

# 检查必要环境变量
if [ -z "$WECHAT_TOKEN" ]; then
    echo "⚠️  请在 .env 文件中配置 WECHAT_TOKEN"
    echo ""
    exit 1
fi

echo "✅ 环境检查通过"
echo ""
echo "启动开发服务器..."
echo ""

pnpm dev
