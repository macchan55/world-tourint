#!/usr/bin/env bash
# Builds the app and copies the output into docs/ for GitHub Pages
# (Settings > Pages > Deploy from a branch > this branch > /docs).
#
# We use GitHub Pages instead of Supabase Storage/Edge Functions because
# Supabase forces text/plain + a locked-down CSP on any object it detects as
# HTML (a deliberate anti-phishing measure on *.supabase.co), which makes it
# impossible to serve an executable index.html from there.
set -euo pipefail

npm run build
rm -rf docs
cp -r dist docs
touch docs/.nojekyll

echo
echo "Built into docs/. Commit and push, then enable GitHub Pages for this"
echo "branch's /docs folder in the repo Settings > Pages."
