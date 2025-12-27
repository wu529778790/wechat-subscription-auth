// Session 管理 API - 极简版
// 路由: /api/auth/session

import { useSession } from '~/server/utils/session';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);

  // 设置 Session
  if (method === 'POST') {
    const body = await readBody(event);
    const { user } = body;

    if (!user || !user.openid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing user information'
      });
    }

    const session = await useSession(event);
    await session.update({
      authenticated: true,
      user: {
        openid: user.openid,
        unionid: user.unionid,
        nickname: user.nickname,
        headimgurl: user.headimgurl,
        authenticatedAt: user.authenticatedAt || new Date().toISOString()
      }
    });

    return { success: true };
  }

  // 获取 Session
  if (method === 'GET') {
    const session = await useSession(event);
    return session.value;
  }

  // 清除 Session（登出）
  if (method === 'DELETE') {
    const session = await useSession(event);
    await session.clear();
    return { success: true };
  }

  return 'Method Not Allowed';
});
