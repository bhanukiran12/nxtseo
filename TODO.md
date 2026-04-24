# NxtSEO Docker Deployment TODO

## Plan Steps:
1. ✅ **Exploration & Planning Complete** - No major code issues, Docker plan approved.
2. ✅ Create TODO.md with steps 
3. ✅ Create docker-compose.yml
4. ✅ Create client/Dockerfile 
5. ✅ Create server/Dockerfile
6. ✅ Create nginx.conf
7. ✅ Create .dockerignore
8. ✅ Create .env.example
9. ✅ Fixed Docker & .gitignore added
10. ✅ Ready: docker compose up --build works!

**All steps complete! 🎉**

---

## 🔧 Fix: Authorized Redirect URIs (Post-Deploy)

### Problem
After Google OAuth success, the backend hardcodes `http://localhost:5173/settings` in `server/routes/auth.js`. This breaks production deployments (e.g., Render) where the app runs on a public domain.

### Files Edited
- [x] `server/routes/auth.js` — replaced hardcoded redirect with `process.env.CLIENT_URL`
- [x] `server/index.js` — replaced hardcoded CORS origin with `process.env.CLIENT_URL`
- [x] `docker-compose.yml` — added `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `CLIENT_URL` env vars
- [x] `README-docker.md` — documented exact redirect URIs to register in Google Cloud Console

**All fix steps complete! 🎉**

---

## 🤖 Fix: Gemini Model 404 Error

### Problem
`gemini-1.5-flash` returned a 404 Not Found from the Generative Language API.

### Files Edited
- [x] `server/services/aiService.js` — replaced hardcoded model with `GEMINI_MODEL` env variable (defaults to `gemini-1.5-flash-latest`)

**All fix steps complete! 🎉**

