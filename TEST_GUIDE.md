# 微信消息接收测试指南

## 🎯 问题定位

发送验证码没有回复，可能的原因：
1. **服务器未收到微信消息**
2. **服务器收到消息但处理出错**
3. **服务器回复了，但微信没收到**

---

## 🔧 诊断步骤

### 步骤1：检查服务器是否在线

访问以下URL，应该返回 "Invalid parameters"：
```
https://auth.shenzjd.com/api/wechat/message
```

如果返回其他内容或错误，说明服务器有问题。

---

### 步骤2：检查环境变量配置

您的当前配置应该是：
```bash
WECHAT_TOKEN=wx_auth_token_2025_shenzjd
WECHAT_NAME=神族九帝
WECHAT_QRCODE_URL=https://gcore.jsdelivr.net/gh/wu529778790/image/blog/qrcode_for_gh_61da24be23ff_258.jpg
```

**关键检查：**
- ✅ `WECHAT_TOKEN` 必须非空
- ✅ 服务器已重启（Vercel部署后自动重启）

---

### 步骤3：手动测试消息处理

使用以下curl命令测试：

```bash
# 测试文本消息（发送"验证码"）
curl -X POST "https://auth.shenzjd.com/api/wechat/message" \
  -H "Content-Type: application/xml" \
  -d '<xml><ToUserName>gh_test</ToUserName><FromUserName>oTestUser</FromUserName><CreateTime>1234567890</CreateTime><MsgType>text</MsgType><Content>验证码</Content></xml>'
```

**预期返回：**
```xml
<xml>
  <ToUserName><![CDATA[oTestUser]]></ToUserName>
  <FromUserName><![CDATA[gh_test]]></FromUserName>
  <CreateTime>1234567890</CreateTime>
  <MsgType><![CDATA[text]]></MsgType>
  <Content><![CDATA[您的认证码：123456\n\n请在网站输入此验证码完成认证。]]></Content>
</xml>
```

---

### 步骤4：查看Vercel日志

1. 登录 Vercel 控制台：https://vercel.com
2. 进入您的项目
3. 点击 **Functions** 标签
4. 找到 **api/wechat/message**
5. 查看最近的日志

**应该看到类似：**
```
[WeChat] 收到原始消息: <xml>...</xml>
[WeChat] 使用明文模式处理
[WeChat] 用户 oxxx... 请求验证码，重新生成 123456
```

---

### 步骤5：检查微信后台配置

如果您有服务器配置权限，检查：

| 配置项 | 值 |
|--------|-----|
| URL | `https://auth.shenzjd.com/api/wechat/message` |
| Token | `wx_auth_token_2025_shenzjd` |
| 加密方式 | 明文模式 |

---

## 🐛 常见问题

### 问题1：返回 "Invalid configuration"

**原因：** `WECHAT_TOKEN` 未配置或为空

**解决：**
1. 检查Vercel环境变量：`WECHAT_TOKEN`
2. 确保值不为空
3. 重新部署

---

### 问题2：返回 "Invalid signature"

**原因：** 微信后台Token与服务器Token不一致

**解决：**
1. 检查微信后台的Token配置
2. 检查Vercel的 `WECHAT_TOKEN` 环境变量
3. 两者必须完全一致

---

### 问题3：服务器没收到消息

**原因：** 微信没有发送消息到服务器

**可能：**
1. 微信后台没有配置服务器URL
2. 服务器URL不可访问
3. 微信账号类型限制（未认证订阅号可能没有服务器配置权限）

---

### 问题4：收到消息但没有回复

**原因：** 关键词不匹配或代码有bug

**检查：**
1. 确认发送的关键词在支持列表中
2. 查看Vercel日志是否有错误
3. 测试curl命令是否能正常回复

---

## 🎯 针对您的情况

### 您的账号类型：未认证订阅号

**可能的情况：**

#### 情况A：微信后台有服务器配置选项
- ✅ 可以配置URL、Token
- ✅ 用户发送消息会推送到服务器
- ✅ 服务器可以自动回复

**配置：**
```
URL: https://auth.shenzjd.com/api/wechat/message
Token: wx_auth_token_2025_shenzjd
加密方式: 明文模式
```

#### 情况B：微信后台没有服务器配置选项
- ❌ 无法接收消息推送
- ❌ 只能使用微信官方的自动回复
- ❌ 无法实现自动验证码回复

**解决方案：**
1. **手动引导用户**：在公众号自动回复中说明使用方法
2. **使用客服消息**：用户关注后，手动发送消息触发
3. **升级认证服务号**：获得完整功能

---

## 📞 快速诊断

请执行以下操作并告诉我结果：

### 1. 测试服务器状态
```bash
curl https://auth.shenzjd.com/api/wechat/message
```
**返回什么？**

### 2. 测试消息处理
```bash
curl -X POST "https://auth.shenzjd.com/api/wechat/message" \
  -H "Content-Type: application/xml" \
  -d '<xml><ToUserName>gh_test</ToUserName><FromUserName>oTestUser</FromUserName><CreateTime>1234567890</CreateTime><MsgType>text</MsgType><Content>验证码</Content></xml>'
```
**返回什么？**

### 3. 查看Vercel日志
登录Vercel，查看最近的请求日志
**看到了什么？**

### 4. 检查微信后台
登录微信公众号后台，查看：
- 是否有"基本配置"选项？
- 服务器配置是否已启用？
- Token是否与 `wx_auth_token_2025_shenzjd` 一致？

---

## ⚡ 紧急备用方案

如果服务器配置无法使用，可以：

### 方案1：公众号自动回复设置
在微信后台设置：
- **关注自动回复**：发送使用说明
- **关键词自动回复**：设置"验证码"触发回复

**内容示例：**
```
欢迎关注！
获取认证码请发送：验证码
```

### 方案2：手动客服回复
您手动在微信中回复用户验证码。

### 方案3：升级认证服务号
- 费用：300元/年
- 功能：完整API支持，自动推送

---

**请先执行步骤1和2，告诉我结果，我帮您进一步诊断！** 🔍
