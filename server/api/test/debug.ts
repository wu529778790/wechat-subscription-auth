// 调试API - 检查环境变量
export default defineEventHandler((event) => {
  const config = useRuntimeConfig();

  return {
    message: '调试信息',
    hasToken: !!config.wechat?.token,
    hasAppId: !!config.wechat?.appId,
    hasAesKey: !!config.wechat?.aesKey,
    token: config.wechat?.token ? '已配置' : '未配置',
    appId: config.wechat?.appId ? '已配置' : '未配置',
    aesKey: config.wechat?.aesKey ? '已配置' : '未配置',
    siteUrl: config.public?.siteUrl,
    rawConfig: {
      wechat: {
        token: config.wechat?.token,
        appId: config.wechat?.appId,
        aesKey: config.wechat?.aesKey ? '***' : undefined
      }
    }
  };
});
