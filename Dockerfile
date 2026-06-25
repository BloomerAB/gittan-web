FROM node:22-slim AS deps
WORKDIR /app
ARG NPM_TOKEN
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml .npmrc ./
RUN echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> .npmrc && \
    pnpm install --frozen-lockfile && \
    rm -f .npmrc

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
