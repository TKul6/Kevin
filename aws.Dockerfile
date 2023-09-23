FROM node:18 AS builder

WORKDIR /app

# Cache install dpeendencies

COPY package.json .
COPY package-lock.json .
COPY kevin.core/package.json ./kevin.core/package.json
COPY kevin.aws/package.json ./kevin.aws/package.json
COPY kevin.server/package.json ./kevin.server/package.json
COPY kevin.ui/package.json ./kevin.ui/package.json

COPY kevin.core/package-lock.json ./kevin.core/package-lock.json
COPY kevin.aws/package-lock.json ./kevin.aws/package-lock.json
COPY kevin.server/package-lock.json ./kevin.server/package-lock.json
COPY kevin.ui/package-lock.json ./kevin.ui/package-lock.json

RUN npm run install:core 
RUN npm run install:aws 
RUN npm run install:server 
RUN npm run install:client

RUN npm link @kevin-infra/core @kevin-infra/aws 
# Build solution

COPY kevin.core/ ./kevin.core
COPY kevin.aws ./kevin.aws
COPY kevin.server ./kevin.server
COPY kevin.ui ./kevin.ui

RUN npm run build:core
RUN npm run build:aws

RUN npm run build:server 
RUN npm run build:client

RUN npm run ui:copy-dist

# Release Minify

FROM node:18-alpine AS release

COPY --from=builder /app/kevin.core/dist ./kevin.core/dist
COPY --from=builder /app/kevin.aws/dist ./kevin.aws/dist
COPY --from=builder /app/kevin.server/dist ./kevin.server/dist

COPY --from=builder /app/kevin.core/node_modules ./kevin.core/node_modules
COPY --from=builder /app/kevin.core/package.json ./kevin.core
COPY --from=builder /app/kevin.aws/node_modules ./kevin.aws/node_modules
COPY --from=builder /app/kevin.aws/package.json ./kevin.aws
COPY --from=builder /app/kevin.server/node_modules ./kevin.server/node_modules
COPY --from=builder /app/kevin.server/package.json ./kevin.server
