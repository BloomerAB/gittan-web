FROM node:22-slim AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html ./
COPY src/ src/
COPY public/ public/
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY <<'NGINX' /etc/nginx/conf.d/default.conf
server {
    listen 3000;
    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://gittan-api:4000/;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX
RUN adduser -D -u 1001 gittan && chown -R gittan:gittan /var/cache/nginx /var/log/nginx /etc/nginx/conf.d
USER 1001
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s CMD wget -q --spider http://localhost:3000/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
