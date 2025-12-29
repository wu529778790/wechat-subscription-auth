# 微信订阅号认证 SDK - 极简版

> 🎯 **极简设计，仅需配置 API 地址**

一个轻量级 JavaScript SDK，可在任何网站中嵌入微信订阅号验证功能。**完全复用现有后端 API，无需额外配置。**

---

## ✨ 特性

- 🚀 **极简接入** - 仅需配置 `apiBase` 参数
- 📦 **超轻量** - JS + CSS 总计 < 10KB
- 🎨 **微信风格** - 原生微信绿色主题
- 🔒 **安全可靠** - Cookie 持久化认证
- 🎯 **非侵入式** - 不影响现有业务逻辑
- ⏱️ **自动验证** - 输入完成自动验证

---

## 🚀 3步快速开始

### 1. 下载文件

```bash
# 从 SDK 目录获取
sdk/wx-auth-simple.js
sdk/wx-auth-simple.css
```

### 2. 引入到你的网站

```html
<!-- 在 HTML 中引入 -->
<link rel="stylesheet" href="wx-auth-simple.css">
<script src="wx-auth-simple.js"></script>
```

### 3. 初始化和使用

```javascript
// 初始化（只需配置 API 地址）
WxAuth.init({
  apiBase: 'https://your-api.com',  // 你的后端地址
  onVerified: (user) => {
    console.log('验证通过', user);
    // user = { openid, unionid, nickname, headimgurl, authenticatedAt }
  }
});

// 使用
const authenticated = await WxAuth.requireAuth();
if (authenticated) {
  // 继续业务逻辑
  console.log('用户已认证');
}
```

---

## 📖 完整使用示例

### HTML 基础示例

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="wx-auth-simple.css">
</head>
<body>
  <button id="protect-btn">访问受保护内容</button>

  <script src="wx-auth-simple.js"></script>
  <script>
    // 1. 初始化
    WxAuth.init({
      apiBase: 'https://your-api.com',
      onVerified: (user) => {
        alert(`欢迎，${user.nickname || '会员'}！`);
        document.getElementById('protect-btn').textContent = '内容已解锁';
      }
    });

    // 2. 绑定按钮
    document.getElementById('protect-btn').addEventListener('click', async () => {
      const authenticated = await WxAuth.requireAuth();
      if (authenticated) {
        // 显示受保护内容
        console.log('可以访问内容了');
      }
    });
  </script>
</body>
</html>
```

### Vue 3 示例

```vue
<template>
  <div>
    <button @click="handleAccess" v-if="!authenticated">
      访问受保护内容
    </button>
    <div v-else>
      <h2>欢迎，{{ user.nickname }}!</h2>
      <p>会员内容已解锁</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import 'wx-auth-simple.css';
import { WxAuth } from 'wx-auth-simple';

const authenticated = ref(false);
const user = ref(null);

onMounted(() => {
  WxAuth.init({
    apiBase: import.meta.env.VITE_API_BASE,
    onVerified: (userData) => {
      authenticated.value = true;
      user.value = userData;
    }
  });
});

const handleAccess = async () => {
  await WxAuth.requireAuth();
};
</script>
```

### React 示例

```jsx
import { useEffect, useState } from 'react';
import 'wx-auth-simple.css';
import { WxAuth } from 'wx-auth-simple';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    WxAuth.init({
      apiBase: process.env.REACT_APP_API_BASE,
      onVerified: (userData) => {
        setAuthenticated(true);
        setUser(userData);
      }
    });
  }, []);

  const handleAccess = async () => {
    await WxAuth.requireAuth();
  };

  if (authenticated) {
    return (
      <div>
        <h2>欢迎，{user?.nickname}!</h2>
        <p>会员内容已解锁</p>
      </div>
    );
  }

  return <button onClick={handleAccess}>访问受保护内容</button>;
}
```

---

## ⚙️ 配置选项

```javascript
WxAuth.init({
  // 必填：后端API地址
  apiBase: 'https://your-api.com',

  // 可选：验证成功回调
  onVerified: (user) => {
    console.log('用户信息:', user);
    // user = {
    //   openid: 'oxxx',
    //   unionid: 'xxx',
    //   nickname: '张三',
    //   headimgurl: 'https://...',
    //   authenticatedAt: '2025-12-29T...'
    // }
  },

  // 可选：错误回调
  onError: (error) => {
    console.error('验证失败:', error);
  },

  // 可选：公众号名称（用于显示）
  wechatName: '我的公众号',

  // 可选：二维码URL（用于显示）
  qrcodeUrl: 'https://.../qrcode.jpg'
});
```

---

## 🔌 后端 API 要求

SDK 完全复用现有后端 API，**无需额外配置**：

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/check?openid=xxx` | GET | 检查已认证用户 |
| `/api/auth/check?authToken=xxx` | GET | 验证验证码 |
| `/api/auth/session` | POST | 设置 Session |

**你的后端已经部署好了，直接使用即可！**

---

## 📋 工作流程

```
用户点击按钮
    ↓
调用 WxAuth.requireAuth()
    ↓
检查 Cookie wxauth-openid
    ↓
已认证？→ 返回 true，执行 onVerified
    ↓
未认证？→ 显示弹窗
    ↓
显示二维码 + 提示文字
    ↓
用户扫码关注公众号
    ↓
公众号自动发送验证码
    ↓
用户在弹窗输入验证码
    ↓
验证 /api/auth/check?authToken=xxxx
    ↓
成功？→ 保存 Cookie
    ↓
调用 onVerified(user)
    ↓
关闭弹窗，返回 true
```

---

## 🎨 自定义样式

你可以覆盖这些 CSS 类来自定义样式：

```css
/* 修改主色调 */
.wx-auth-header {
  background: #your-color;
}

/* 修改按钮样式 */
.wx-auth-btn-primary {
  background: #your-color;
  border-radius: 20px;
}

/* 修改弹窗宽度 */
.wx-auth-content {
  width: 400px;
}
```

---

## 📱 移动端优化

SDK 已针对移动端优化：
- ✅ 自动适配屏幕宽度
- ✅ 触摸友好的输入框
- ✅ 支持虚拟键盘
- ✅ 粘贴验证码支持

---

## 🐛 常见问题

### Q: 弹窗不显示？
**A:** 检查：
1. 是否正确引入 CSS 和 JS 文件
2. `apiBase` 配置是否正确
3. 浏览器控制台是否有错误

### Q: 验证失败？
**A:** 可能原因：
1. 验证码输入错误
2. 验证码已过期（5分钟）
3. Cookie 被浏览器阻止
4. 网络问题

### Q: 如何退出登录？
**A:** 删除 Cookie 即可：
```javascript
document.cookie = 'wxauth-openid=; Max-Age=0; path=/';
```

### Q: 需要配置 `/api/sdk/config` 吗？
**A:** 不需要！SDK 会自动使用默认配置，你也可以在初始化时手动设置 `wechatName` 和 `qrcodeUrl`。

---

## 📊 文件大小

- `wx-auth-simple.js`: ~8KB (gzip后 ~3KB)
- `wx-auth-simple.css`: ~4KB (gzip后 ~2KB)
- **总计**: ~12KB

---

## 🌐 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ 移动端浏览器

---

## 🧪 测试

### 1. 启动你的后端服务
```bash
cd wechat-subscription-auth
pnpm dev
```

### 2. 访问演示页面
```
http://localhost:3000/sdk/demo-simple.html
```

### 3. 配置 API 地址
在演示页面输入 `http://localhost:3000` 并点击初始化

### 4. 测试流程
1. 点击"立即验证"按钮
2. 弹窗显示二维码
3. 在公众号发送消息获取验证码
4. 在弹窗输入验证码
5. 验证成功！

---

## ✅ 检查清单

部署前检查：
- [ ] 后端服务已部署并可访问
- [ ] 微信公众号已配置服务器URL
- [ ] SDK 文件已上传到服务器或 CDN
- [ ] 已测试完整验证流程
- [ ] 已配置 HTTPS（生产环境）

---

## 🎉 总结

**这个极简 SDK 让一切变得简单：**

1. ✅ **无需新增后端 API** - 复用现有接口
2. ✅ **仅需配置一个参数** - `apiBase`
3. ✅ **总大小 < 12KB** - 超轻量
4. ✅ **3行代码接入** - 即插即用

**立即开始：**
```javascript
WxAuth.init({ apiBase: 'https://your-api.com' });
await WxAuth.requireAuth();
```

---

**版本**: v1.0.0
**最后更新**: 2025-12-29
