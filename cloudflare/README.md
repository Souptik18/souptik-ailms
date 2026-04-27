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
   - `GROQ_API_KEY`
   - optional `GROQ_MODEL`
3. Point frontend API base:
   - `VITE_API_BASE_URL=https://<your-worker-domain>`

### Run locally

- `npm run cf:dev`

### Deploy

- `npm run cf:deploy`
