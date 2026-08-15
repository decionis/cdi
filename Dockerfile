# Deployable image for Decionis CDI.
#
# Defaults to demo mode, which is what the public demo deployment runs: no
# Decionis credentials, deterministic fixtures, nothing persisted. Set
# CDI_DATA_MODE=live and DECIONIS_API_BASE_URL to run it against the platform —
# CdiRuntimeConfig fails at startup rather than degrading if live mode is
# selected without a base URL.

# ---- deps -------------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
# --frozen-lockfile so the image cannot silently resolve a different tree than
# the one CI audited.
RUN pnpm install --frozen-lockfile

# ---- build ------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-time NODE_ENV=production would make CdiRuntimeConfig default to live and
# demand DECIONIS_API_BASE_URL. next build sets what it needs itself.
RUN pnpm build

# ---- runtime ----------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    CDI_DATA_MODE=demo \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

# Run unprivileged. node:alpine already ships a "node" user.
RUN apk add --no-cache wget

# output: "standalone" emits a self-contained server, but static assets are
# emitted separately and must be placed alongside it.
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000

# /api/health is exempt from the session middleware precisely so probes work.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --spider -q http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
