# syntax=docker/dockerfile:1
#
# Build from the repository root:
#   docker build -t worklogger-front .
#
# Rebuild, replace the running container, and prune the old image:
#   ./scripts/redeploy-worklogger-front.sh
#
# Run manually:
#   docker run --rm -p 3001:3000 \
#     -e WORKLOGGER_API_URL='http://worklogger-api:3000' \
#     -e EXPOSED_PORT=3000 \
#     --network worklogger-net \
#     worklogger-front

FROM node:20-bookworm-slim AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app

ARG EXPOSED_PORT=3000

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=${EXPOSED_PORT}

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs --home-dir /app --shell /usr/sbin/nologin nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE ${EXPOSED_PORT}

CMD ["node", "server.js"]
