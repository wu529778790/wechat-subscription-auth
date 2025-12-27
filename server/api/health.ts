// 健康检查API
export default defineEventHandler((event) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Server is running'
  };
});
