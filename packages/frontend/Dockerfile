FROM node:26.13.0-alpine AS build

WORKDIR /app

RUN npm install --global pnpm@10.6.5

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/frontend/package.json packages/frontend/package.json
COPY packages/bookshelf/package.json packages/bookshelf/package.json
RUN pnpm install --frozen-lockfile

COPY packages/frontend packages/frontend
COPY packages/bookshelf packages/bookshelf
ARG VITE_API_URL
RUN pnpm --filter atelier build

FROM nginxinc/nginx-unprivileged:1.31.3-alpine

ARG VITE_API_URL
ENV API_ORIGIN=${VITE_API_URL}

COPY packages/frontend/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/packages/frontend/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s CMD curl -fsS http://localhost:8080/ > /dev/null || exit 1
