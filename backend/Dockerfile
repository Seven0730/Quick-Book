# 1) Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json ./
RUN npm ci

# Copy Prisma schema & generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy TS config & source, then compile
COPY tsconfig.json ./
COPY src ./src
RUN npm run build   # <-- produces /app/dist

# 2) Runner
FROM node:20-alpine AS runner
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy only the compiled output & Prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY wait-for-db.sh ./

EXPOSE 4000
CMD ["node", "dist/index.js"]
