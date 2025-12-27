# 存储系统升级 - 持久化方案

## 📋 概述

已将存储系统从**内存存储**升级为**持久化存储**，解决了系统重启后需要重新验证的问题。

---

## ✅ 已完成的改进

### 1. **JSON 文件存储**（默认方案）
- ✅ 数据自动保存到 `data/auth-data.json`
- ✅ 系统重启后数据不丢失
- ✅ 无需编译原生模块，兼容性好
- ✅ 内存缓存 + 节流写入，性能优秀

### 2. **SQLite 数据库支持**（可选方案）
- ✅ 已创建完整的 SQLite 模块 (`server/utils/db.ts`)
- ✅ 可通过环境变量切换：`STORAGE_TYPE=sqlite`
- ✅ 需要编译原生模块（better-sqlite3）

### 3. **数据持久化验证**
```
✅ 认证码 (authCodes) - 持久化
✅ 已认证用户 (authenticatedUsers) - 持久化
✅ 定时清理过期数据
✅ 重启后数据完整保留
```

---

## 📁 新增文件

```
wechat-subscription-auth/
├── server/
│   ├── utils/
│   │   ├── db.ts              # SQLite 数据库管理
│   │   └── storage.ts         # 持久化存储实现
│   └── api/
│       └── test/
│           └── storage.ts     # 存储测试 API
├── data/
│   └── auth-data.json        # 数据文件（自动生成）
└── STORAGE_UPGRADE.md        # 本文档
```

---

## 🔧 使用说明

### 默认使用（JSON 文件）

无需任何配置，数据自动保存：

```bash
pnpm dev
# 数据保存在 data/auth-data.json
```

### 切换到 SQLite（可选）

1. 安装并编译 better-sqlite3：
```bash
pnpm rebuild better-sqlite3
```

2. 设置环境变量：
```bash
STORAGE_TYPE=sqlite pnpm dev
```

---

## 🧪 测试持久化

### 方法1：使用测试 API
```bash
# 测试存储功能
curl http://localhost:3001/api/test/storage
```

### 方法2：手动验证
```bash
# 1. 创建一些数据（正常使用系统）
# 2. 查看数据文件
cat data/auth-data.json

# 3. 重启服务器
# 4. 再次查看，数据仍然存在
cat data/auth-data.json
```

---

## 📊 数据文件示例

```json
{
  "authCodes": {
    "123456": {
      "openid": "user_openid_123",
      "expiredAt": 1766815079155,
      "nickname": "张三",
      "headimgurl": "https://avatar.com/123.jpg",
      "unionid": "unionid_123"
    }
  },
  "authenticatedUsers": {
    "user_openid_123": {
      "authenticatedAt": "2025-12-27T05:52:59.155Z",
      "nickname": "张三",
      "headimgurl": "https://avatar.com/123.jpg",
      "unionid": "unionid_123"
    }
  }
}
```

---

## 🎯 核心优势

| 特性 | 内存存储 | JSON文件 | SQLite |
|------|---------|----------|--------|
| 重启后数据保留 | ❌ | ✅ | ✅ |
| 无需配置 | ✅ | ✅ | ❌ |
| 性能 | 极快 | 快 | 很快 |
| 并发支持 | 有限 | 良好 | 优秀 |
| 适合场景 | 开发 | 小型项目 | 生产环境 |

---

## 🔒 数据安全

- 数据文件存储在 `data/` 目录
- 已加入 `.gitignore`，不会提交到版本控制
- 建议部署时备份 `data/` 目录

---

## ⚡ 性能优化

1. **内存缓存**：减少文件读取次数
2. **节流写入**：最多每秒写入一次
3. **定时清理**：每分钟自动清理过期数据

---

## 🚀 下一步建议

1. **备份策略**：定期备份 `data/auth-data.json`
2. **数据迁移**：如需切换存储方式，可编写迁移脚本
3. **监控**：添加存储统计监控
4. **清理策略**：根据需求调整过期时间

---

## 📝 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `STORAGE_TYPE` | 存储类型：`file` 或 `sqlite` | `file` |
| `CODE_EXPIRY` | 验证码过期时间（秒） | `300` |

---

**升级完成！现在系统重启后用户无需重新验证。** 🎉
