// 真实场景测试：模拟微信实际发送的消息
import { XMLParser } from 'fast-xml-parser';

// 模拟微信消息处理函数
function processWeChatMessage(body) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    parseNodeValue: true,
    parseAttributeValue: true
  });

  const parsed = parser.parse(body);
  const content = parsed.xml.Content;

  console.log('原始内容:', content);
  console.log('Hex:', Buffer.from(content).toString('hex'));

  // 检测乱码
  const hasMojibake = content.includes('�') || Buffer.from(content).toString('hex').includes('efbfbd');
  console.log('是否乱码:', hasMojibake);

  // 关键词列表
  const keywords = ['已关注', '认证', '验证', 'login', '已订阅', '关注了', '验证码'];

  // 1. 精确匹配
  const exactMatch = keywords.some(k => content.includes(k));
  console.log('精确匹配:', exactMatch);

  // 2. 模糊匹配 - 单字
  const hasYan = content.includes('验');
  const hasZheng = content.includes('证');
  const hasMa = content.includes('码');
  const singleCharMatch = hasYan || hasZheng || hasMa;
  console.log('单字匹配:', singleCharMatch, `{验:${hasYan}, 证:${hasZheng}, 码:${hasMa}}`);

  // 3. 模糊匹配 - 字节
  const contentBytes = Buffer.from(content, 'utf8');
  const patterns = [
    Buffer.from('验证码'),
    Buffer.from([0xe9, 0xaa, 0x8c]),
    Buffer.from([0xe8, 0xaf, 0x81]),
    Buffer.from([0xe7, 0xa0, 0x81]),
  ];

  let byteMatch = false;
  for (const pattern of patterns) {
    if (contentBytes.includes(pattern)) {
      console.log('字节匹配:', pattern.toString('hex'));
      byteMatch = true;
      break;
    }
  }

  const finalMatch = exactMatch || singleCharMatch || byteMatch;
  console.log('最终结果:', finalMatch ? '✅ 匹配成功' : '❌ 匹配失败');

  return finalMatch;
}

// 测试用例
console.log('=== 测试1：正常UTF-8 ===');
const normalBody = '<xml><MsgType>text</MsgType><Content>验证码</Content><FromUserName>test</FromUserName><ToUserName>gh</ToUserName></xml>';
processWeChatMessage(normalBody);

console.log('\n=== 测试2：诊断接口返回的乱码 ===');
const mojibakeBody = '<xml><MsgType>text</MsgType><Content>��֤��</Content><FromUserName>test</FromUserName><ToUserName>gh</ToUserName></xml>';
processWeChatMessage(mojibakeBody);

console.log('\n=== 测试3：部分乱码 ===');
const partialBody = '<xml><MsgType>text</MsgType><Content>验�</Content><FromUserName>test</FromUserName><ToUserName>gh</ToUserName></xml>';
processWeChatMessage(partialBody);

console.log('\n=== 测试4：其他关键词 ===');
const otherKeywords = ['已关注', '认证', '验证', 'login'];
otherKeywords.forEach(kw => {
  const body = `<xml><MsgType>text</MsgType><Content>${kw}</Content><FromUserName>test</FromUserName><ToUserName>gh</ToUserName></xml>`;
  console.log(`\n关键词 "${kw}":`);
  processWeChatMessage(body);
});

console.log('\n=== 结论 ===');
console.log('如果测试2返回"匹配成功"，说明修复有效');
console.log('如果返回"匹配失败"，说明需要进一步处理');
