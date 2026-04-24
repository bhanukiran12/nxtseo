# 🐳 NxtSEO Docker Deployment Guide

## 🎯 Quick Start (Recommended - Docker Compose)
```bash
# 1. Copy & configure env
cp .env.example .env
# Edit .env with your API keys

# 2. Build & run
docker compose up --build -d

# 3. Access
http://localhost
```

## 🏗️ Architecture
```
┌─────────────────┐    ┌──────────────┐
│   localhost:80  │◄──►│  nginx       │
│                 │    │  SPA + Proxy │
└─────────┬───────┘    └──────────────┘
          │ /api
          ▼
┌─────────────────┐    ┌──────────────┐
│  server:5000    │◄──►│  MongoDB     │
│  Node/Express   │    │  Persistent  │
└─────────────────┘    └──────────────┘
       ▲
       │ client build
```

## 📁 Files Explained
| File | Purpose |
|------|---------|
| `docker-compose.yml` | Orchestrates 4 services |
| `client/Dockerfile` | `npm run build` → nginx static serve |
| `server/Dockerfile` | `npm ci --prod` → `npm start` |
| `nginx.conf` | Routes `/` → frontend, `/api` → backend |
| `Dockerfile` (root) | **Single-container** fallback |
| `.env.example` | Secrets template |
| `init-mongo.js` | Auto-creates DB user |

## 🔧 .env Variables
```
# Required for basic
MONGO_ROOT_PASSWORD=password
SESSION_SECRET=your-secret-key
TARGET_URL=http://example.com

# Services (get from Google Console)
GEMINI_API_KEY=...
GSC_CLIENT_ID=...  # Google Search Console
GMAIL_CLIENT_ID=... # Gmail Outreach

# OAuth Redirect & Frontend URL
GOOGLE_CLIENT_ID=...       # Same as GMAIL_CLIENT_ID (used by server)
GOOGLE_CLIENT_SECRET=...   # Same as GMAIL_CLIENT_SECRET
GOOGLE_REDIRECT_URI=...    # Must match an Authorized redirect URI in Google Console
CLIENT_URL=...             # Where your frontend is served (e.g., http://localhost or https://your-app.onrender.com)
```

## 🔐 Google OAuth — Authorized Redirect URIs

In your [Google Cloud Console](https://console.cloud.google.com/apis/credentials), edit your OAuth 2.0 Client ID and add **exactly** the following redirect URIs under **Authorized redirect URIs**:

| Environment | URI to Register |
|-------------|-----------------|
| Local Dev (Vite) | `http://localhost:5000/api/auth/google/callback` |
| Docker / Nginx | `http://localhost/api/auth/google/callback` |
| Render / Prod | `https://your-app.onrender.com/api/auth/google/callback` |

**Important:** The `GOOGLE_REDIRECT_URI` env var must match one of the URIs above **exactly** (including protocol, port, and trailing slash). The `CLIENT_URL` env var should be the root URL where users access your frontend (e.g., `http://localhost:5173` for local dev, `https://your-app.onrender.com` for production). After successful login, the server redirects users to `${CLIENT_URL}/settings?connected=true`.

### Quick Checklist
- [ ] Create OAuth 2.0 credentials in Google Cloud Console
- [ ] Add the callback URL for your environment to **Authorized redirect URIs**
- [ ] Copy Client ID & Secret into `.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- [ ] Set `GOOGLE_REDIRECT_URI` to the exact callback URL you registered
- [ ] Set `CLIENT_URL` to your frontend's public URL

## 🚀 Commands
```bash
# Dev mode (rebuild)
docker compose up --build

# Prod detached
docker compose up -d --build

# Logs
docker compose logs -f server

# Stop
docker compose down -v  # -v removes volumes

# Single container (simple)
docker build -t nxtseo .
docker run -p 80:80 -v $(pwd)/.env:/app/.env nxtseo
```

## 🧪 Health Checks
```
http://localhost/health          # Nginx
http://localhost/api/health      # Backend  
mongo mongodb:27017/?retryWrites=true  # DB
```

## 📈 Scale / Prod
```bash
# Volumes persist data
docker volume ls  # mongodb_data, client_dist

# Kubernetes/Cloud: Use images after `docker push`
```

## 🔒 Security
- Non-root Node user
- .env gitignored
- Healthchecks + depends_on
- Prod deps only

**All set! Questions?**
