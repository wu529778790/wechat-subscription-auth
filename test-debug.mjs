// 调试 containsAuthKeyword

function containsAuthKeyword(content) {
  const keywords = ['已关注', '认证', '验证', 'login', '已订阅', '关注了', '验证码', '1'];
  console.log('输入:', content, '类型:', typeof content);
  console.log('关键词:', keywords);

  const result = keywords.some(k => {
    const match = content.includes(k);
    console.log(`  "${content}".includes("${k}") = ${match}`);
    return match;
  });

  console.log('结果:', result);
  return result;
}

// 测试
console.log('=== 测试 "1" ===');
containsAuthKeyword('1');

console.log('\n=== 测试 "验证码" ===');
containsAuthKeyword('验证码');

console.log('\n=== 测试 "test" ===');
containsAuthKeyword('test');
