#!/bin/sh
set -e

echo "🔄 Running database migrations..."

# Run Prisma migrations (production safe)
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully"
else
  echo "❌ Migrations failed"
  exit 1
fi

echo "🚀 Starting application..."

# Start Next.js application
exec node server.js

