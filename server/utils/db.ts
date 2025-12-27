// SQLite 数据库管理模块
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let dbInstance: DatabaseType | null = null;

// 数据库文件路径
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'auth.db');

/**
 * 获取数据库实例（单例模式）
 */
export function getDb(): DatabaseType {
  if (dbInstance) {
    return dbInstance;
  }

  // 确保数据目录存在
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  // 打开数据库
  dbInstance = new Database(DB_FILE, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
  });

  // 配置数据库
  dbInstance.pragma('journal_mode = WAL'); // 更好的并发支持
  dbInstance.pragma('synchronous = NORMAL'); // 平衡性能和安全性

  // 初始化表
  initTables(dbInstance);

  return dbInstance;
}

/**
 * 初始化数据库表
 */
function initTables(db: DatabaseType) {
  // 验证码表（临时数据）
  db.exec(`
    CREATE TABLE IF NOT EXISTS auth_codes (
      code TEXT PRIMARY KEY,
      openid TEXT NOT NULL,
      expired_at INTEGER NOT NULL,
      nickname TEXT,
      headimgurl TEXT,
      unionid TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 已认证用户表（持久数据）
  db.exec(`
    CREATE TABLE IF NOT EXISTS authenticated_users (
      openid TEXT PRIMARY KEY,
      unionid TEXT,
      nickname TEXT,
      headimgurl TEXT,
      authenticated_at DATETIME NOT NULL
    )
  `);

  // 创建索引（提升查询性能）
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_auth_codes_openid ON auth_codes(openid)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_auth_codes_expired ON auth_codes(expired_at)
  `);

  console.log('[DB] 数据库初始化完成');
}

/**
 * 关闭数据库连接
 */
export function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    console.log('[DB] 数据库连接已关闭');
  }
}

/**
 * 获取数据库统计信息
 */
export function getDbStats() {
  const db = getDb();

  const authCodesCount = db.prepare('SELECT COUNT(*) as count FROM auth_codes').get() as { count: number };
  const usersCount = db.prepare('SELECT COUNT(*) as count FROM authenticated_users').get() as { count: number };

  return {
    authCodes: authCodesCount.count,
    authenticatedUsers: usersCount.count
  };
}
