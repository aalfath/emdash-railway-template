# EmDash CMS for Railway: the official EmDash blog starter (emdash-cms/emdash
# templates/blog at tag emdash@1.6.0), built as a standalone Node.js server.
# SQLite database, media uploads and login sessions live on the /data volume.
# Every dependency is pinned exactly in app/package-lock.json; the Node.js base
# image is pinned by version and digest.

FROM node:24.22.3-bookworm-slim@sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54 AS build
WORKDIR /app
ENV ASTRO_TELEMETRY_DISABLED=1 NPM_CONFIG_UPDATE_NOTIFIER=false
COPY app/package.json app/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY app/ ./
# Astro needs the public origin at build time to optimize images stored on the
# volume. Railway passes the service variable of the same name as a build arg.
ARG EMDASH_SITE_URL=""
# Builders often report far more CPUs and RAM than the build may use; cap the
# heap and the native thread pools so the build stays inside about 3 GB.
ENV NODE_OPTIONS=--max-old-space-size=2048 RAYON_NUM_THREADS=2 UV_THREADPOOL_SIZE=4
RUN EMDASH_SITE_URL="$EMDASH_SITE_URL" npm run build \
    && npm prune --omit=dev --no-audit --no-fund \
    && npm cache clean --force

FROM node:24.22.3-bookworm-slim@sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080 \
    ASTRO_TELEMETRY_DISABLED=1 \
    EMDASH_TRUSTED_PROXY_HEADERS=x-real-ip
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY railway/start.sh /usr/local/bin/emdash-start
RUN chmod 755 /usr/local/bin/emdash-start
EXPOSE 8080
CMD ["emdash-start"]
