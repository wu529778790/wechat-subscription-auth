# 微信公众号安全模式配置指南

## 🔑 如何获取 EncodingAESKey

### 方法 1：在微信后台生成（推荐）

1. 登录微信公众号后台
2. 进入 **基本配置** → **服务器配置**
3. 在 "消息加解密方式" 选择 **安全模式**
4. 点击 "生成" 按钮，系统会自动生成一个 43 位的 EncodingAESKey
5. 复制这个 Key

### 方法 2：手动生成

```bash
# 使用 OpenSSL 生成随机 43 位字符
openssl rand -base64 32 | head -c 43
```

---

## 📝 配置步骤

### 第 1 步：更新 .env 文件

将获取到的 EncodingAESKey 填入 `.env`：

```env
WECHAT_AES_KEY=你的43位EncodingAESKey
```

### 第 2 步：重启应用

```bash
pnpm dev
# 或生产环境
pnpm start
```

### 第 3 步：在微信后台配置

在微信公众号后台填写：

| 配置项 | 填写内容 |
|--------|----------|
| **URL** | `https://your-domain.com/api/wechat/message` |
| **Token** | `[YOUR_WECHAT_TOKEN]` |
| **EncodingAESKey** | 与 `.env` 中的 `WECHAT_AES_KEY` 一致 |
| **消息加解密方式** | **安全模式** |

### 第 4 步：点击"提交"

微信会向你的服务器发送验证请求：
- 如果配置正确，会提示"配置成功"
- 如果失败，会显示具体错误信息

---

## 🔍 验证配置是否成功

### 检查服务器日志

运行应用后，关注日志输出：

```
[WeChat] 检测到加密消息，使用安全模式处理
[WeChat] 解密后消息: <xml>...</xml>
[WeChat] 使用安全模式回复（加密）
[WeChat] 加密回复生成成功
```

### 测试关注公众号

1. 关注你的公众号
2. 应该自动收到欢迎消息 + 验证码
3. 发送"已关注"或"认证"应该重新获取验证码

---

## ⚙️ 完整的 .env 配置示例

```env
# ============================================
# 1. 网站配置（必须）
# ============================================
SITE_URL=https://your-domain.com

# Session加密密钥
SESSION_SECRET=[YOUR_SESSION_SECRET]

# ============================================
# 2. 微信公众号配置（必须）
# ============================================
WECHAT_TOKEN=[YOUR_WECHAT_TOKEN]

# 公众号名称（用于前端显示）
WECHAT_NAME=我的公众号

# 公众号二维码URL（可选，用于前端显示二维码）
WECHAT_QRCODE_URL=

# ============================================
# 3. 消息加解密配置（安全模式需要）
# ============================================
WECHAT_APPID=[YOUR_APP_ID]
WECHAT_APPSECRET=[YOUR_APP_SECRET]
WECHAT_AES_KEY=你的43位EncodingAESKey在这里

# ============================================
# 4. 可选配置
# ============================================
# CODE_EXPIRY=300
```

---

## 🐛 常见问题

### Q1: 提示 "Invalid signature"

**原因**：Token 或 EncodingAESKey 不匹配

**解决**：
1. 检查 `.env` 中的 `WECHAT_TOKEN` 是否与微信后台一致
2. 检查 `.env` 中的 `WECHAT_AES_KEY` 是否与微信后台一致
3. 重启应用使配置生效

### Q2: 提示 "消息解密失败"

**原因**：EncodingAESKey 格式错误或 AppID 不匹配

**解决**：
1. 确保 EncodingAESKey 是 43 位字符
2. 确保 `WECHAT_APPID` 正确
3. 检查是否有特殊字符或空格

### Q3: 可以切换模式吗？

**可以！**
- **安全模式**：需要配置 EncodingAESKey
- **明文模式**：留空 EncodingAESKey 即可
- **兼容模式**：代码会自动适配

---

## 📚 参考文档

- [微信官方文档 - 消息加解密说明](https://developers.weixin.qq.com/doc/subscription/guide/dev/push/)
- [微信官方文档 - 服务器配置](https://developers.weixin.qq.com/doc/officialaccount/Basic_Config.html)
