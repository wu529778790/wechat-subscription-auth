// 测试关键词匹配
function containsAuthKeyword(content) {
  const keywords = ['已关注', '认证', '验证', 'login', '已订阅', '关注了', '验证码'];
  return keywords.some(k => content.includes(k));
}

const testContent = '验证码';
console.log('测试内容:', testContent);
console.log('关键词列表:', ['已关注', '认证', '验证', 'login', '已订阅', '关注了', '验证码']);
console.log('匹配结果:', containsAuthKeyword(testContent));

// 逐个测试
keywords = ['已关注', '认证', '验证', 'login', '已订阅', '关注了', '验证码'];
keywords.forEach(k => {
  console.log(`"${testContent}".includes("${k}") = ${testContent.includes(k)}`);
});
