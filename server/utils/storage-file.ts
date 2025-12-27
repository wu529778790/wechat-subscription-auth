// JSON 文件存储 - 持久化方案（无需编译原生模块）
// 数据存储在 JSON 文件中，重启后不会丢失

import fs from 'fs';
import path from 'path';

// 数据文件路径
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'auth-data.json');

interface AuthCodeData {
  openid: string;
  expiredAt: number;
  nickname?: string;
  headimgurl?: string;
  unionid?: string;
}

interface AuthenticatedUserData {
  authenticatedAt: string;
  nickname?: string;
  headimgurl?: string;
  unionid?: string;
}

interface StorageData {
  authCodes: Record<string, AuthCodeData>;
  authenticatedUsers: Record<string, AuthenticatedUserData>;
}

// 内存缓存（减少文件读写）
let memoryCache: StorageData | null = null;
let lastWriteTime = 0;

/**
 * 确保数据目录存在
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * 从文件加载数据
 */
function loadData(): StorageData {
  if (memoryCache) {
    return memoryCache;
  }

  ensureDataDir();

  if (!fs.existsSync(DATA_FILE)) {
    memoryCache = { authCodes: {}, authenticatedUsers: {} };
    return memoryCache;
  }

  try {
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    memoryCache = JSON.parse(content);
    return memoryCache;
  } catch (error) {
    console.error('[Storage] Failed to load data:', error);
    memoryCache = { authCodes: {}, authenticatedUsers: {} };
    return memoryCache;
  }
}

/**
 * 保存数据到文件（带节流）
 */
function saveData(data: StorageData, force = false) {
  const now = Date.now();

  // 节流：最多每 1 秒写入一次（除非强制）
  if (!force && now - lastWriteTime < 1000) {
    memoryCache = data;
    return;
  }

  ensureDataDir();

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    memoryCache = data;
    lastWriteTime = now;
    console.log('[Storage] 数据已保存到文件');
  } catch (error) {
    console.error('[Storage] Failed to save data:', error);
  }
}

/**
 * 清理过期数据
 */
function cleanupExpiredData() {
  const data = loadData();
  const now = Date.now();
  let cleaned = 0;

  // 清理过期的认证码
  for (const [code, codeData] of Object.entries(data.authCodes)) {
    if (codeData.expiredAt < now) {
      delete data.authCodes[code];
      cleaned++;
    }
  }

  if (cleaned > 0) {
    saveData(data);
    console.log(`[Storage] 清理了 ${cleaned} 个过期认证码`);
  }
}

/**
 * 保存认证码（用户关注公众号时调用）
 */
export function saveAuthCode(
  code: string,
  openid: string,
  userInfo?: { nickname?: string; headimgurl?: string; unionid?: string }
) {
  const data = loadData();
  const expiryTime = parseInt(process.env.CODE_EXPIRY || '300') * 1000;
  const expiredAt = Date.now() + expiryTime;

  // 删除该用户之前的认证码（一个用户只有一个有效验证码）
  for (const [existingCode, codeData] of Object.entries(data.authCodes)) {
    if (codeData.openid === openid) {
      delete data.authCodes[existingCode];
    }
  }

  // 保存新的认证码
  data.authCodes[code] = {
    openid,
    expiredAt,
    nickname: userInfo?.nickname,
    headimgurl: userInfo?.headimgurl,
    unionid: userInfo?.unionid
  };

  saveData(data);
  console.log(`[Storage] 保存认证码 ${code} 给用户 ${openid}`);
}

/**
 * 通过认证码获取用户信息
 */
export function getUserByAuthCode(code: string) {
  const data = loadData();
  const now = Date.now();

  const codeData = data.authCodes[code];
  if (!codeData) return null;

  // 检查是否过期
  if (codeData.expiredAt < now) {
    delete data.authCodes[code];
    saveData(data);
    return null;
  }

  return codeData;
}

/**
 * 删除认证码
 */
export function deleteAuthCode(code: string) {
  const data = loadData();
  const exists = code in data.authCodes;

  if (exists) {
    delete data.authCodes[code];
    saveData(data);
  }

  return exists;
}

/**
 * 标记用户为已认证
 */
export function markUserAuthenticated(
  openid: string,
  userInfo: { nickname?: string; headimgurl?: string; unionid?: string }
) {
  const data = loadData();

  data.authenticatedUsers[openid] = {
    authenticatedAt: new Date().toISOString(),
    nickname: userInfo?.nickname,
    headimgurl: userInfo?.headimgurl,
    unionid: userInfo?.unionid
  };

  saveData(data);
  console.log(`[Storage] 用户 ${openid} 已认证`);
}

/**
 * 检查用户是否已认证
 */
export function isUserAuthenticated(openid: string) {
  const data = loadData();
  return openid in data.authenticatedUsers;
}

/**
 * 获取已认证用户信息
 */
export function getAuthenticatedUser(openid: string) {
  const data = loadData();
  return data.authenticatedUsers[openid] || null;
}

/**
 * 清除用户认证状态（登出）
 */
export function clearUserAuthentication(openid: string) {
  const data = loadData();

  // 删除认证用户
  const userDeleted = delete data.authenticatedUsers[openid];

  // 删除该用户的认证码
  let codesDeleted = 0;
  for (const [code, codeData] of Object.entries(data.authCodes)) {
    if (codeData.openid === openid) {
      delete data.authCodes[code];
      codesDeleted++;
    }
  }

  if (userDeleted || codesDeleted > 0) {
    saveData(data);
    console.log(`[Storage] 清除用户 ${openid} 的认证状态 (用户: ${userDeleted ? 1 : 0}, 验证码: ${codesDeleted})`);
  }
}

/**
 * 获取存储统计信息
 */
export function getStorageStats() {
  const data = loadData();
  return {
    authCodes: Object.keys(data.authCodes).length,
    authenticatedUsers: Object.keys(data.authenticatedUsers).length
  };
}

/**
 * 通过openid查找认证码（用于公众号发送消息后，用户输入时）
 */
export function findAuthCodeByOpenid(openid: string): string | null {
  const data = loadData();

  for (const [code, codeData] of Object.entries(data.authCodes)) {
    if (codeData.openid === openid) {
      return code;
    }
  }
  return null;
}

// 启动定时清理任务
setInterval(cleanupExpiredData, 60 * 1000);

// 程序启动时也清理一次
cleanupExpiredData();

console.log('[Storage] JSON 文件存储已初始化');
