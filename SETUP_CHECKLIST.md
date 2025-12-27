# 配置检查清单

## ✅ 必须配置的环境变量

### 1. 网站配置（必须）
- [ ] `SITE_URL` - 网站访问地址，如：`https://your-domain.com`
- [ ] `SESSION_SECRET` - Session加密密钥，使用 `openssl rand -hex 32` 生成

### 2. 微信公众号配置（必须）
- [ ] `WECHAT_TOKEN` - 与微信后台配置一致的Token
- [ ] `WECHAT_NAME` - 公众号名称（用于前端显示）
- [ ] `WECHAT_QRCODE_URL` - 二维码图片URL（可选，留空显示默认占位图）

### 3. 消息加解密配置（安全模式需要）
- [ ] `WECHAT_APPID` - 公众号AppID（安全模式必须）
- [ ] `WECHAT_APPSECRET` - 公众号AppSecret（未认证订阅号可不填）
- [ ] `WECHAT_AES_KEY` - EncodingAESKey（安全模式必须，43位字符）

---

## 📋 配置步骤检查

### 阶段1：环境变量配置
- [ ] 复制 `.env.example` 到 `.env`
- [ ] 填写 `SITE_URL`
- [ ] 填写 `SESSION_SECRET`
- [ ] 填写 `WECHAT_TOKEN`
- [ ] 填写 `WECHAT_NAME`
- [ ] 填写 `WECHAT_QRCODE_URL`（可选）
- [ ] 填写 `WECHAT_APPID`（安全模式需要）
- [ ] 填写 `WECHAT_AES_KEY`（安全模式需要）

### 阶段2：微信后台配置
- [ ] 登录微信公众号后台
- [ ] 进入 **基本配置** → **服务器配置**
- [ ] 填写URL：`https://your-domain.com/api/wechat/message`
- [ ] 填写Token：与 `.env` 中的 `WECHAT_TOKEN` 一致
- [ ] 选择消息加解密方式：**安全模式**
- [ ] 填写EncodingAESKey：与 `.env` 中的 `WECHAT_AES_KEY` 一致
- [ ] 点击 **提交** 并确认配置成功

### 阶段3：二维码配置
- [ ] 下载公众号二维码图片
- [ ] 上传到图床或服务器
- [ ] 将图片URL填入 `WECHAT_QRCODE_URL`
- [ ] 或者使用Base64编码

### 阶段4：启动和测试
- [ ] 运行 `pnpm install` 安装依赖
- [ ] 运行 `pnpm dev` 启动开发服务器
- [ ] 访问 `http://localhost:3000` 查看页面
- [ ] 测试关注公众号是否收到验证码
- [ ] 测试输入验证码是否能登录

---

## 🔍 验证配置

### 检查环境变量是否加载
```bash
# 查看当前目录
pwd

# 查看 .env 文件内容
cat .env | grep -E "WECHAT_|SITE_|SESSION_"
```

### 预期输出示例
```
SITE_URL=https://your-domain.com
SESSION_SECRET=your-random-secret-key
WECHAT_TOKEN=your-token
WECHAT_NAME=我的公众号
WECHAT_QRCODE_URL=https://your-domain.com/qrcode.jpg
WECHAT_APPID=wx1234567890abcdef
WECHAT_APPSECRET=your-app-secret
WECHAT_AES_KEY=abcdefghijklmnopqrstuvwxyz1234567890ABC
```

### 检查前端页面是否读取配置
打开浏览器开发者工具，查看：
```javascript
// 在控制台输入
const config = useRuntimeConfig()
console.log(config.public.wechatName)
console.log(config.public.wechatQrcodeUrl)
```

---

## 🎯 最小可用配置

### 未认证订阅号（最小配置）
```env
SITE_URL=https://your-domain.com
SESSION_SECRET=your-secret-key
WECHAT_TOKEN=your-token
WECHAT_NAME=我的公众号
WECHAT_QRCODE_URL=
```

### 认证服务号（完整配置）
```env
SITE_URL=https://your-domain.com
SESSION_SECRET=your-secret-key
WECHAT_TOKEN=your-token
WECHAT_NAME=我的公众号
WECHAT_QRCODE_URL=https://your-domain.com/qrcode.jpg
WECHAT_APPID=wx1234567890abcdef
WECHAT_APPSECRET=your-app-secret
WECHAT_AES_KEY=abcdefghijklmnopqrstuvwxyz1234567890ABC
```

---

## 🐛 故障排查

### 问题1：页面显示 "你的公众号名称"
**原因**：`WECHAT_NAME` 未配置或未生效
**解决**：
1. 检查 `.env` 文件中是否有 `WECHAT_NAME`
2. 重启应用：`pnpm dev`
3. 清除浏览器缓存

### 问题2：二维码区域显示占位图
**原因**：`WECHAT_QRCODE_URL` 未配置
**解决**：
1. 配置 `WECHAT_QRCODE_URL` 或留空使用默认占位图
2. 确保URL可以访问（如果是URL方式）
3. 重启应用

### 问题3：环境变量不生效
**原因**：Nuxt 3 需要重启才能加载新的环境变量
**解决**：
```bash
# 停止当前运行的开发服务器 (Ctrl+C)
# 重新启动
pnpm dev
```

---

## 📞 需要帮助？

查看以下文档：
- [快速配置指南](./QUICK_SETUP.md) - 3分钟快速上手
- [二维码配置指南](./SETUP_QRCODE.md) - 二维码详细配置
- [AES密钥配置](./SETUP_AESKEY.md) - 安全模式配置
- [部署指南](./DEPLOYMENT.md) - 生产环境部署

---

**配置完成后，重启应用并测试完整流程！** 🚀
