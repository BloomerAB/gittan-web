# syntax=docker/dockerfile:1
FROM node:22-slim AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml .npmrc ./
# @gittan/types is fetched from npm.gittan.eu; the committed .npmrc resolves the
# token via ${REGISTRY_TOKEN}. The credential arrives as a BuildKit secret mount
# (never a build arg/layer) and is exported only for this single install step.
RUN --mount=type=secret,id=registry-token \
    REGISTRY_TOKEN="$(cat /run/secrets/registry-token)" \
    pnpm install --frozen-lockfile

FROM node:22-slim AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=deps /app/node_modules ./node_modules/
COPY . .
RUN pnpm build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production

RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -s /usr/sbin/nologin appuser

COPY --from=builder /app/build ./build
COPY package.json ./

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD ["node", "-e", "require('http').get('http://localhost:3000/',(r)=>{process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"]

CMD ["node", "build/index.js"]
