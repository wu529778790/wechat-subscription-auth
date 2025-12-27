# 公众号二维码配置指南

## 📋 配置说明

在认证页面中，需要显示公众号二维码供用户扫码关注。本系统支持多种二维码配置方式，通过环境变量进行配置。

---

## 🔧 配置方式

### 方式1：图片URL（推荐）

将二维码图片上传到服务器或图床，然后配置URL：

```bash
# .env 文件
WECHAT_QRCODE_URL=https://your-domain.com/qrcode.jpg
```

**优点：**
- 支持大尺寸图片
- 图片质量好
- 可以随时更换

**注意事项：**
- 确保URL可以被公网访问
- 建议使用HTTPS
- 图片格式：JPG/PNG/SVG

---

### 方式2：Base64编码（适合小图片）

将图片转换为Base64字符串：

```bash
# .env 文件
WECHAT_QRCODE_URL=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

**转换方法：**

1. **在线工具：**
   - 访问：https://www.base64-image.de/
   - 上传二维码图片
   - 复制生成的Base64字符串

2. **命令行（Linux/Mac）：**
   ```bash
   base64 -i qrcode.png -o qrcode.txt
   # 然后将内容复制到配置中，加上前缀：data:image/png;base64,
   ```

3. **PowerShell（Windows）：**
   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("qrcode.png"))
   ```

**优点：**
- 无需额外服务器存储
- 单文件部署
- 适合小图片（< 100KB）

**缺点：**
- 字符串很长
- 浏览器缓存效果差
- 建议图片大小 < 50KB

---

### 方式3：留空（默认占位图）

```bash
# .env 文件
WECHAT_QRCODE_URL=
```

**效果：**
- 显示默认的占位图标 📷
- 提示用户配置二维码
- 适合开发测试阶段

---

## 📱 如何获取公众号二维码

### 方法1：微信公众号后台

1. 登录 https://mp.weixin.qq.com/
2. 左侧菜单 → **设置与开发** → **公众号设置**
3. 找到 **二维码** 区域
4. 点击 **下载二维码**
5. 选择尺寸（推荐：600x600或更大）

### 方法2：使用草料二维码等工具

1. 获取公众号的微信号或二维码链接
2. 访问：https://cli.im/
3. 输入公众号信息，生成二维码
4. 下载高清版本

### 方法3：临时二维码（适合活动）

如果你有AppSecret，可以通过API生成临时二维码：
```bash
# 需要 AppID 和 AppSecret
curl "https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"expire_seconds": 604800, "action_name": "QR_SCENE"}'
```

---

## 🎨 二维码最佳实践

### 推荐规格

| 项目 | 规格 |
|------|------|
| **格式** | PNG 或 JPG |
| **尺寸** | 400x400 像素以上 |
| **文件大小** | < 500KB |
| **颜色** | 黑白对比清晰 |
| **边距** | 保留适当白边 |

### 美化建议

1. **添加Logo：**
   - 在二维码中间添加公众号Logo
   - 确保不影响识别

2. **品牌颜色：**
   - 可以使用深色主题
   - 但要保证扫描成功率

3. **添加文字：**
   - "扫码关注公众号"
   - "获取验证码"

---

## ⚡ 快速配置步骤

### 第1步：准备二维码图片

下载或生成公众号二维码图片。

### 第2步：上传到图床

将图片上传到：
- 你的服务器
- 阿里云OSS/腾讯云COS
- GitHub + CDN
- 任何支持外链的图床

### 第3步：配置环境变量

```bash
# 打开 .env 文件
WECHAT_NAME=我的公众号
WECHAT_QRCODE_URL=https://your-domain.com/qrcode.jpg
```

### 第4步：重启应用

```bash
pnpm dev
```

### 第5步：验证

访问 `http://localhost:3000`，应该看到：
- ✅ 配置了URL：显示二维码图片
- ✅ 配置了Base64：显示二维码图片
- ❌ 未配置：显示默认占位图

---

## 🔍 验证配置

### 检查环境变量

```bash
# 查看当前配置
echo $WECHAT_NAME
echo $WECHAT_QRCODE_URL
```

### 查看运行效果

打开浏览器访问你的网站，应该看到：

**配置前（无二维码）：**
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
│    输入6位验证码             │
│    ┌───────────┐ ┌──────┐  │
│    │           │ │ 验证 │  │
│    └───────────┘ └──────┘  │
└─────────────────────────────┘
```

**配置后（有二维码）：**
```
┌─────────────────────────────┐
│         🔐 身份认证          │
│                             │
│    ┌───────────────────┐    │
│    │  [二维码图片]      │    │
│    │  微信扫码关注      │    │
│    │  或搜索公众号: xxx │    │
│    └───────────────────┘    │
│                             │
│    输入6位验证码             │
│    ┌───────────┐ ┌──────┐  │
│    │ 123456    │ │ 验证 │  │
│    └───────────┘ └──────┘  │
└─────────────────────────────┘
```

---

## 🐛 常见问题

### Q: 二维码不显示？

**检查：**
1. URL是否可以访问？
2. Base64字符串是否完整？
3. 图片格式是否正确？
4. 查看浏览器控制台是否有错误？

### Q: 图片太大加载慢？

**解决方案：**
1. 压缩图片：使用 TinyPNG 等工具
2. 使用CDN加速
3. 改用Base64（小图片）

### Q: 想要动态更换二维码？

**方案：**
1. 使用固定URL，后台更换图片
2. 或者使用API动态生成Base64
3. 修改 `pages/index.vue` 中的逻辑

---

## 📝 完整配置示例

### 单公众号配置

```bash
# .env

# 网站配置
SITE_URL=https://your-domain.com
SESSION_SECRET=your-secret-key

# 微信公众号配置
WECHAT_TOKEN=your-wechat-token
WECHAT_NAME=我的公众号
WECHAT_QRCODE_URL=https://your-domain.com/images/qrcode.jpg

# 安全模式配置
WECHAT_APPID=wx1234567890abcdef
WECHAT_APPSECRET=your-app-secret
WECHAT_AES_KEY=abcdefghijklmnopqrstuvwxyz1234567890ABC
```

### 多公众号配置

```bash
# .env
WECHAT_ACCOUNTS=[
  {
    "name":"主公众号",
    "appId":"wx123",
    "appSecret":"",
    "token":"token123",
    "qrcodeUrl":"https://your-domain.com/qrcode-main.jpg"
  },
  {
    "name":"测试号",
    "appId":"wx456",
    "appSecret":"",
    "token":"token456",
    "qrcodeUrl":"https://your-domain.com/qrcode-test.jpg"
  }
]
```

---

## 💡 进阶配置

### 自定义二维码显示逻辑

如果需要更复杂的显示逻辑，可以修改 `pages/index.vue`：

```typescript
// 从环境变量读取配置
const config = useRuntimeConfig();
const wechatName = ref(config.public.wechatName || '我的公众号');
const qrcodeUrl = ref(config.public.wechatQrcodeUrl || '');

// 或者根据条件动态选择
const getQrcodeUrl = () => {
  // 方式1：从环境变量
  if (config.public.wechatQrcodeUrl) {
    return config.public.wechatQrcodeUrl;
  }

  // 方式2：根据公众号选择
  if (config.public.wechatAccounts.length > 0) {
    return config.public.wechatAccounts[0].qrcodeUrl;
  }

  // 方式3：留空显示默认占位图
  return '';
};
```

### 在服务端使用配置

```typescript
// server/api/xxx.ts
const config = useRuntimeConfig();
const wechatName = config.wechat.name;
const qrcodeUrl = config.wechat.qrcodeUrl;
```

---

## 🎯 配置检查清单

- [ ] 已设置 `WECHAT_NAME`（公众号名称）
- [ ] 已设置 `WECHAT_QRCODE_URL`（二维码URL，可选）
- [ ] 二维码图片可以公开访问
- [ ] 已重启应用使配置生效
- [ ] 访问页面确认显示正常

---

**配置完成后，记得重启应用！** 🎉

如果仍有问题，请检查：
1. 环境变量是否正确加载
2. 图片URL是否可访问
3. 浏览器控制台是否有错误信息
