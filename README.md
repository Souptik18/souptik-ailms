# Souptik AILMS

Souptik AILMS
is a full-stack learning platform for public course discovery, student enrollment, LMS video learning, student analytics, secure authentication, and role-based workspace access.

## Hosted Project

https://souptik-ailms.vercel.app

## Repository

https://github.com/Souptik18/souptik-ailms

## What It Does

- Public course marketplace with course previews and instructor detail pages.
- Student and instructor authentication with secure server-controlled sessions.
- Student workspace at `/student/student-workspace`.
- My Learnings page at `/student/my-learnings` for continuing enrolled courses and videos.
- LMS subject viewer with videos, documents, PPT resources, and tutor assistance.
- Admin console isolated under `/url-admin`.
- Role-aware routing for public, student, instructor, and admin flows.
- Cloudflare Worker backend support for API, sessions, LMS videos, feedback, and tutor endpoints.

## Stack

- React 19
- Vite 7
- React Router
- Firebase Authentication
- Firebase Admin verification
- Cloudflare Workers
- Cloudflare KV
- Groq chat completions with `llama-3.3-70b-versatile`
- Recharts
- Radix UI
- Lucide React
- Tailwind CSS tooling

## Architecture

The frontend uses Firebase Authentication to obtain an identity token. The backend verifies that token, creates a secure session, and keeps session authority outside browser-controlled state.

The Cloudflare Worker backend provides:

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

## Main Routes

- `/` - homepage and public marketplace.
- `/course-list` - LMS and course catalog.
- `/course/:courseSlug` - public course detail page.
- `/student/student-workspace` - student workspace.
- `/student/student-workspace/:workspaceTab` - routed student workspace tabs.
- `/student/my-learnings` - enrolled learning page.
- `/student/course/:courseSlug` - enrolled catalog course viewer.
- `/student/subjects/:subject/:subcategory/:videoIndex` - enrolled LMS video viewer.
- `/subjects/:subject/:videoIndex` - public subject preview route.
- `/jobs` - public jobs feed.
- `/login` - login page.
- `/signup` - signup page.
- `/url-admin` - admin login.
- `/url-admin/dashboard` - admin dashboard.
- `/url-admin/courses` - admin courses.
- `/url-admin/students` - admin students.
- `/url-admin/analytics` - admin analytics.
- `/url-admin/settings` - admin settings.

## Local Setup

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Run the Cloudflare Worker locally:

```bash
npm run cf:dev
```

Build the frontend:

```bash
npm run build
```

## Environment

Set these values for the Cloudflare Worker runtime:

```text
APP_ORIGIN=https://souptik-ailms.vercel.app
FIREBASE_PROJECT_ID=
SESSION_COOKIE_SECRET=
YOUTUBE_API_KEY=
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
```

Set the frontend API base to the Cloudflare Worker endpoint:

```text
VITE_API_BASE_URL=https://<cloudflare-worker-domain>
```

## Cloudflare

Worker entry:

```text
cloudflare/worker.js
```

Wrangler config:

```text
wrangler.toml
```

Required KV binding:

```text
KIITX_STATE
```

Deploy Worker:

```bash
npm run cf:deploy
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run cf:dev
npm run cf:deploy
```

## Security Notes

- Login state is not treated as trusted just because it exists in the browser.
- Server-side session validation controls authenticated access.
- Session heartbeat keeps active users valid and expires inactive sessions.
- Student, instructor, and admin routes are separated.
- Admin access is intentionally available only from `/url-admin`.
- SOUPTIK
