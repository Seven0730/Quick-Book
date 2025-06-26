# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app

# 安装依赖
COPY package.json package-lock.json ./
RUN npm ci

# 拷贝源码并 build
COPY . .
RUN npm run build

# 运行阶段
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# 只保留生产依赖
COPY package.json package-lock.json ./
RUN npm ci --only=production

# 拷贝 Next.js build 结果
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "run", "start"]
