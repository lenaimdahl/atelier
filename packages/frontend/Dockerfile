# Build
FROM node:26-alpine AS build

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

# Serve
FROM nginx:1.31.3-alpine

# hadolint ignore=DL3018
RUN apk add --no-cache curl

COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/frontend/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
