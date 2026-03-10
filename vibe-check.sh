#!/usr/bin/env bash
set -euo pipefail

# Load env
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

VIBE_BASE_URL="${VIBE_BASE_URL:-http://localhost:3000}"
echo "🎯 Vibe Check — MRM-Blik"
echo "   Base URL: $VIBE_BASE_URL"
echo ""

# Lint
echo "📝 Running lint..."
npm run lint
echo "✅ Lint passed"
echo ""

# Build
echo "🔨 Running build..."
npm run build
echo "✅ Build passed"
echo ""

# Tests
echo "🧪 Running Playwright tests..."
npx playwright test
echo "✅ All tests passed"
echo ""

echo "🎉 Vibe check complete — 0 errors!"
