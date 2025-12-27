// 简单测试API
export default defineEventHandler(async (event) => {
  try {
    const method = getMethod(event);

    if (method === 'GET') {
      const query = getQuery(event);
      return {
        method: 'GET',
        query: query,
        message: 'Simple test successful'
      };
    }

    return {
      method: method,
      message: 'Simple test successful'
    };
  } catch (error) {
    console.error('Test error:', error);
    return {
      error: true,
      message: error.message
    };
  }
});
