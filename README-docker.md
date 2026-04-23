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
```

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
