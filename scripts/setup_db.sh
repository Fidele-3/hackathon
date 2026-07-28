#!/usr/bin/env bash
# Apply migrations + demo seed against whatever DATABASE_URL is in .env
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "Missing .env — copy .env.example and set DATABASE_URL + GOOGLE_AI_API_KEY"
  exit 1
fi

# shellcheck disable=SC1091
source .venv/bin/activate 2>/dev/null || true

python manage.py migrate --noinput
python manage.py seed_demo

echo ""
echo "Database ready."
echo "Farmer:  +250788000001 / demo1234"
echo "Officer: +250788000010 / demo1234"
echo ""
echo "Start API:  python manage.py runserver 0.0.0.0:8000"
echo "Start PWA:  cd citizen-frontend && npm run dev"
