FROM node:18 AS builder

WORKDIR /app

# Cache install dpeendencies

COPY package.json .
COPY package-lock.json .
COPY kevin.core/package.json ./kevin.core/package.json
COPY kevin.redis/package.json ./kevin.redis/package.json
COPY kevin.server/package.json ./kevin.server/package.json
COPY kevin.ui/package.json ./kevin.ui/package.json

COPY kevin.core/package-lock.json ./kevin.core/package-lock.json
COPY kevin.redis/package-lock.json ./kevin.redis/package-lock.json
COPY kevin.server/package-lock.json ./kevin.server/package-lock.json
COPY kevin.ui/package-lock.json ./kevin.ui/package-lock.json


# Build solution

COPY kevin.core/ ./kevin.core
COPY kevin.redis ./kevin.redis
COPY kevin.server ./kevin.server
COPY kevin.ui ./kevin.ui

RUN npm run build:solution

RUN npm run ui:copy-dist

# Release Minify

FROM node:18-alpine AS release

COPY --from=builder /app/kevin.core/dist ./kevin.core/dist
COPY --from=builder /app/kevin.redis/dist ./kevin.redis/dist
COPY --from=builder /app/kevin.server/dist ./kevin.server/dist

COPY --from=builder /app/kevin.core/node_modules ./kevin.core/node_modules
COPY --from=builder /app/kevin.core/package.json ./kevin.core
COPY --from=builder /app/kevin.redis/node_modules ./kevin.redis/node_modules
COPY --from=builder /app/kevin.redis/package.json ./kevin.redis
COPY --from=builder /app/kevin.server/node_modules ./kevin.server/node_modules
COPY --from=builder /app/kevin.server/package.json ./kevin.server
