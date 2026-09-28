#!/usr/bin/env bash
# Boot the app for a fresh session. No DB: all data is client-side mocks (lib/mock/).
# Playwright uses system Chromium (/usr/bin/chromium, override with CHROMIUM_PATH): never `playwright install`.
# Tests: PORT=3100 npx playwright test e2e/smoke.spec.ts
set -euo pipefail
cd "$(dirname "$0")"
npm install
exec npx next dev -p "${PORT:-3000}"
