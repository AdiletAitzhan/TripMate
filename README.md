# TripMate

How to run the app (frontend + backend).

## What you need

- **Node.js** 18+ and **npm** — for the frontend
- **Docker** and **Docker Compose** — for the backend and all services

---

## 1. Backend

Go to the backend folder and start everything:

```bash
cd TripMate-backend
docker compose up -d
```

Before the first run, create **`TripMate-backend/.env`** with:

| Variable | What it is | Example |
|----------|------------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Cloud Console |
| `MAIL_USERNAME` | Email used to send mail | your@gmail.com |
| `MAIL_PASSWORD` | Email / SMTP password | your app password |
| `MINIO_PUBLIC_URL` | MinIO URL (optional) | `http://localhost:9000` |

Example `.env`:

```env
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MINIO_PUBLIC_URL=http://localhost:9000
```

When it’s running:

- **API (used by frontend):** http://localhost:8083
- Keycloak: http://localhost:8080
- MinIO Console: http://localhost:9001 (login: minio, password: minio123)

---

## 2. Frontend

Install and run:

```bash
cd frontend
npm install
npm run dev
```

Before that, create **`frontend/.env`**:

| Variable | What to set |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API URL: `http://localhost:8083` |

Example `.env`:

```env
VITE_API_BASE_URL=http://localhost:8083
```

The app will open at the URL Vite prints (often http://localhost:5173).

---

## Ports

| Service | Port |
|---------|------|
| API Gateway | 8083 |
| Keycloak | 8080 |
| User Service | 8082 |
| Notification | 8081 |
| Eureka | 8761 |
| MinIO API | 9000 |
| MinIO Console | 9001 |
| PostgreSQL (keycloak) | 5433 |
| PostgreSQL (app) | 5434 |

The frontend talks to the backend at the URL you set in `VITE_API_BASE_URL`. Photos from MinIO are shown via `http://localhost:9000`.
