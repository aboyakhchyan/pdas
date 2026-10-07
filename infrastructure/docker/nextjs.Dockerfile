# Build from repo root:
#   docker build -f infrastructure/docker/nextjs.Dockerfile --build-arg APP=web   -t pdas-web .
#   docker build -f infrastructure/docker/nextjs.Dockerfile --build-arg APP=admin -t pdas-admin .
FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS pruner
ARG APP
COPY . .
RUN pnpm dlx turbo@^2 prune @pdas/${APP} --docker

FROM base AS builder
ARG APP
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=pruner /repo/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /repo/out/full/ .
RUN pnpm turbo run build --filter=@pdas/${APP}

FROM node:24-alpine AS runner
ARG APP
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 APP_DIR=apps/${APP}
COPY --from=builder --chown=node:node /repo/apps/${APP}/.next/standalone ./
COPY --from=builder --chown=node:node /repo/apps/${APP}/.next/static ./apps/${APP}/.next/static
COPY --from=builder --chown=node:node /repo/apps/${APP}/public ./apps/${APP}/public
USER node
EXPOSE 3000
CMD node ${APP_DIR}/server.js
