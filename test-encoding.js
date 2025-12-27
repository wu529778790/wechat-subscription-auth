// 测试编码问题
const xml = '<xml><ToUserName>gh_test</ToUserName><FromUserName>oTestUser</FromUserName><CreateTime>1234567890</CreateTime><MsgType>text</MsgType><Content>验证码</Content></xml>';

console.log('原始XML:', xml);
console.log('Buffer:', Buffer.from(xml).toString('hex'));

// 模拟解析
const { XMLParser } = require('fast-xml-parser');
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  parseNodeValue: true,
  parseAttributeValue: true
});

const parsed = parser.parse(xml);
console.log('解析结果:', parsed);
console.log('Content:', parsed.xml.Content);
console.log('Content类型:', typeof parsed.xml.Content);

// 测试关键词匹配
const content = (parsed.xml.Content || '').trim();
console.log('处理后内容:', content);

const keywords = ['已关注', '认证', '验证', 'login', '已订阅', '关注了', '验证码'];
const matched = keywords.some(k => content.includes(k));
console.log('关键词匹配:', matched);

// 逐个测试
keywords.forEach(k => {
  const result = content.includes(k);
  console.log(`"${content}".includes("${k}") = ${result}`);
});
