# VentureBoard

I implemented the Express/MongoDB backend with guidance from ChatGPT before introducing Kiro. Kiro inspected the existing APIs, implemented the React frontend, helped fix industry filtering, and prepared the project for deployment. I manually reviewed and tested the resulting changes.

**Live demo:** https://startup-funding-board.onrender.com

---

## Features

- **Authentication** — JWT-based signup and login for founders and investors. Access tokens are kept in memory (never localStorage). Refresh tokens are stored as SHA-256 hashes in MongoDB and rotated on every use. Sessions survive page reloads via a silent refresh on app load.
- **Public startup browsing** — paginated startup listing visible to everyone, including logged-out visitors.
- **Search and filtering** — case-insensitive substring search across startup name and tagline; filter by industry (substring match), funding stage, and fundraising status; pagination resets automatically when filters change.
- **Founder CRUD** — founders can create, edit, and delete their own startup profiles. Ownership is enforced on both client and server; other users cannot modify listings they do not own.
- **Saved startups** — both founders and investors can save and unsave startups. Saved state is shared across the listing page, detail page, and the dedicated saved-startups page without redundant fetches.

---

## Technology stack

### Backend
- **Node.js** with **Express 5** (CommonJS)
- **MongoDB** via **Mongoose 9**
- **JSON Web Tokens** (`jsonwebtoken`) — HS256, 15-minute access tokens
- **bcryptjs** — password hashing (cost factor 12)
- **Zod 4** — request validation
- **helmet**, **express-rate-limit**, **cookie-parser**, **cors**
- **dotenv**

### Frontend
- **React 18** with **Vite 5** (ES modules)
- **React Router 6**
- **Axios** — with request/response interceptors for token attachment and silent refresh
- Plain CSS (no UI framework or CSS-in-JS)

---

## Repository structure

```
startup-funding-board/
├── package.json              # Root: Render build + start scripts
│
├── server/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js         # Entry point — dotenv, DB connect, listen
│       ├── app.js            # Express app factory, middleware, routes
│       ├── config/
│       │   └── db.js
│       ├── controllers/
│       │   ├── user.controller.js
│       │   ├── startup.controller.js
│       │   └── savedStartup.controller.js
│       ├── middleware/
│       │   ├── auth.js           # requireAuth (JWT verify + DB lookup)
│       │   ├── errors.js         # AppError class + centralised errorHandler
│       │   ├── startup.middleware.js  # Zod validation + requireFounder
│       │   └── user.validation.js
│       ├── models/
│       │   ├── user.model.js
│       │   ├── startup.model.js
│       │   └── RefreshSession.js
│       ├── routes/
│       │   ├── user.route.js
│       │   ├── startup.route.js
│       │   └── savedStartup.route.js
│       └── utils/
│           └── authTokens.js     # JWT generation, refresh cookie helpers
│
└── frontend/
    ├── package.json
    ├── .env.example
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx               # Router, protected route wrappers
        ├── api/
        │   ├── client.js         # Axios instance, token management, refresh interceptor
        │   ├── auth.api.js
        │   ├── startups.api.js
        │   ├── savedStartups.api.js
        │   └── index.js
        ├── auth/
        │   ├── AuthContext.jsx   # User state, savedIds, toggleSave
        │   ├── useAuth.js
        │   └── ProtectedRoute.jsx
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.jsx
        │   │   └── Layout.jsx
        │   ├── startups/
        │   │   ├── StartupCard.jsx
        │   │   ├── StartupFilters.jsx
        │   │   ├── StartupForm.jsx
        │   │   ├── StartupGrid.jsx
        │   │   └── SaveButton.jsx
        │   └── ui/
        │       ├── Spinner.jsx
        │       ├── ErrorMessage.jsx
        │       └── Pagination.jsx
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── SignupPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── StartupsPage.jsx
        │   ├── StartupDetailPage.jsx
        │   ├── CreateStartupPage.jsx
        │   ├── EditStartupPage.jsx
        │   └── SavedStartupsPage.jsx
        └── styles/
            └── index.css
```

---

## Local development

### Prerequisites

- Node.js 20 or later
- A running MongoDB instance (local or Atlas)

### 1. Install dependencies

```bash
npm install --prefix server
npm install --prefix frontend
```

### 2. Configure environment variables

**Backend** — copy and edit `server/.env.example`:

```bash
cp server/.env.example server/.env
```

```dotenv
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/startup_funding_board
JWT_ACCESS_SECRET=replace_with_a_long_random_secret
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

Generate a strong `JWT_ACCESS_SECRET`, for example:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Frontend** — copy `frontend/.env.example`:

```bash
cp frontend/.env.example frontend/.env
```

```dotenv
VITE_API_URL=http://localhost:5000
```

### 3. Run both servers

In one terminal:
```bash
cd server && npm run dev
```

In another terminal:
```bash
cd frontend && npm run dev
```

The frontend is available at `http://localhost:5173`.

---

## Production build

The production build compiles the React app into `frontend/dist`. Express serves the static files and falls back to `index.html` for any non-API route.

```bash
# Build (from repo root)
npm run build

# Start
npm start
```

The start command runs `node server/src/server.js`. Set `NODE_ENV=production` so Express enables static serving and sets the `Secure` flag on the refresh cookie.

---

## Deployment on Render

Create a **Web Service** pointing at this repository with:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Start command | `npm start` |

Set these environment variables in the Render dashboard:

| Variable | Description |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | Long random secret for signing access tokens |

`CLIENT_ORIGIN` is not required on Render because the frontend is served from the same origin as the API.

---

## API reference

All API routes are prefixed with `/api`.

### Authentication — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create account; returns access token + sets refresh cookie |
| `POST` | `/api/auth/login` | — | Log in; returns access token + sets refresh cookie |
| `POST` | `/api/auth/refresh` | cookie | Exchange refresh cookie for a new access token (token rotation) |
| `POST` | `/api/auth/logout` | cookie | Revoke refresh session and clear cookie |
| `GET` | `/api/auth/me` | Bearer | Return current user from token |

### Startups — `/api/startups`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/startups` | — | List startups; supports `search`, `industry`, `stage`, `status`, `page`, `limit` |
| `POST` | `/api/startups` | Bearer (founder) | Create a startup |
| `GET` | `/api/startups/:id` | — | Get a single startup |
| `PATCH` | `/api/startups/:id` | Bearer (owner) | Update a startup |
| `DELETE` | `/api/startups/:id` | Bearer (owner) | Delete a startup |

### Saved startups — `/api/saved-startups`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/saved-startups` | Bearer | List saved startups for the current user |
| `PUT` | `/api/saved-startups/:id` | Bearer | Save a startup (idempotent) |
| `DELETE` | `/api/saved-startups/:id` | Bearer | Remove a startup from saved list |

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Returns `{ "status": "ok" }` |

**Error response shapes:**

```json
{ "error": "Human-readable message." }
{ "error": "Invalid input.", "details": [ ... ] }
{ "success": false, "message": "Too many attempts. Please try again later." }
```

---

## AI development experience

This project was built with [Kiro](https://kiro.dev), an agentic AI development environment. The backend was written manually before Kiro was introduced; Kiro implemented the complete React frontend and prepared the project for deployment.

Specific tasks delegated to Kiro:

1. **Frontend authentication and API integration** — React + Vite scaffold, Axios client with in-memory token storage, request/response interceptors with single-flight refresh queuing and retry-loop prevention, `AuthContext` with session restoration, `ProtectedRoute`, login/signup pages, and a responsive navbar.

2. **Startup listing, filtering, and CRUD interface** — public listing page with search, industry/stage/status filters, and pagination; startup detail page; founder create/edit/delete pages with a shared `StartupForm`; stale-response guard using a request-generation counter; INR currency formatting.

3. **Saved-startup interface and shared state** — `savedIds` and `pendingSaveIds` Sets in `AuthContext`, `toggleSave` with optimistic-free state updates, `SaveButton` component used on cards and the detail page, `SavedStartupsPage` that live-filters from context so unsaving removes the card immediately.

4. **Deployment preparation** — single-service Render setup, `express.static` + SPA fallback using Express 5's named wildcard (`/*path`), `trust proxy` for rate-limiter IP detection, root `package.json` build/start scripts, `--include=dev` flag for frontend build dependencies, same-origin API URL via `import.meta.env.PROD`.

### Human review and corrections

Working with Kiro required several rounds of review:

- **Session restoration flow** — Kiro's initial proposal called `GET /api/auth/me` using the refresh cookie. Corrected to: call `POST /api/auth/refresh` first to obtain an access token, then call `GET /api/auth/me` with that token in the `Authorization: Bearer` header, which is how the backend actually works.

- **Industry filter bug** — Detected during browser testing: typing a single character returned "Invalid input." and industry values matched exactly rather than as substrings. The cause was `min(2)` in the Zod list query schema and an exact-match filter in the controller. Directed Kiro to lower the minimum to 1 and replace the exact match with a case-insensitive regex using the existing `escapeSearchText` helper already present in the controller.

- **Deployment configuration** — Reviewed the proposed deployment setup and identified three issues: a `frontend/.env.production` file that was gitignored and would never reach Render; `contentSecurityPolicy: false` on Helmet when the built HTML only loads external same-origin assets and the default CSP is sufficient; and `npm install --prefix frontend` which skips `devDependencies` (including Vite itself) when `NODE_ENV=production`. Each was corrected with a specific fix.

---

## Testing

The application was verified through manual testing:

- **Authentication** — register as founder and investor, login, page reload with session restoration via the refresh cookie, logout and confirmation that the session is cleared.
- **Startup CRUD** — founder creates a startup, edits it, verifies that another user's account cannot see or access the edit/delete controls, and deletes it with the confirmation dialog.
- **Search and filtering** — search by partial name and tagline, filter by single-character industry query, combine filters, confirm pagination resets on filter change.
- **Saving** — save and unsave from the listing page, detail page, and saved-startups page; verify the save button state persists after page reload; verify the saved-startups page removes a card immediately on unsave.
- **Mobile layout** — navbar hamburger menu, single-column grid, filter bar wrapping, form usability on small screens.
- **Deployed functionality** — all of the above verified against the live Render deployment.

No automated test suite is included.

---

## Known limitations

- **Logout does not immediately invalidate the access token.** Logging out revokes the refresh session in MongoDB and clears the refresh cookie, but any access token already issued remains valid for up to 15 minutes until it expires naturally. There is no token blocklist.
- **No email verification.** Accounts are active immediately after registration.
- **No pagination on saved startups.** `GET /api/saved-startups` returns all saved startups in a single response.
- **Industry is a free-text field.** There is no enforced taxonomy, so the same industry can appear under different spellings across startups.
- **Single MongoDB instance.** The app uses one database; there is no read replica or connection pooling beyond Mongoose's built-in pool.
