# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM base AS migrator

ENV NODE_ENV=production
ENV PATH="/app/node_modules/.bin:${PATH}"

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=node:node package.json package-lock.json prisma.config.ts tsconfig.json ./
COPY --chown=node:node prisma ./prisma

RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
  ./node_modules/.bin/prisma generate

USER node

ENTRYPOINT ["prisma"]
CMD ["migrate", "deploy"]

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
  ./node_modules/.bin/prisma generate
RUN npm run build

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

RUN mkdir -p .next/cache && chown -R node:node .next/cache

USER node
EXPOSE 3000

CMD ["node", "server.js"]
