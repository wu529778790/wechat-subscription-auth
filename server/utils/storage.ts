// 内存存储 - 极简方案，无需数据库
// 数据存储在内存中，重启后丢失（适合开发/小型项目）

// 认证码存储：code -> {openid, expiredAt, userInfo}
const authCodes = new Map<string, {
  openid: string;
  expiredAt: number;
  nickname?: string;
  headimgurl?: string;
  unionid?: string;
}>();

// 已认证用户：openid -> {authenticatedAt, userInfo}
const authenticatedUsers = new Map<string, {
  authenticatedAt: string;
  nickname?: string;
  headimgurl?: string;
  unionid?: string;
}>();

// 自动清理过期数据（每分钟执行一次）
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;

  for (const [code, data] of authCodes) {
    if (data.expiredAt < now) {
      authCodes.delete(code);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[Storage] 清理了 ${cleaned} 个过期认证码`);
  }
}, 60 * 1000);

/**
 * 保存认证码
 */
export function saveAuthCode(
  code: string,
  openid: string,
  userInfo?: { nickname?: string; headimgurl?: string; unionid?: string }
) {
  const expiryTime = parseInt(process.env.CODE_EXPIRY || '300') * 1000;

  // 删除该用户之前的认证码
  for (const [existingCode, data] of authCodes) {
    if (data.openid === openid) {
      authCodes.delete(existingCode);
    }
  }

  authCodes.set(code, {
    openid,
    expiredAt: Date.now() + expiryTime,
    ...userInfo
  });

  console.log(`[Storage] 保存认证码 ${code} 给用户 ${openid}`);
}

/**
 * 通过认证码获取用户信息
 */
export function getUserByAuthCode(code: string) {
  const data = authCodes.get(code);

  if (!data) return null;

  // 检查是否过期
  if (data.expiredAt < Date.now()) {
    authCodes.delete(code);
    return null;
  }

  return data;
}

/**
 * 删除认证码
 */
export function deleteAuthCode(code: string) {
  return authCodes.delete(code);
}

/**
 * 标记用户为已认证
 */
export function markUserAuthenticated(
  openid: string,
  userInfo: { nickname?: string; headimgurl?: string; unionid?: string }
) {
  authenticatedUsers.set(openid, {
    authenticatedAt: new Date().toISOString(),
    ...userInfo
  });

  console.log(`[Storage] 用户 ${openid} 已认证`);
}

/**
 * 检查用户是否已认证
 */
export function isUserAuthenticated(openid: string) {
  return authenticatedUsers.has(openid);
}

/**
 * 获取已认证用户信息
 */
export function getAuthenticatedUser(openid: string) {
  return authenticatedUsers.get(openid);
}

/**
 * 清除用户认证状态（登出）
 */
export function clearUserAuthentication(openid: string) {
  // 删除认证用户
  authenticatedUsers.delete(openid);

  // 删除该用户的认证码
  for (const [code, data] of authCodes) {
    if (data.openid === openid) {
      authCodes.delete(code);
    }
  }

  console.log(`[Storage] 清除用户 ${openid} 的认证状态`);
}

/**
 * 获取存储统计信息
 */
export function getStorageStats() {
  return {
    authCodes: authCodes.size,
    authenticatedUsers: authenticatedUsers.size
  };
}
