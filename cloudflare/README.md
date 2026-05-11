## Cloudflare Workers Backend

This project now includes a Worker-native backend at:

- `cloudflare/worker.js`

### Routes provided

- `GET /api/health`
- `GET /api/lms-videos`
- `POST /api/session/login`
- `GET /api/session/me`
- `POST /api/session/heartbeat`
- `POST /api/session/logout`
- `GET /api/courses/:courseId/feedback`
- `POST /api/courses/:courseId/feedback`
- `POST /api/tutor/video-chat`
- `GET /api/tutor/history/:videoId`
- `PUT /api/tutor/history/:videoId`

### Setup

1. Create KV namespaces in Cloudflare and update `wrangler.toml`:
   - `id`
   - `preview_id`
2. Set Worker vars/secrets in Cloudflare:
   - `APP_ORIGIN`
   - `FIREBASE_PROJECT_ID`
   - `SESSION_COOKIE_SECRET`
   - `YOUTUBE_API_KEY`
   - `XAI_API_KEY` for xAI Grok roadmap and tutor generation
   - optional `XAI_MODEL`
   - optional `GROQ_API_KEY` and `GROQ_MODEL` for Groq-compatible fallback workloads
   - `RAPIDAPI_LINKEDIN_JOBS_KEY`
3. Point frontend API base:
   - `VITE_API_BASE_URL=https://<your-worker-domain>`

### Run locally

- `npm run cf:dev`

### Deploy

- `npm run cf:deploy`
