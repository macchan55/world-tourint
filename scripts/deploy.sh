#!/usr/bin/env bash
# Builds the app and uploads the JS/CSS/favicon bundle to the Supabase Storage
# "site" bucket, then prints a data: URL that boots the app (index.html is
# served as a data: URL rather than from Storage/Edge Functions, since
# Supabase forces text/plain + a locked-down CSP on any object it detects as
# HTML — a deliberate anti-phishing measure on *.supabase.co).
#
# Requires: SUPABASE_PROJECT_REF, SUPABASE_ANON_KEY env vars.
set -euo pipefail

: "${SUPABASE_PROJECT_REF:?set SUPABASE_PROJECT_REF}"
: "${SUPABASE_ANON_KEY:?set SUPABASE_ANON_KEY}"

SUPA_URL="https://${SUPABASE_PROJECT_REF}.supabase.co"

npm run build

JS_FILE=$(ls dist/assets/*.js | head -1)
CSS_FILE=$(ls dist/assets/*.css | head -1)
JS_NAME=$(basename "$JS_FILE")
CSS_NAME=$(basename "$CSS_FILE")

upload() {
  local src=$1 dest=$2 content_type=$3
  curl -sS -X POST "$SUPA_URL/storage/v1/object/site/$dest" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Content-Type: $content_type" \
    -H "x-upsert: true" \
    --data-binary @"$src" -o /dev/null -w "  %{http_code} $dest\n"
}

echo "Uploading to storage bucket 'site'..."
upload "$JS_FILE" "assets/$JS_NAME" "application/javascript; charset=utf-8"
upload "$CSS_FILE" "assets/$CSS_NAME" "text/css; charset=utf-8"
upload "public/favicon.svg" "favicon.svg" "image/svg+xml"

echo
echo "App URL (data: URL, works in any browser, no server-side HTML hosting needed):"
echo "data:text/html;base64,$(base64 -w0 dist/index.html)"
