# 微信订阅号认证 SDK - Vite 构建版本

基于 Vite 构建的微信订阅号认证 SDK，支持 TypeScript 和多种模块格式。

## 特点

- ✅ 仅需配置 `apiBase`
- ✅ 复用现有后端 API
- ✅ 无额外依赖
- ✅ 支持 ES Module 和 UMD 格式
- ✅ 完整的 TypeScript 类型支持
- ✅ 总大小 < 10KB

## 安装和构建

```bash
cd vite-sdk
pnpm install
pnpm build
```

构建产物将输出到 `dist/` 目录：
- `wx-auth.js` - ES Module 格式 (7.1 kB)
- `wx-auth.umd.js` - UMD 格式 (11 kB)
- `wx-auth.css` - 样式文件 (3.4 kB)
- `index.d.ts` - TypeScript 类型声明

## 使用方法

### 1. 作为 NPM 包使用

```typescript
import { WxAuth, type WxAuthConfig } from '@wechat-subscription-auth/wx-auth-sdk';
import '@wechat-subscription-auth/wx-auth-sdk/dist/style.css';

// 初始化（SDK 会自动检测 Cookie 并静默认证）
WxAuth.init({
  apiBase: 'https://your-api.com',
  onVerified: (user) => {
    console.log('验证通过', user);
  }
});

// 如果需要手动触发认证（例如重新认证按钮）
// await WxAuth.requireAuth();
```

### 2. 作为浏览器脚本使用 (UMD)

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="./dist/wx-auth.css">
</head>
<body>
  <script src="./dist/wx-auth.umd.js"></script>
  <script>
    // 初始化（SDK 会自动检测 Cookie 并静默认证）
    WxAuth.init({
      apiBase: 'https://your-api.com',
      onVerified: (user) => {
        console.log('验证通过', user);
      }
    });
  </script>
</body>
</html>
```

## API 参考

### `WxAuth.init(options)`

初始化 SDK。**初始化后会自动检测 Cookie 并静默认证**，如果未认证则显示弹窗。

**参数：**
- `options.apiBase` (必填): 后端 API 地址
- `options.onVerified` (可选): 验证成功回调
- `options.onError` (可选): 错误回调
- `options.wechatName` (可选): 公众号名称，默认为 "公众号"
- `options.qrcodeUrl` (可选): 二维码 URL

**行为：**
- 自动检测 `wxauth-openid` Cookie
- 已认证 → 触发 `onVerified` 回调（静默通过）
- 未认证 → 显示认证弹窗

### `WxAuth.requireAuth()`

手动触发认证流程（用于重新认证、切换账号等场景）。

**返回：** `Promise<boolean>` - 验证成功返回 `true`

### `WxAuth.close()`

关闭认证弹窗。

### `WxAuth.switchToCodeInput()`

切换到手动输入验证码模式。

### `WxAuth.verifyCode()`

验证输入的验证码。

## 后端 API 要求

SDK 需要以下后端 API 端点：

1. **获取配置** (可选): `GET /api/sdk/config`
   ```json
   {
     "wechatName": "公众号名称",
     "qrcodeUrl": "https://example.com/qrcode.png"
   }
   ```

2. **检查认证状态**: `GET /api/auth/check?openid={openid}` 或 `GET /api/auth/check?authToken={code}`
   ```json
   {
     "authenticated": true,
     "user": {
       "openid": "xxx",
       "nickname": "用户昵称"
     }
   }
   ```

## 开发

```bash
# 类型检查
pnpm type-check

# 预览构建结果（需要在项目根目录运行）
pnpm preview
```

## 目录结构

```
vite-sdk/
├── src/
│   ├── index.ts          # 入口文件
│   ├── wx-auth.ts        # 核心 SDK
│   └── wx-auth.css       # 样式文件
├── dist/                 # 构建输出
├── vite.config.ts        # Vite 配置
├── tsconfig.json         # TypeScript 配置
└── package.json          # 包配置
```

## 演示页面

SDK 的交互式演示页面位于项目根目录的 `pages/sdk-demo.vue`，可以通过 Nuxt.js 运行查看实际效果。

## 许可证

MIT
