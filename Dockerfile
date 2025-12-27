# 使用 Node.js 18 Alpine 镜像（轻量级）
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖（使用 pnpm）
RUN corepack enable && pnpm install --frozen-lockfile --prod

# 复制源代码
COPY . .

# 构建项目
RUN pnpm build

# 暴露端口
EXPOSE 3000

# 启动服务
CMD ["pnpm", "preview"]
