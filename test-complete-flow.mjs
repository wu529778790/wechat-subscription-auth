// 完整流程测试：关注事件 → 发送验证码
import { createServer } from 'http';
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  parseNodeValue: true,
  parseAttributeValue: true
});

// 模拟服务器配置
const config = {
  token: process.env.WECHAT_TOKEN || 'test_token',
  siteUrl: process.env.SITE_URL || 'http://localhost:3000'
};

// 关键词匹配函数
function containsAuthKeyword(content) {
  const keywords = ['已关注', '认证', '验证', 'login', '已订阅', '关注了', '验证码'];
  return keywords.some(k => content.includes(k));
}

// 生成验证码
function generateVerificationCode() {
  return Math.floor(1e5 + Math.random() * 9e5).toString();
}

// 生成回复消息
function generateReply(content, code) {
  if (content.includes('验证码') || content.includes('已关注') || content.includes('认证')) {
    return `✅ 认证码已生成

您的认证码：${code}

请在网站输入此码完成认证。
认证码5分钟内有效。`;
  }
  return '欢迎！如需获取验证码，请发送"验证码"、"已关注"或"认证"';
}

const server = createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/wechat/message') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      console.log('\n=== 收到微信消息 ===');
      console.log('原始内容:', body);

      try {
        const parsed = parser.parse(body);
        const { MsgType, Event, FromUserName, ToUserName, Content } = parsed.xml;

        console.log('消息类型:', MsgType);
        console.log('事件类型:', Event);
        console.log('用户:', FromUserName);
        console.log('内容:', Content);

        let replyContent = '';

        // 处理关注事件
        if (MsgType === 'event' && Event === 'subscribe') {
          console.log('用户关注公众号！');
          const code = generateVerificationCode();
          replyContent = `🎉 欢迎关注！

⚠️ 重要提示：
由于您使用的是个人订阅号，请手动发送消息获取验证码。

请发送：【验证码】或【已关注】
您的认证码：${code}

请在5分钟内完成网站认证。`;

          console.log('生成验证码:', code);
        }
        // 处理文本消息
        else if (MsgType === 'text') {
          const content = (Content || '').trim();
          console.log('文本内容:', content);

          if (containsAuthKeyword(content)) {
            const code = generateVerificationCode();
            replyContent = generateReply(content, code);
            console.log('匹配关键词，生成验证码:', code);
          } else {
            replyContent = '未识别的关键词。请发送"验证码"、"已关注"或"认证"获取认证码。';
            console.log('未匹配关键词');
          }
        }

        // 生成回复XML
        const replyXml = `<xml>
<ToUserName><![CDATA[${FromUserName}]]></ToUserName>
<FromUserName><![CDATA[${ToUserName}]]></FromUserName>
<CreateTime>${Math.floor(Date.now() / 1000)}</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[${replyContent}]]></Content>
</xml>`;

        console.log('回复内容:', replyContent);
        console.log('回复XML:', replyXml);

        res.writeHead(200, { 'Content-Type': 'application/xml' });
        res.end(replyXml);

      } catch (error) {
        console.error('处理错误:', error);
        res.writeHead(500);
        res.end('Error');
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = process.env.PORT || 3006;
server.listen(PORT, () => {
  console.log(`\n✅ 测试服务器启动在 http://localhost:${PORT}`);
  console.log('发送POST请求到 /api/wechat/message 测试');
  console.log('\n测试示例：');
  console.log('1. 关注事件:');
  console.log('   curl -X POST http://localhost:' + PORT + '/api/wechat/message -H "Content-Type: application/xml" -d \'<xml><MsgType>event</MsgType><Event>subscribe</Event><FromUserName>user123</FromUserName><ToUserName>gh_account</ToUserName></xml>\'');
  console.log('\n2. 发送验证码:');
  console.log('   curl -X POST http://localhost:' + PORT + '/api/wechat/message -H "Content-Type: application/xml" -d \'<xml><MsgType>text</MsgType><Content>验证码</Content><FromUserName>user123</FromUserName><ToUserName>gh_account</ToUserName></xml>\'');
});
