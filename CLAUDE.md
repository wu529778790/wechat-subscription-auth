# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个**微信订阅号认证系统**，核心功能是通过微信扫码关注公众号获取验证码，输入6位验证码完成认证。认证成功后保存状态，下次访问自动认证（无需重复操作）。

**技术栈：**
- **前端**: Nuxt 4 + Vue 3 + TypeScript + Tailwind CSS
- **后端**: Nitro Server API (Node.js)
- **SDK**: 原生 JavaScript + Vite 构建（< 12KB，零依赖）
- **存储**: JSON 文件 / SQLite 双支持

## 目录结构

```
wx-auth/
├── server/                    # 后端 API
│   ├── api/wechat/message.ts  # 微信消息处理（接收/回复）
│   ├── api/auth/check.ts      # 认证状态检查
│   ├── api/auth/session.ts    # Session 管理
│   └── utils/                 # 工具函数（微信加解密、存储、Session）
├── pages/                     # 前端页面
│   └── index.vue              # 认证演示页面
├── wx-auth-sdk/               # 独立 SDK 模块
│   ├── src/
│   │   ├── index.ts           # SDK 入口
│   │   ├── wx-auth.ts         # SDK 核心逻辑
│   │   └── wx-auth.css        # SDK 样式
│   └── vite.config.ts         # SDK 构建配置
├── data/                      # 数据存储目录
│   └── auth-data.json         # JSON 存储文件
├── nuxt.config.ts             # Nuxt 配置
├── package.json               # 项目依赖
└── .env.example               # 环境变量模板
```

## 开发命令

### 主项目
```bash
pnpm install          # 安装依赖
pnpm dev              # 开发模式（http://localhost:3000）
pnpm build            # 构建生产版本
pnpm preview          # 预览生产构建
pnpm generate         # 生成静态站点
```

### SDK 开发
```bash
cd wx-auth-sdk
pnpm build            # 构建 SDK（输出到 dist/）
pnpm type-check       # TypeScript 类型检查
```

## 核心架构

### 前端（pages/index.vue）
- 集成 SDK，自动初始化
- 提供重新认证和清空状态按钮
- 自动检测 Cookie 并静默认证
- 认证成功后不显示提示（静默通过）

### 后端 API 端点
1. **`/api/wechat/message`** - 微信消息处理（GET/POST）
2. **`/api/auth/check`** - 认证检查（参数：`authToken` 或 `openid`）
3. **`/api/auth/session`** - Session 管理（POST/GET/DELETE）

### SDK 工作流程
1. 检查 Cookie `wxauth-openid`
2. 已认证 → 静默通过
3. 未认证 → 显示弹窗（二维码 + 6位输入框）
4. 用户扫码 + 输入验证码
5. 验证成功 → 保存 Cookie + 回调

## 关键配置

### 环境变量（.env）
```bash
# 必须
SITE_URL=https://your-site.com
WECHAT_TOKEN=your-wechat-token
SESSION_SECRET=dev-secret-change-in-production

# 可选（个人订阅号留空）
WECHAT_AES_KEY=
WECHAT_QRCODE_URL=https://your-site.com/qrcode.jpg
CODE_EXPIRY=300
KEYWORDS=["验证码"]
STORAGE_TYPE=file  # 或 sqlite
```

### SDK 配置
```typescript
WxAuth.init({
  apiBase: 'https://auth.shenzjd.com',      // 后端 API 地址
  wechatName: '神族九帝',                    // 公众号名称
  qrcodeUrl: 'https://.../qrcode.jpg',      // 二维码 URL
  onVerified: (user) => { ... },            // 验证成功回调
  onError: (error) => { ... }               // 错误回调
});
```

## 核心特性

### 安全性
- AES-256-GCM 加密 Session
- 验证码 5 分钟过期，一次性使用
- 微信消息签名验证
- 支持安全模式（加密消息）

### 用户体验
- 自动聚焦第一个输入框
- 支持粘贴 6 位数字
- 键盘导航（退格、方向键）
- 输入完成自动验证
- 微信原生风格 UI（#07C160）
- 自动认证（无需重复操作）

### 存储层
- **JSON 文件**（默认）：`data/auth-data.json`，内存缓存 + 节流写入
- **SQLite**（可选）：`data/auth.db`，Better-SQLite3，支持 WAL 模式

## SDK 构建产物

`wx-auth-sdk/dist/`:
- `wx-auth.js` - ES Module (7.1 kB)
- `wx-auth.umd.js` - UMD (11 kB)
- `wx-auth.css` - 样式 (3.4 kB)
- `index.d.ts` - TypeScript 类型声明

## 认证流程

```
用户访问 → 检查 Cookie
    ↓
已认证？ → 静默通过
    ↓
未认证？ → 显示弹窗（二维码 + 输入框）
    ↓
用户扫码关注公众号 → 公众号自动回复验证码
    ↓
用户输入 6 位验证码 → 验证
    ↓
成功 → 保存 Cookie + 回调
```

## 注意事项

1. **微信配置**：个人订阅号只需 `WECHAT_TOKEN`，服务号才需要 `WECHAT_APPID`/`WECHAT_APPSECRET`
2. **Session 密钥**：生产环境必须使用随机字符串（`openssl rand -hex 32`）
3. **网站地址**：`SITE_URL` 必须与微信后台配置的回调地址一致
4. **SDK 导入**：开发时从 `../wx-auth-sdk/src/index` 导入，生产时从 NPM 包导入
