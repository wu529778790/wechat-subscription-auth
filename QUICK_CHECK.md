# 🔧 快速检查清单

## ✅ 第一步：确认你的微信后台配置

请登录微信后台，截图这个页面：
```
 mp.weixin.qq.com → 开发 → 基本配置
```

**需要确认：**
- [ ] 你看到的是 **"消息推送"** 而不是 **"服务器配置"**
- [ ] URL 是：`https://auth.shenzjd.com/api/wechat/message`
- [ ] 开关是**绿色**（已启用）
- [ ] 没有红色错误提示

**如果看到的是"服务器配置"：**
→ 说明你的公众号可能是认证的，需要配置 Token 和 AES Key

**如果看到的是"消息推送"：**
→ 个人订阅号配置正确，继续下一步

---

## ✅ 第二步：测试诊断接口

**执行命令：**
```bash
curl -X POST https://auth.shenzjd.com/api/wechat/diagnostic \
  -H "Content-Type: application/xml" \
  -d '<xml><MsgType>text</MsgType><Content>验证码</Content><FromUserName>testuser</FromUserName><ToUserName>gh_test</ToUserName></xml>'
```

**预期结果：**
```json
{
  "status": "ok",
  "received": true,
  "timestamp": "2025-12-28T...",
  "bodyLength": 123,
  "bodyPreview": "<xml>...",
  "message": "诊断数据已记录到控制台"
}
```

**如果失败：**
→ 检查 Vercel 日志，看是否有错误信息

---

## ✅ 第三步：查看 Vercel 日志

**操作步骤：**
1. 登录 [vercel.com](https://vercel.com)
2. 进入你的项目
3. 点击 **Functions** 标签
4. 找到 `api/wechat/message` 或 `api/wechat/diagnostic`
5. 点击 **Logs** 查看实时日志

**需要查看：**
- [ ] 是否有请求记录
- [ ] 请求的完整内容
- [ ] 是否有错误信息

---

## ✅ 第四步：实际用户测试

**让用户操作：**
1. 关注你的公众号
2. 发送消息：`验证码`
3. 等待回复

**检查结果：**
- [ ] 用户是否收到回复？
- [ ] 回复内容是什么？
- [ ] Vercel 日志是否有记录？

---

## 🎯 问题分类诊断

### 情况1：用户关注后无任何反应

**可能原因：**
- 个人订阅号不支持事件推送
- **解决方案：** 告知用户手动发送"验证码"

### 情况2：用户发送消息，但没收到回复

**可能原因：**
1. 微信未正确推送消息到服务器
2. 消息格式不匹配
3. 关键词匹配失败

**诊断方法：**
```bash
# 测试诊断接口，查看微信实际发送格式
curl -X POST https://auth.shenzjd.com/api/wechat/diagnostic \
  -H "Content-Type: application/xml" \
  -d '<xml><MsgType>text</MsgType><Content>验证码</Content><FromUserName>USER_OPENID</FromUserName><ToUserName>gh_yourid</ToUserName></xml>'
```

### 情况3：测试正常，但实际用户不行

**可能原因：**
- 微信后台配置未生效
- URL 未通过微信验证

**解决方案：**
1. 在微信后台重新提交配置
2. 等待 5-10 分钟生效
3. 让用户重新测试

---

## 📋 立即执行的命令

### 1. 测试服务器是否正常
```bash
curl -X POST https://auth.shenzjd.com/api/wechat/message \
  -H "Content-Type: application/xml" \
  -d '<xml><MsgType>text</MsgType><Content>验证码</Content><FromUserName>test</FromUserName><ToUserName>gh_test</ToUserName></xml>'
```

### 2. 使用诊断接口
```bash
curl -X POST https://auth.shenzjd.com/api/wechat/diagnostic \
  -H "Content-Type: application/xml" \
  -d '<xml><MsgType>text</MsgType><Content>验证码</Content></xml>'
```

### 3. 查看部署状态
```bash
# 确保代码已部署
git log --oneline -3
```

---

## 🚨 常见错误

### 错误1：返回 "Invalid parameters"
→ 正常，这是 GET 请求的响应。POST 才是处理消息。

### 错误2：返回默认回复（欢迎！如果您需要...）
→ 关键词匹配失败，可能是编码问题或格式不对

### 错误3：500 错误
→ 服务器内部错误，查看 Vercel 日志

### 错误4：404 错误
→ 接口路径错误，检查 URL

---

## 💡 下一步行动

**请告诉我：**

1. **微信后台截图**（最重要）
2. **执行测试命令的结果**
3. **Vercel 日志内容**

我会根据这些信息帮你定位问题！
