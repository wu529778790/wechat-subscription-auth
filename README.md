# 微信订阅号认证系统 - Nuxt 4 极简版

> 🎯 **极简设计，无需数据库，开箱即用**

这是一个基于 **Nuxt 4** 的微信订阅号认证系统，通过用户主动发送关键词完成网站认证。**完全使用内存存储，无需配置数据库**。

## ✨ 核心特性

- ✅ **零数据库** - 纯内存存储，部署更简单
- ✅ **自动轮询** - 无需手动刷新页面
- ✅ **Nuxt 4** - 最新框架，性能更优
- ✅ **TypeScript** - 类型安全，开发体验好
- ✅ **Tailwind CSS** - 现代化 UI
- ✅ **多关键词支持** - 已关注、认证、验证等
- ✅ **自动清理** - 过期数据自动删除

## 📋 工作流程

```
用户访问网站
    ↓
检查 Session/Cookie
    ↓
未认证？→ 显示引导页（二维码 + 操作指引）
    ↓
用户关注公众号 + 发送关键词"已关注"
    ↓
公众号回复6位认证码
    ↓
网站自动轮询检测 → 认证成功 → 自动登录
    ↓
访问受保护内容
```

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```bash
# 网站地址
SITE_URL=https://your-website.com

# 微信公众号配置
WECHAT_APPID=你的公众号AppID
WECHAT_APPSECRET=你的公众号AppSecret
WECHAT_TOKEN=你的服务器Token

# Session密钥（生产环境使用随机字符串）
SESSION_SECRET=随机生成的密钥
```

### 3. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

### 4. 配置微信公众号后台

登录微信公众号平台 → 开发 → 基本配置：

| 配置项 | 值 |
|--------|-----|
| **服务器URL** | `https://your-domain.com/api/wechat/message` |
| **Token** | 与 `.env` 中的 `WECHAT_TOKEN` 一致 |
| **消息加解密方式** | 推荐安全模式 |

### 5. 测试完整流程

1. 访问网站 → 点击"前往认证页面"
2. 关注公众号 → 发送关键词"已关注"
3. 获得6位认证码
4. 网站会自动检测并登录（或手动输入认证码）

## 🏗️ 项目架构

### 目录结构

```
wechat-subscription-auth/
├── server/                      # 服务端代码
│   ├── api/                     # API 路由
│   │   ├── wechat/
│   │   │   └── message.ts      # 微信消息处理
│   │   └── auth/
│   │       ├── check.ts        # 认证状态检查
│   │       └── session.ts      # Session 管理
│   └── utils/                   # 工具函数
│       ├── storage.ts          # 内存存储
│       ├── wechat.ts           # 微信工具
│       └── session.ts          # Session 工具
├── pages/                       # 前端页面
│   ├── index.vue               # 主页
│   └── auth.vue                # 认证页（带自动轮询）
├── app.vue                     # 根组件
├── nuxt.config.ts              # Nuxt 配置
├── tailwind.config.ts          # Tailwind 配置
├── package.json                # 依赖
└── .env.example                # 环境变量模板
```

### 核心组件

#### 1. 内存存储 (`server/utils/storage.ts`)
```typescript
// 使用 Map 存储，无需数据库
const authCodes = new Map();      // 认证码
const authenticatedUsers = new Map(); // 已认证用户

// 自动清理过期数据（每分钟）
setInterval(() => { /* 清理逻辑 */ }, 60 * 1000);
```

#### 2. 微信消息处理 (`server/api/wechat/message.ts`)
- 验证消息来源
- 处理关注事件
- 识别关键词生成认证码
- 自动回复消息

#### 3. 自动轮询检测 (`pages/auth.vue`)
```typescript
// 每3秒检查一次
pollInterval = setInterval(() => {
  checkAuth(true);
}, 3000);

// 5分钟后自动停止
setTimeout(() => stopAutoPolling(), 5 * 60 * 1000);
```

## 🔧 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Nuxt** | 3.15+ | 服务端渲染框架 |
| **H3** | 1.13+ | HTTP 服务器 |
| **fast-xml-parser** | 4.4+ | XML 消息解析 |
| **Tailwind CSS** | 3.4+ | 样式框架 |
| **TypeScript** | 5.2+ | 类型安全 |

## 📝 代码示例

### 微信消息处理

```typescript
// server/api/wechat/message.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const message = parseWeChatMessage(body);

  if (containsAuthKeyword(message.Content)) {
    const code = generateVerificationCode();
    saveAuthCode(code, message.FromUserName);

    return generateWeChatReply({
      ToUserName: message.FromUserName,
      FromUserName: message.ToUserName,
      MsgType: 'text',
      Content: `您的认证码：${code}`
    });
  }
});
```

### 认证状态检查

```typescript
// server/api/auth/check.ts
export default defineEventHandler(async (event) => {
  const { authToken, openid } = getQuery(event);

  // 检查已认证用户
  if (openid) {
    const user = getAuthenticatedUser(openid);
    if (user) return { authenticated: true, user };
  }

  // 检查认证码
  if (authToken) {
    const data = getUserByAuthCode(authToken);
    if (data) {
      markUserAuthenticated(data.openid, data);
      deleteAuthCode(authToken);
      return { authenticated: true, user: data };
    }
  }

  return { authenticated: false };
});
```

## 🎨 UI 特性

### 主页 (`pages/index.vue`)
- ✅ 渐变背景
- ✅ 自动检测登录状态
- ✅ 响应式设计
- ✅ 退出登录功能

### 认证页 (`pages/auth.vue`)
- ✅ 二维码展示区域
- ✅ 详细操作步骤
- ✅ **自动轮询检测**（每3秒一次）
- ✅ 实时状态反馈
- ✅ 手动输入认证码
- ✅ 错误处理

## 🚀 部署指南

### Vercel（推荐 - 免费）

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 构建项目
pnpm build

# 3. 部署
vercel --prod
```

部署时需要配置的环境变量：
- `SITE_URL`
- `WECHAT_APPID`
- `WECHAT_APPSECRET`
- `WECHAT_TOKEN`
- `SESSION_SECRET`

### Netlify（免费）

```bash
pnpm build
netlify deploy --prod
```

### 自建服务器

```bash
pnpm build
pnpm preview
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "preview"]
```

## 🔒 安全建议

1. **使用强随机 Session 密钥**
   ```bash
   openssl rand -hex 32
   ```

2. **启用 HTTPS**（微信强制要求）

3. **保护敏感信息**
   - 不要提交 `.env` 文件
   - `WECHAT_APPSECRET` 严格保密

4. **验证码有效期**
   - 默认5分钟，可调整
   - 自动清理过期数据

## ⚠️ 注意事项

### 内存存储的限制

- **重启后数据丢失** - 适合开发和小型项目
- **单实例限制** - 多服务器部署需要共享存储
- **生产环境建议** - 如需持久化，可添加 Redis 或数据库

### 如何改为持久化存储？

如果需要持久化，只需修改 `server/utils/storage.ts`：

```typescript
// 改为使用 Redis 或数据库
import redis from './redis';

export async function saveAuthCode(code, openid) {
  await redis.setex(`auth:${code}`, 300, JSON.stringify({ openid }));
}
```

## 🐛 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 消息未回复 | 服务器URL不可访问 | 检查HTTPS、域名解析、防火墙 |
| 认证码无效 | Token过期 | 延长有效期或检查内存状态 |
| 轮询不工作 | Cookie问题 | 检查浏览器Cookie设置 |
| 部署失败 | 依赖问题 | 删除node_modules重新安装 |

## 📊 性能优化

- ✅ **轻量级**：无数据库依赖
- ✅ **快速响应**：内存存储，毫秒级查询
- ✅ **低资源消耗**：适合小型项目
- ✅ **自动清理**：避免内存泄漏

## 🎯 与原版对比

| 特性 | 原版 (Next.js + Redis) | 本版 (Nuxt 4 + 内存) |
|------|------------------------|----------------------|
| **框架** | Next.js 13 | Nuxt 4 |
| **存储** | Redis | 内存 |
| **部署** | 需要 Redis 服务 | 无需额外服务 |
| **复杂度** | 中等 | 极简 |
| **持久化** | ✅ | ❌ (可扩展) |
| **自动轮询** | ❌ | ✅ |
| **开发体验** | 好 | 更好 |

## 📄 许可证

MIT License - 你可以自由使用、修改和分发此代码。

## 💬 问题反馈

如有问题或建议：
1. 检查环境变量配置
2. 查看控制台日志
3. 确认微信公众号后台配置
4. 查看 Nuxt 官方文档

---

**立即开始：**

```bash
pnpm install
cp .env.example .env
pnpm dev
```

祝你使用愉快！🎉
