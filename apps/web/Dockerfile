# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json ./
COPY tsconfig.base.json ./

# Copy package manifests (for layer caching)
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/web ./apps/web
COPY packages/ui ./packages/ui

# VITE_API_URL defaults to empty so the frontend uses relative /api/ paths
# proxied by nginx to the api container
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

# Build static assets
RUN pnpm --filter @course-manager/web build

# ── Serve stage (nginx) ───────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

# Copy built assets
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# nginx: serve SPA + proxy /api/ to api container
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  index index.html;\n\n  location /api/ {\n    proxy_pass http://api:3001;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n  }\n\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' \
    > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
