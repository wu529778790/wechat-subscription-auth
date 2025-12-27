// 测试加密消息处理
import crypto from 'crypto';
import { XMLParser } from 'fast-xml-parser';

// 模拟配置 - 使用有效的43位Base64密钥
const config = {
  token: 'your_token',
  aesKey: '43字符的Base64密钥需要是有效的', // 43位字符
  appId: 'wx1234567890abcdef'
};

// 生成有效的AES密钥
function generateValidAESKey() {
  const randomBytes = crypto.randomBytes(32); // 256位
  return randomBytes.toString('base64').substring(0, 43); // 43位Base64
}

// 使用有效密钥
config.aesKey = generateValidAESKey();
console.log("生成的AES密钥:", config.aesKey);

// 模拟微信加密消息
function simulateWeChatEncryption(msg, aesKey, appId) {
  const key = Buffer.from(aesKey + "=", "base64");
  const iv = key.slice(0, 16);

  // 随机16字节
  const randomBytes = crypto.randomBytes(16);

  // 消息长度（4字节大端序）
  const msgLen = Buffer.alloc(4);
  msgLen.writeUInt32BE(Buffer.from(msg, "utf8").length, 0);

  // AppID
  const appIdBuffer = Buffer.from(appId, "utf8");

  // 拼接：随机 + 长度 + 消息 + AppID
  const content = Buffer.concat([randomBytes, msgLen, Buffer.from(msg, "utf8"), appIdBuffer]);

  // PKCS#7 填充
  const blockSize = 32;
  const padLen = blockSize - content.length % blockSize;
  const padding = Buffer.alloc(padLen, padLen);
  const padded = Buffer.concat([content, padding]);

  // AES-256-CBC 加密
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(padded);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return encrypted.toString("base64");
}

// 生成签名
function generateSignature(token, timestamp, nonce, encryptMsg) {
  const arr = [token, timestamp, nonce, encryptMsg].sort();
  const str = arr.join("");
  return crypto.createHash("sha1").update(str).digest("hex");
}

// 测试明文模式
console.log("=== 测试1：明文模式 ===");
const plainXml = '<xml><ToUserName>gh_test</ToUserName><FromUserName>oTestUser</FromUserName><CreateTime>1234567890</CreateTime><MsgType>text</MsgType><Content>验证码</Content></xml>';
console.log("明文XML:", plainXml);

// 测试加密模式
console.log("\n=== 测试2：安全模式（加密） ===");
const msgContent = '<xml><ToUserName>gh_test</ToUserName><FromUserName>oTestUser</FromUserName><CreateTime>1234567890</CreateTime><MsgType>text</MsgType><Content>验证码</Content></xml>';
const encryptMsg = simulateWeChatEncryption(msgContent, config.aesKey, config.appId);
const timestamp = Math.floor(Date.now() / 1000).toString();
const nonce = '1234567890';
const msgSignature = generateSignature(config.token, timestamp, nonce, encryptMsg);

const encryptedXml = `<xml>
<Encrypt><![CDATA[${encryptMsg}]]></Encrypt>
<MsgSignature><![CDATA[${msgSignature}]]></MsgSignature>
<TimeStamp>${timestamp}</TimeStamp>
<Nonce>${nonce}</Nonce>
</xml>`;

console.log("加密后的XML:", encryptedXml);
console.log("\n加密内容长度:", encryptMsg.length);
console.log("签名:", msgSignature);

// 模拟服务器解密
console.log("\n=== 服务器解密过程 ===");

// 1. 提取加密内容
const encryptMatch = encryptedXml.match(/<Encrypt><!\[CDATA\[(.*?)\]\]><\/Encrypt>/);
if (!encryptMatch) {
  console.log("❌ 无法提取加密内容");
} else {
  const extractedEncrypt = encryptMatch[1];
  console.log("1. 提取加密内容:", extractedEncrypt.substring(0, 50) + "...");

  // 2. 验证签名
  const validSignature = generateSignature(config.token, timestamp, nonce, extractedEncrypt);
  console.log("2. 验证签名:", validSignature === msgSignature ? "✅ 通过" : "❌ 失败");

  // 3. 解密
  try {
    const key = Buffer.from(config.aesKey + "=", "base64");
    const iv = key.slice(0, 16);
    const cipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    const encrypted = Buffer.from(extractedEncrypt, "base64");
    let decrypted = cipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, cipher.final()]);

    // 移除填充
    const padLen = decrypted[decrypted.length - 1];
    const unpadded = decrypted.slice(0, decrypted.length - padLen);

    // 提取消息长度和内容
    const msgLen = unpadded.readUInt32BE(16);
    const content = unpadded.slice(20, 20 + msgLen).toString("utf8");
    const appIdFromMsg = unpadded.slice(20 + msgLen).toString("utf8");

    console.log("3. 解密后内容:", content);
    console.log("4. AppID验证:", appIdFromMsg === config.appId ? "✅ 通过" : "❌ 失败");

    // 5. 解析XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      parseNodeValue: true,
      parseAttributeValue: true
    });
    const parsed = parser.parse(content);
    console.log("6. 解析结果:", parsed.xml);

    // 6. 关键词匹配
    const keywords = ['已关注', '认证', '验证', 'login', '已订阅', '关注了', '验证码'];
    const matched = keywords.some(k => parsed.xml.Content.includes(k));
    console.log("7. 关键词匹配:", matched ? "✅ 成功" : "❌ 失败");

  } catch (error) {
    console.log("❌ 解密失败:", error.message);
  }
}

// 测试不同关键词
console.log("\n=== 测试3：关键词匹配测试 ===");
const testContents = ['验证码', '已关注', '认证', '验证', 'login', '已订阅', '关注了', '测试'];
const keywords = ['已关注', '认证', '验证', 'login', '已订阅', '关注了', '验证码'];

testContents.forEach(content => {
  const matched = keywords.some(k => content.includes(k));
  console.log(`"${content}" -> ${matched ? "✅ 匹配" : "❌ 不匹配"}`);
});

console.log("\n=== 测试总结 ===");
console.log("1. 如果你的公众号是【明文模式】，服务器应该能正常工作");
console.log("2. 如果是【安全模式/兼容模式】，需要确保服务器能正确解密");
console.log("3. 个人订阅号无法配置服务器，用户必须主动发送消息");
console.log("4. 建议：让用户发送'验证码'或'已关注'触发回复");
