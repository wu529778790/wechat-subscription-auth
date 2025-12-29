# 🚀 极简 SDK 快速开始

> **一句话总结：配置一个 API 地址，3行代码接入微信订阅号验证**

---

## 📦 下载文件

从 `sdk/` 目录获取以下文件：
- `wx-auth-simple.js`  (~8KB)
- `wx-auth-simple.css` (~4KB)

---

## 💡 使用示例

### 方式1: 纯 HTML（最简单）

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="wx-auth-simple.css">
</head>
<body>
  <button onclick="verify()">立即验证</button>

  <script src="wx-auth-simple.js"></script>
  <script>
    // 1. 初始化（只需配置 API 地址）
    WxAuth.init({
      apiBase: 'https://your-api.com',
      onVerified: (user) => {
        alert('验证成功！欢迎 ' + (user.nickname || '会员'));
      }
    });

    // 2. 使用
    async function verify() {
      await WxAuth.requireAuth();
    }
  </script>
</body>
</html>
```

### 方式2: Vue 3

```vue
<template>
  <button @click="handleClick">访问受保护内容</button>
</template>

<script setup>
import 'wx-auth-simple.css';
import { WxAuth } from 'wx-auth-simple';

WxAuth.init({
  apiBase: 'https://your-api.com',
  onVerified: (user) => {
    console.log('验证通过', user);
  }
});

const handleClick = async () => {
  const authenticated = await WxAuth.requireAuth();
  if (authenticated) {
    // 继续业务逻辑
  }
};
</script>
```

### 方式3: React

```jsx
import { useEffect } from 'react';
import 'wx-auth-simple.css';
import { WxAuth } from 'wx-auth-simple';

function App() {
  useEffect(() => {
    WxAuth.init({
      apiBase: process.env.REACT_APP_API,
      onVerified: (user) => console.log('验证通过', user)
    });
  }, []);

  const handleAccess = async () => {
    await WxAuth.requireAuth();
  };

  return <button onClick={handleAccess}>访问受保护内容</button>;
}
```

---

## ⚙️ 配置参数

```javascript
WxAuth.init({
  apiBase: 'https://your-api.com',      // ✅ 必填：后端地址
  onVerified: (user) => { ... },        // ✅ 可选：成功回调
  onError: (error) => { ... },          // ❌ 可选：错误回调
  wechatName: '我的公众号',              // ❌ 可选：显示名称
  qrcodeUrl: 'https://.../qrcode.jpg'   // ❌ 可选：二维码URL
});
```

**最少只需：**
```javascript
WxAuth.init({ apiBase: 'https://your-api.com' });
```

---

## 🎯 工作流程

```
用户点击按钮
    ↓
WxAuth.requireAuth()
    ↓
检查 Cookie wxauth-openid
    ↓
已认证？→ 返回 true ✅
    ↓
未认证？→ 显示弹窗
    ↓
用户扫码关注公众号
    ↓
公众号发送验证码
    ↓
用户输入验证码
    ↓
验证成功 → 保存 Cookie
    ↓
返回 true ✅
```

---

## 🔌 后端要求

**无需任何改动！** 直接使用现有 API：

| 端点 | 用途 |
|------|------|
| `/api/auth/check?openid=xxx` | 检查已认证用户 |
| `/api/auth/check?authToken=xxx` | 验证验证码 |
| `/api/auth/session` | 保存认证状态 |

---

## 🧪 立即测试

如果你已经部署了后端：

```bash
# 1. 访问测试页面
http://your-api.com/sdk/test-sdk.html

# 2. 点击"初始化 SDK"
# 3. 点击"开始验证"
# 4. 扫码 + 输入验证码
# 5. 验证成功！
```

---

## 📊 文件大小

- JS: ~8KB (gzip后 ~3KB)
- CSS: ~4KB (gzip后 ~2KB)
- **总计: ~12KB**

---

## ✅ 完成！

**就这么简单！你的网站现在支持微信订阅号验证了。**

需要帮助？查看：
- 完整文档：`README-SIMPLE.md`
- 演示代码：`demo-simple.html`
- 测试页面：`test-sdk.html`
