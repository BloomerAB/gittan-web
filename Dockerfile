FROM node:22-slim AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-slim AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=deps /app/node_modules ./node_modules/
COPY . .
RUN pnpm build && pnpm run build:server

FROM node:22-slim AS prod-deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod && pnpm store prune

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production

RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -s /usr/sbin/nologin appuser

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist-server ./dist-server
COPY --from=builder /app/dist/ ./static/app/
COPY --from=builder /app/dist/landing.html ./static/landing.html
COPY package.json ./

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD ["node", "-e", "require('http').get('http://localhost:3000/',(r)=>{process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"]

CMD ["node", "dist-server/index.js"]
