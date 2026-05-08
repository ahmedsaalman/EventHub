# EventHub Deployment Notes

This project is prepared to deploy with SQLite retained as requested.

## 1) Backend environment

1. Copy `backend/.env.example` to `backend/.env`.
2. Set strong values for:
   - `DJANGO_SECRET_KEY`
   - `DJANGO_ALLOWED_HOSTS`
   - `DJANGO_CORS_ALLOWED_ORIGINS`
3. Keep `DJANGO_DEBUG=False` in production.

## 2) Frontend environment

1. Copy `frontendd/.env.example` to `frontendd/.env.local`.
2. Set:
   - `NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com`

## 3) Build & run

Backend:

```bash
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py check --deploy
```

Frontend:

```bash
npm install
npm run build
npm run start
```

## 4) Security and runtime

- Serve Django behind a reverse proxy (Nginx/Caddy) with HTTPS.
- Ensure uploaded media and `staticfiles` are writable by the app user.
- Rotate any credentials that were previously hardcoded in settings.
