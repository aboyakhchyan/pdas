# Build from repo root: docker build -f infrastructure/docker/api.Dockerfile -t hyework-api .
FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS pruner
COPY . .
RUN pnpm dlx turbo@^2 prune @hyework/api --docker

FROM base AS builder
COPY --from=pruner /repo/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /repo/out/full/ .
RUN pnpm turbo run build --filter=@hyework/api \
 && pnpm --filter=@hyework/api deploy --prod --legacy /prod/api

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder --chown=node:node /prod/api ./
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:4000/v1/health || exit 1
CMD ["node", "dist/main.js"]
