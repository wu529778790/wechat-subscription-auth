# 配置更新日志

## 🔧 新增配置项

### 2025-12-27 - 公众号名称和二维码配置

#### 新增环境变量

| 变量名 | 说明 | 是否必须 | 默认值 |
|--------|------|----------|--------|
| `WECHAT_NAME` | 公众号名称（用于前端显示） | ✅ 是 | 我的公众号 |
| `WECHAT_QRCODE_URL` | 公众号二维码图片URL | ❌ 否 | 空（显示占位图） |

#### 配置示例

```bash
# .env 文件新增内容
WECHAT_NAME=我的公众号
WECHAT_QRCODE_URL=https://your-domain.com/qrcode.jpg
```

---

## 📁 修改的文件

### 1. 环境变量配置
- ✅ `.env` - 添加了新的配置项
- ✅ `.env.example` - 更新了模板文件

### 2. Nuxt 配置
- ✅ `nuxt.config.ts` - 在 `runtimeConfig` 中添加了：
  - `public.wechatName` - 客户端可用
  - `public.wechatQrcodeUrl` - 客户端可用
  - `wechat.name` - 服务端可用
  - `wechat.qrcodeUrl` - 服务端可用

### 3. 前端页面
- ✅ `pages/index.vue` - 更新了配置读取方式：
  ```typescript
  // 旧代码（硬编码）
  const wechatName = ref('你的公众号名称');
  const qrcodeUrl = ref('');

  // 新代码（从环境变量读取）
  const config = useRuntimeConfig();
  const wechatName = ref(config.public.wechatName || '我的公众号');
  const qrcodeUrl = ref(config.public.wechatQrcodeUrl || '');
  ```

### 4. 文档更新
- ✅ `README.md` - 添加了新配置说明
- ✅ `QUICK_SETUP.md` - 更新了配置步骤
- ✅ `SETUP_AESKEY.md` - 添加了新配置项示例
- ✅ `SETUP_QRCODE.md` - 重写为完整的二维码配置指南
- ✅ `DEPLOYMENT.md` - 更新了环境变量列表
- ✅ `SETUP_CHECKLIST.md` - 新增配置检查清单

---

## 🎯 配置方式

### 方式1：图片URL（推荐）
```bash
WECHAT_QRCODE_URL=https://your-domain.com/qrcode.jpg
```

### 方式2：Base64编码
```bash
WECHAT_QRCODE_URL=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

### 方式3：留空（默认占位图）
```bash
WECHAT_QRCODE_URL=
```

---

## 🔄 升级指南

### 如果你已经部署了旧版本

1. **更新代码**
   ```bash
   git pull origin main
   ```

2. **更新 .env 文件**
   在 `.env` 中添加：
   ```bash
   WECHAT_NAME=我的公众号
   WECHAT_QRCODE_URL=
   ```

3. **重启应用**
   ```bash
   # 本地开发
   pnpm dev

   # Vercel - 推送代码后自动部署
   git add .
   git commit -m "feat: 添加公众号名称和二维码配置"
   git push
   ```

---

## 📱 效果预览

### 配置前
```
┌─────────────────────────────┐
│         🔐 身份认证          │
│                             │
│    ┌───────────────────┐    │
│    │  📷               │    │
│    │  公众号二维码      │    │
│    │  请配置二维码图片   │    │
│    └───────────────────┘    │
│                             │
│    微信扫码关注: 你的公众号名称  │  ← 硬编码
│    ┌───────────┐ ┌──────┐  │
│    │           │ │ 验证 │  │
│    └───────────┘ └──────┘  │
└─────────────────────────────┘
```

### 配置后
```
┌─────────────────────────────┐
│         🔐 身份认证          │
│                             │
│    ┌───────────────────┐    │
│    │  [二维码图片]      │    │  ← 从环境变量读取
│    │  微信扫码关注      │    │
│    │  或搜索公众号: 我的公众号 │  ← 从环境变量读取
│    └───────────────────┘    │
│                             │
│    输入6位验证码             │
│    ┌───────────┐ ┌──────┐  │
│    │           │ │ 验证 │  │
│    └───────────┘ └──────┘  │
└─────────────────────────────┘
```

---

## 🎉 优势

### 之前的问题
- ❌ 公众号名称硬编码在代码中
- ❌ 二维码URL硬编码在代码中
- ❌ 修改需要编辑代码文件
- ❌ 不利于多环境部署

### 改进后
- ✅ 通过环境变量配置
- ✅ 支持多种二维码格式（URL/Base64/占位图）
- ✅ 修改配置无需改代码
- ✅ 完美支持多环境部署
- ✅ 配置更灵活、更安全

---

## 📚 相关文档

- [快速配置指南](./QUICK_SETUP.md) - 3分钟快速上手
- [二维码配置指南](./SETUP_QRCODE.md) - 二维码详细配置
- [AES密钥配置](./SETUP_AESKEY.md) - 安全模式配置
- [部署指南](./DEPLOYMENT.md) - 生产环境部署
- [配置检查清单](./SETUP_CHECKLIST.md) - 配置验证

---

## 🐛 已知问题

### 问题：配置后页面不更新
**原因**：Nuxt 3 需要重启才能加载新的环境变量
**解决**：重启开发服务器或重新部署

### 问题：二维码不显示
**原因**：URL不可访问或Base64格式错误
**解决**：检查URL是否可访问，或Base64是否完整

---

**本次更新：2025-12-27** 🚀
