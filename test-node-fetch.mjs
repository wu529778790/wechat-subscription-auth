// 使用 Node.js fetch 发送正确的 UTF-8 编码
import fetch from 'node-fetch';

const xmlContent = '<xml><MsgType>text</MsgType><Content>验证码</Content><FromUserName>testuser</FromUserName><ToUserName>gh_test</ToUserName></xml>';

console.log('='.repeat(60));
console.log('测试：使用 Node.js 发送 UTF-8 编码');
console.log('='.repeat(60));

console.log('\n1. 原始 XML:');
console.log(xmlContent);

console.log('\n2. UTF-8 字节:');
console.log('   ' + Buffer.from(xmlContent, 'utf8').toString('hex'));

console.log('\n3. 发送到诊断接口...');

try {
  const response = await fetch('https://auth.shenzjd.com/api/wechat/diagnostic', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    },
    body: xmlContent
  });

  console.log('\n4. 响应状态:', response.status);
  const result = await response.json();
  console.log('\n5. 响应内容:');
  console.log(JSON.stringify(result, null, 2));

  console.log('\n6. 分析:');
  console.log('   - 收到内容:', result.bodyPreview);
  console.log('   - Hex:', result.bodyHex);
  console.log('   - UTF8:', result.bodyUtf8);

  // 检查是否乱码
  const hasMojibake = result.bodyPreview && (result.bodyPreview.includes('�') || result.bodyHex.includes('efbfbd'));
  console.log('   - 是否乱码:', hasMojibake);

} catch (error) {
  console.log('\n错误:', error.message);
}

console.log('\n' + '='.repeat(60));
console.log('现在测试消息接口...');
console.log('='.repeat(60));

try {
  const response = await fetch('https://auth.shenzjd.com/api/wechat/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    },
    body: xmlContent
  });

  console.log('\n响应状态:', response.status);
  const text = await response.text();
  console.log('响应内容:');
  console.log(text);

  // 检查是否包含验证码
  if (text.includes('验证码') || text.includes('认证码')) {
    console.log('\n✅ 成功！返回了验证码');
  } else {
    console.log('\n❌ 失败！未返回验证码');
  }

} catch (error) {
  console.log('\n错误:', error.message);
}

console.log('\n' + '='.repeat(60));
