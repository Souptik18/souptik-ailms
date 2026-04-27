# KIITX NPTEL

This project now uses a server-backed authentication session instead of trusting client-side `localStorage` for login state.

## Architecture

- Frontend sign-in still uses Firebase Authentication to obtain an ID token.
- Backend verifies the Firebase ID token with `firebase-admin`.
- Backend issues a secure `HttpOnly` session cookie.
- Session state and last activity are stored in Firestore.
- Sessions expire after 5 hours of inactivity on the server.

## Required server environment

Copy `.env.server.example` into your runtime environment and set:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `APP_ORIGIN`

Instead of env vars, the server can also read a local service account file from:

```text
serviceAccountKey.json
```

in the project root. That file is gitignored.

## Run locally

Start the auth server:

```bash
npm run server
```

Start the Vite client in a second terminal:

```bash
npm run dev
```

The Vite dev server proxies `/api/*` requests to `http://localhost:4001`.

## Vercel + Render deploy

Frontend (Vercel):

- Deploy this repo on Vercel.
- Set `VITE_API_BASE_URL` to your Render backend URL (for example `https://kiitx-session-api.onrender.com`).
- Redeploy Vercel after setting environment variables.

Backend (Render):

- Use the included `render.yaml` Blueprint.
- Create a Render web service from this repo.
- Set these required environment variables in Render:
  - `APP_ORIGIN` = your Vercel domain (or comma-separated list for multiple frontend origins)
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`
- Keep `NODE_ENV=production` and `SESSION_COOKIE_SAME_SITE=none` so cross-domain cookies work.

## Security notes

- The login session is no longer stored in `localStorage`.
- The server is now the source of truth for session validity.
- Role assignment is stored in Firestore and enforced by the server.
- Sessions are bound to a request fingerprint and invalidated on mismatch.
- Sessions expire after 5 hours of inactivity and 12 hours absolute lifetime.
- Session IDs rotate during use to reduce replay value if one is stolen.
- The existing learner enrollment demo data still uses browser storage and has not been migrated to Firestore yet.
