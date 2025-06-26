#!/usr/bin/env sh
set -e

echo "⏳ Waiting for Postgres at db:5432..."
while ! nc -z db 5432; do
  sleep 1
done

echo "✅ Postgres is up – launching backend"
exec node dist/index.js
