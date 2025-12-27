# 用户使用指南

## 🎯 如何获取认证码

由于您使用的是**个人订阅号**，请按以下步骤操作：

### 步骤1：关注公众号

扫描二维码关注您的公众号

### 步骤2：发送关键词获取验证码

在微信中，向公众号发送以下**任意一个**关键词：

```
验证码
已关注
认证
验证
login
已订阅
关注了
```

### 步骤3：接收验证码

公众号会自动回复6位数字验证码，例如：

```
✅ 认证码已生成

您的认证码：123456

请在网站输入此码完成认证。
认证码5分钟内有效。
```

### 步骤4：在网站输入验证码

1. 访问您的网站
2. 输入收到的6位验证码
3. 完成认证

---

## ❓ 常见问题

### Q1: 发送消息后没有回复？

**可能原因：**
1. 消息未发送成功（检查网络）
2. 关键词不匹配（请使用上述关键词）
3. 服务器未启动（联系管理员）

**解决方法：**
- 重新发送关键词
- 等待几秒钟
- 如果仍无回复，请联系管理员检查服务器日志

### Q2: 验证码过期怎么办？

验证码**5分钟内有效**，过期后：
1. 再次发送关键词（如"验证码"）
2. 获取新的6位验证码
3. 在网站输入新验证码

### Q3: 可以重复获取验证码吗？

可以！每次发送关键词都会生成新的验证码，旧的验证码会失效。

### Q4: 为什么关注后没有自动收到消息？

个人订阅号**不支持**自动推送消息，需要您手动发送关键词获取验证码。

---

## 🔧 管理员配置说明

### 环境变量配置

在 Vercel 或本地环境设置：

```bash
# .env 文件
WECHAT_TOKEN=你的微信令牌
WECHAT_NAME=你的公众号名称
WECHAT_QRCODE_URL=你的二维码图片URL
SITE_URL=你的网站地址
```

### 微信后台配置（仅认证账号）

```
1. 登录 mp.weixin.qq.com
2. 开发 → 基本配置
3. 服务器配置：
   - URL: https://your-domain.com/api/wechat/message
   - Token: 与 WECHAT_TOKEN 一致
   - EncodingAESKey: 随机生成（安全模式需要）
   - 消息加解密方式: 推荐安全模式
```

### 测试方法

使用 Python 测试（推荐）：

```bash
python test-proper.py
```

或使用 curl（注意编码问题）：

```bash
# Linux/Mac
curl -X POST https://your-domain.com/api/wechat/message \
  -H "Content-Type: application/xml" \
  -d '<xml><ToUserName>gh_test</ToUserName><FromUserName>oTestUser</FromUserName><CreateTime>1234567890</CreateTime><MsgType>text</MsgType><Content>验证码</Content></xml>'

# Windows PowerShell
# 建议使用 Python 脚本，避免编码问题
```

---

## 📞 技术支持

如遇到问题，请提供：
1. 发送的具体内容
2. 是否收到回复
3. 错误截图
4. 服务器日志（管理员）
