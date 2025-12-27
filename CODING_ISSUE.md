# 🔴 核心问题：编码损坏

## 诊断结果

你发送的 `验证码` 经过微信传输后，变成了：
```
原始：验证码
实际：��֤��
Hex：efbfbdefbfbdd6a4efbfbdefbfbd
```

## 问题分析

### 1. 正常的UTF-8编码
```
验证码 = e9 aa 8c e8 af 81 e7 a0 81
```

### 2. 损坏后的编码
```
��֤�� = efbfbdefbfbdd6a4efbfbdefbfbd
```

### 3. 对比
```
正常：  e9 aa 8c  e8 af 81  e7 a0 81
损坏：  ef bf bd  ef bf bd  d6 a4  ef bf bd  ef bf bd
```

**结论：每个字节都被替换成了 `ef bf bd`（UTF-8的替换字符）**

## 可能的原因

### 原因1：微信后台配置问题
- 消息推送的编码设置不正确
- 微信服务器发送了错误的编码

### 原因2：Vercel 接收问题
- Vercel 的 body parser 可能处理不当
- Content-Type 或 charset 未正确识别

### 原因3：测试工具问题
- 你使用的 curl 或测试工具发送了错误编码
- Windows 系统的编码问题

## 解决方案

### 方案1：强制编码转换（已实现）

在 `message.ts` 中添加：
```typescript
// 检测乱码并尝试修复
if (content.includes('�') || Buffer.from(content).toString('hex').includes('efbfbd')) {
  // 从原始body重新解析
  const bodyBuffer = Buffer.from(body);
  const bodyStr = bodyBuffer.toString('utf8');
  const parsedFromRaw = parseWeChatMessage(bodyStr);
  content = parsedFromRaw.Content.trim();
}
```

### 方案2：模糊匹配（已实现）

即使内容是乱码，只要包含部分字符就匹配：
```typescript
// 检查单个字符
if (content.includes('验') || content.includes('证') || content.includes('码')) {
  return true;
}
```

### 方案3：检查实际微信消息

**关键问题：这是真实的微信消息，还是测试工具造成的？**

请执行以下测试：

1. **使用诊断接口查看真实数据**
   ```bash
   curl -X POST https://auth.shenzjd.com/api/wechat/diagnostic \
     -H "Content-Type: application/xml" \
     -d '<xml><MsgType>text</MsgType><Content>验证码</Content><FromUserName>testuser</FromUserName><ToUserName>gh_test</ToUserName></xml>'
   ```

2. **查看 Vercel 日志**
   登录 Vercel，查看 Functions → api/wechat/diagnostic 的完整日志

3. **让真实用户测试**
   - 关注公众号
   - 发送"验证码"
   - 查看 Vercel 日志

## 立即测试

### 测试1：修复后的代码是否能处理乱码

我已经更新了代码，现在请：

1. **等待 Vercel 部署完成**（约1-2分钟）
2. **重新测试诊断接口**
   ```bash
   curl -X POST https://auth.shenzjd.com/api/wechat/diagnostic \
     -H "Content-Type: application/xml" \
     -d '<xml><MsgType>text</MsgType><Content>验证码</Content><FromUserName>testuser</FromUserName><ToUserName>gh_test</ToUserName></xml>'
   ```
3. **查看返回结果**

### 测试2：检查修复后的消息处理

```bash
curl -X POST https://auth.shenzjd.com/api/wechat/message \
  -H "Content-Type: application/xml" \
  -d '<xml><MsgType>text</MsgType><Content>验证码</Content><FromUserName>testuser</FromUserName><ToUserName>gh_test</ToUserName></xml>'
```

**预期结果：**
应该返回包含验证码的回复，而不是默认回复。

## 如果仍然失败

### 检查微信后台配置

请截图你的微信后台：
```
 mp.weixin.qq.com → 开发 → 基本配置
```

**重点看：**
- 消息推送的URL
- 是否有错误提示
- 是否已启用

### 检查实际用户消息

让真实用户发送消息，然后查看 Vercel 日志，看：
1. 是否收到消息
2. 收到的完整内容是什么
3. Content 字段的值和 Hex

## 临时绕过方案

如果编码问题无法解决，可以：

1. **修改关键词列表为单字**
   ```typescript
   const keywords = ['验', '证', '码', '已', '关', '注', '认', '证'];
   ```

2. **使用正则表达式模糊匹配**
   ```typescript
   // 匹配任何包含"验"、"证"、"码"的内容
   if (/[\u9a8c\u8bc1\u7801]/.test(content)) {
     return true;
   }
   ```

## 下一步

请执行测试1和测试2，然后告诉我：
1. 诊断接口返回的完整内容
2. 消息接口返回的内容
3. Vercel 日志中的详细信息

我会根据结果进一步优化解决方案。
