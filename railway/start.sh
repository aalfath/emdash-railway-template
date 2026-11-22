#!/bin/sh
# Start script for the EmDash Railway template.
# Node exits non-zero on a crash, so Railway's ON_FAILURE restart policy applies.
set -eu

DATA_DIR=/data
mkdir -p "$DATA_DIR/uploads" "$DATA_DIR/sessions"

# Fall back to the Railway domain if EMDASH_SITE_URL is missing: EmDash refuses
# to run its setup wizard in production without a public origin.
if [ -z "${EMDASH_SITE_URL:-}" ] && [ -n "${RAILWAY_PUBLIC_DOMAIN:-}" ]; then
  EMDASH_SITE_URL="https://${RAILWAY_PUBLIC_DOMAIN}"
  export EMDASH_SITE_URL
fi

# A value pasted with a stray space or newline would be rejected.
if [ -n "${EMDASH_ENCRYPTION_KEY:-}" ]; then
  EMDASH_ENCRYPTION_KEY="$(printf '%s' "$EMDASH_ENCRYPTION_KEY" | tr -d '[:space:]')"
  export EMDASH_ENCRYPTION_KEY
fi

# Keep the JavaScript heap inside a 0.5 GB service (override with NODE_OPTIONS).
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=320}"

if [ -z "${EMDASH_SETUP_PASSWORD:-}" ]; then
  echo "[emdash-start] WARNING: EMDASH_SETUP_PASSWORD is empty, so the setup wizard is not locked." >&2
fi

echo "[emdash-start] EmDash $(node -p 'require("/app/node_modules/emdash/package.json").version') on port ${PORT:-8080}, data in $DATA_DIR"
exec node /app/server.mjs
