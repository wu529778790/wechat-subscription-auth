// 微信相关工具函数
import crypto from 'crypto';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

export interface WeChatMessage {
  ToUserName: string;
  FromUserName: string;
  CreateTime: number;
  MsgType: 'text' | 'event' | 'news';
  Content?: string;
  Event?: string;
  MsgId?: number;
}

/**
 * 验证微信消息签名
 */
export function validateWeChatSignature(
  signature: string,
  timestamp: string,
  nonce: string,
  token: string
): boolean {
  const arr = [token, timestamp, nonce].sort();
  const str = arr.join('');
  const sha1Str = crypto.createHash('sha1').update(str).digest('hex');
  return sha1Str === signature;
}

/**
 * 解析微信 XML 消息
 */
export function parseWeChatMessage(xml: string): WeChatMessage {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    parseNodeValue: true,
    parseAttributeValue: true
  });

  const parsed = parser.parse(xml);
  return parsed.xml;
}

/**
 * 生成微信 XML 回复消息
 */
export function generateWeChatReply(message: WeChatMessage): string {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    format: false,
    suppressEmptyNode: true
  });

  const xmlObj = {
    xml: {
      ToUserName: { '#cdata': message.ToUserName },
      FromUserName: { '#cdata': message.FromUserName },
      CreateTime: message.CreateTime,
      MsgType: { '#cdata': message.MsgType },
      ...(message.MsgType === 'text' && message.Content ? {
        Content: { '#cdata': message.Content }
      } : {})
    }
  };

  return builder.build(xmlObj);
}

/**
 * 生成6位随机认证码
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 检查消息内容是否包含关键词
 */
export function containsAuthKeyword(content: string): boolean {
  const keywords = ['已关注', '认证', '验证', 'login', '已订阅', '关注了', '验证码'];
  return keywords.some(k => content.includes(k));
}

/**
 * 检查是否是状态查询关键词
 */
export function isStatusKeyword(content: string): boolean {
  const keywords = ['状态', 'status', '查询'];
  return keywords.some(k => content.includes(k));
}

/**
 * 检查是否是帮助关键词
 */
export function isHelpKeyword(content: string): boolean {
  const keywords = ['帮助', 'help', '怎么', '如何'];
  return keywords.some(k => content.includes(k));
}

/**
 * 生成欢迎消息
 */
export function generateWelcomeMessage(openid: string): string {
  const siteUrl = useRuntimeConfig().public.siteUrl;
  return `欢迎关注！🎉

请访问网站完成认证：
${siteUrl}

在网站输入您的认证码，或发送"已关注"到本公众号获取认证码。

提示：认证码5分钟内有效。`;
}

/**
 * 生成认证码回复消息
 */
export function generateCodeMessage(code: string): string {
  return `✅ 认证码已生成

您的认证码：${code}

请在网站输入此认证码完成登录，或直接刷新网站页面。

提示：认证码5分钟内有效。`;
}

/**
 * 生成帮助消息
 */
export function generateHelpMessage(): string {
  return `认证流程帮助：

1. 关注公众号
2. 发送关键词【已关注】或【认证】
3. 获得6位认证码
4. 在网站输入认证码完成登录

支持关键词：
- 已关注, 认证, 验证, login
- 状态 - 查询认证状态
- 帮助 - 查看此帮助

如有问题，请联系管理员。`;
}

/**
 * 生成状态查询回复
 */
export function generateStatusMessage(openid: string): string {
  return `您的认证状态：已关注公众号

如需重新认证，请发送"已关注"。

如需帮助，请发送"帮助"。`;
}
