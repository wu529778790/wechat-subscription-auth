import { createServer } from 'http';
import { XMLParser } from 'fast-xml-parser';

// 模拟微信消息处理
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  parseNodeValue: true,
  parseAttributeValue: true
});

const server = createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/wechat/message') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      console.log('收到原始内容:', body);
      console.log('Buffer:', Buffer.from(body).toString('hex'));

      const parsed = parser.parse(body);
      const content = parsed.xml.Content;

      console.log('解析后Content:', content);
      console.log('Content长度:', content.length);
      console.log('Content字节:', Buffer.from(content));

      // 关键词匹配
      const keywords = ['已关注', '认证', '验证', 'login', '已订阅', '关注了', '验证码'];
      const matched = keywords.some(k => content.includes(k));
      console.log('匹配结果:', matched);

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`Content: ${content}\nMatched: ${matched}`);
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(3005, () => {
  console.log('测试服务器启动在 http://localhost:3005');
  console.log('发送POST请求到 /api/wechat/message 测试');
});
