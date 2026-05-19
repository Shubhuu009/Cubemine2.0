# CUBEMINE

A full-stack Rubik's Cube solving and learning platform. Solve 2×2, 3×3, 4×4, and 5×5 cubes, track your times, compete on the leaderboard, and learn with step-by-step guides and video tutorials.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## What it does

- **Cube solver** — input any 2×2, 3×3, 4×4, or 5×5 cube state and get a step-by-step solution
- **3D cube viewer** — interactive Three.js cube with mouse-drag orbit controls
- **Solve timer** — centisecond-precision timer with keyboard shortcuts
- **History & stats** — rolling averages (Ao5/12/50/100), time distribution, daily activity heatmap
- **Leaderboard** — sortable by total solves or best time for each cube type
- **Learn** — expandable algorithm guides and ad-free YouTube tutorials for all cube sizes
- **Accounts** — JWT auth, personal records, solve history

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Three.js, Zustand |
| Backend | Node.js, Express.js, MongoDB (Mongoose) |
| Auth | JWT + bcryptjs |
| Caching | Upstash Redis (REST API) → ioredis → node-cache fallback |
| Security | Helmet, express-rate-limit, express-validator |

---

## Project Structure

```
COLLEGE PROJECT/
├── backend/        Node.js + Express API
└── frontend/       Next.js app
```

---

## Running Locally

**Prerequisites:** Node.js >= 18, a MongoDB Atlas cluster (free tier works fine)

```bash
# 1. Clone and install
git clone <repo-url>
cd "COLLEGE PROJECT"
npm install        # installs root deps

# 2. Backend
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run dev            # http://localhost:5000

# 3. Frontend (new terminal)
cd frontend
npm install
# .env.local is already set to http://localhost:5000/api
npm run dev            # http://localhost:3000
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Long random secret for signing JWTs |
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | `development` or `production` |
| `CORS_ORIGIN` | No | Allowed frontend origin (default: `*`) |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `7d`) |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis endpoint for caching |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis token |
| `REDIS_URL` | No | Alternative: standard Redis URL (`rediss://...`) |

The caching layer auto-detects what's available: Upstash REST → ioredis → in-memory. If none are set, it silently falls back to in-memory cache — the app works fine without Redis.

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL |

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Server + cache status |
| POST | `/api/auth/signup` | No | Register |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/user/profile` | Yes | User profile + best times |
| GET | `/api/user/history` | Yes | Solve history (paginated, filterable) |
| GET | `/api/user/leaderboard` | No | Top users (cached 30s) |
| GET | `/api/user/statistics` | Yes | Full stats including averages (cached 45s) |
| POST | `/api/solver/solve` | Yes* | Solve a cube + save to history |

*Solver works without auth but won't save history.

**Query params:**
- `/history?cubeType=3x3&page=1&limit=20`
- `/leaderboard?sortBy=bestTime3x3&limit=25`
- `/statistics?cubeType=4x4`

---

## Cube Types

| Type | Facelets | Solver Method | Scramble Moves |
|---|---|---|---|
| 2×2 | 24 | First Layer → OLL → PLL | 9 |
| 3×3 | 54 | Layer-by-layer (7 steps) | 20 |
| 4×4 | 96 | Reduction: Centers → Edges → 3×3 → Parity | 40 |
| 5×5 | 150 | Reduction: Centers → Tredges → 3×3 → Parity | 60 |

---

## Pages

| Page | Route | Auth |
|---|---|---|
| Home | `/` | No |
| Solver | `/solver` | No* |
| Learn | `/learn` | No |
| Leaderboard | `/leaderboard` | No |
| Support | `/support` | No |
| Contact | `/contact` | No |
| Reviews | `/reviews` | No |
| Login | `/login` | No |
| Signup | `/signup` | No |
| Dashboard | `/dashboard` | Yes |
| Statistics | `/statistics` | Yes |
| Settings | `/settings` | Yes |

---

## Deployment

**Backend — Render:**
1. New Web Service → connect repo, set root directory to `backend`
2. Build: `npm install` · Start: `npm start`
3. Add env vars in the Render dashboard

**Frontend — Vercel:**
1. Import repo, set root directory to `frontend`
2. Add `NEXT_PUBLIC_API_URL` pointing to your Render backend URL

---

## Known Limitations

- Solver uses simplified algorithm sequences, not optimal solving (e.g., Kociemba)
- Light theme is not implemented (dark mode only)
- Contact and Reviews forms are frontend-only — no backend storage yet
- Profile editing and account deletion are not implemented

---

## License

MIT — see [LICENSE](./LICENSE)
