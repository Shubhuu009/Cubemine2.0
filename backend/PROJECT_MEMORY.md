# CUBEMINE - PROJECT MEMORY

> **Last Updated:** 2026-05-12
> **Phase:** Full-Stack Complete — Advanced Build v5 (4 Cube Types + Videos + Support/Contact/Reviews + Upstash Redis) ✅

---

## 📌 Current Progress

**STATUS: FULL-STACK COMPLETE — ADVANCED BUILD v5**

Both backend and frontend are fully implemented with premium UI/UX, 4 cube types (2×2, 3×3, 4×4, 5×5), advanced analytics, leaderboard system, interactive learning with ad-free YouTube video tutorials, Upstash Redis caching, Support/Contact/Reviews pages, and production-ready architecture.

---

## 🛠️ Technology Stack

### Backend
| Dependency | Version | Purpose |
|---|---|---|
| express | ^4.19.2 | Web framework |
| mongoose | ^8.4.1 | MongoDB ODM |
| jsonwebtoken | ^9.0.2 | JWT authentication |
| bcryptjs | ^2.4.3 | Password hashing (12 salt rounds) |
| cors | ^2.8.5 | Cross-origin requests |
| helmet | ^7.1.0 | Security HTTP headers |
| express-rate-limit | ^7.3.1 | Rate limiting (3 tiers) |
| express-validator | ^7.1.0 | Input validation |
| morgan | ^1.10.0 | HTTP request logging (dev only) |
| dotenv | ^16.4.5 | Environment variables |
| ioredis | ^5.4.1 | Redis client (Upstash TLS / standard Redis) |
| node-cache | ^5.1.2 | In-memory cache fallback |
| nodemon | ^3.1.4 | Dev auto-restart (devDep) |

### Frontend
| Dependency | Version | Purpose |
|---|---|---|
| next | ^14.2.5 | React framework (App Router) |
| react / react-dom | ^18.3.1 | UI library |
| typescript | ^5.5.4 | Type safety |
| tailwindcss | ^3.4.7 | Utility-first CSS |
| framer-motion | ^11.3.8 | Animations |
| zustand | ^4.5.4 | State management |
| lucide-react | ^0.424.0 | Icon library |
| three | ^0.184.0 | 3D cube rendering |
| clsx | ^2.1.1 | Class name utility |

---

## ✅ Completed Features

### Backend (Express.js + MongoDB)
- [x] Express server with clean MVC architecture (controllers → services → models)
- [x] MongoDB Atlas connection via Mongoose
- [x] JWT authentication (signup/login) with 7-day expiry
- [x] bcrypt password hashing (12 salt rounds)
- [x] Rate limiting — 3 tiers (API: 100/15m, Auth: 10/15m, Solver: 30/15m)
- [x] Input validation with express-validator
- [x] Centralized error handling — Mongoose validation/duplicate/cast errors parsed
- [x] **Cube solver engine — 4 types: 2×2, 3×3, 4×4, 5×5**
  - 2×2: First layer → OLL → PLL
  - 3×3: Layer-by-layer (7 steps)
  - 4×4: Reduction method (centers → edge pairing → 3×3 → parity)
  - 5×5: Reduction method (centers → tredge pairing → 3×3 → parity)
- [x] Solve history with pagination & cube-type filtering
- [x] User profile with stats (totalSolves, bestTime2x2/3x3/4x4/5x5)
- [x] Best-time auto-update on solve (all 4 cube types)
- [x] **Leaderboard API** — sortable by totalSolves + bestTime for all 4 cube types (public)
- [x] **Statistics API** — overview, Ao5/12/50/100, time distribution, daily activity, time trend, cube breakdown, streaks
- [x] **Upgraded dual-layer caching** — Upstash REST API (fetch-based) OR ioredis TLS primary + node-cache fallback
  - Detects `UPSTASH_REDIS_REST_URL + TOKEN` first → uses REST client (no socket)
  - Falls back to `REDIS_URL` ioredis → then node-cache in-memory
- [x] **Cache middleware** — `cacheRoute` (public), `cacheUserRoute` (per-user), `invalidateCache`
- [x] **Auto-invalidation** — solving a cube busts leaderboard + user stats cache
- [x] **X-Cache headers** — HIT/MISS + cache type visible in API responses
- [x] **Graceful shutdown** — Redis disconnect on SIGTERM/SIGINT
- [x] Health check endpoint (`/api/health`) — includes cache stats
- [x] **CUBE_CONFIGS** — centralized config for all cube sizes in validators.js

### Frontend (Next.js 14 + TypeScript + Tailwind CSS)
- [x] Next.js App Router with TypeScript
- [x] Tailwind CSS with custom premium design system
- [x] Zustand state management (authStore + solverStore)
- [x] Typed API service layer with auto Bearer token injection
- [x] JWT token persistence in localStorage + hydration on app load
- [x] Framer Motion animations throughout
- [x] Toast notification system (success/error/info)
- [x] Canvas particle background with grid overlay
- [x] **Interactive 3D cube** — Three.js with mouse-drag orbit controls, inertia, dynamic camera distance for larger cubes
- [x] **Rounded sticker geometry** — ShapeGeometry with radius corners
- [x] **Premium 4-light setup** — key/fill/rim/top accent lights, dynamic floor shadow
- [x] **4 cube type selector** — 2×2, 3×3, 4×4, 5×5 with dynamic facelet counts
- [x] Flat face-map grid (6 panels) with premium hover effects
- [x] **Integrated solve timer** with centisecond precision
- [x] **Keyboard shortcuts** — 1-6 colors, arrows rotation, space timer, Ctrl+Z undo, ? help
- [x] **Undo functionality** — 50-step undo stack for sticker changes
- [x] **Color balance indicator** — shows count per color with dynamic expected values per cube type
- [x] **Copy moves to clipboard**
- [x] **Enhanced scramble generator** — supports 2×2 through 5×5 with wide-layer/triple-layer moves
- [x] **Premium auth pages** — split layout, gradient-border glass cards, animated input icons
- [x] **Password strength bar** — animated progress bar with Weak/Fair/Good/Strong labels
- [x] **Gradient mesh background** — floating colored orbs, scrolling grid, pulsing particles
- [x] **Toast notifications** — progress bar countdown, type-specific glow shadows
- [x] **Premium CSS design system** — glass-gradient, glass-premium, gradient-text-*, card-premium, badge-* variants, animated gradient borders, new keyframes (slide-up, scale-in, float-y, glow-pulse)
- [x] **SEO optimized** — OG tags, keywords meta, font preconnect hints
- [x] **Leaderboard page** — podium top 3, sortable by all 5 options (solves + 4 cube best times), color-coded time columns
- [x] **Statistics page** — SVG sparkline chart, bar chart, donut chart, activity heatmap, rolling averages
- [x] **Enhanced Dashboard** — all 4 cube best times shown individually, 5-filter history (all/2x2/3x3/4x4/5x5), success rate card, animated stat cards
- [x] **Enhanced Learn page** — 5 tabs (2×2/3×3/4×4/5×5/Videos), expandable step cards, algorithm stepper, face reference, progress bar
- [x] **Ad-free YouTube Video Tutorials** — embedded via youtube-nocookie.com (JPerm tutorials for all cube types)
- [x] **Enhanced Settings** — avatar + stats, animated toggles, data export, danger zone
- [x] **Upgraded Home** — interactive cube type showcase with tab switcher, parallax hero + glow badge, trust badges CTA, cube type detail panel
- [x] **Upgraded Navbar** — animated icon swap, active state on icon buttons, Reviews + Support links, better mobile menu
- [x] **Upgraded Footer** — 4-column layout (Cube Solver / Learn & Community / Platform), tech stack row, ambient glow, all new pages linked
- [x] **Enhanced 404** — rotating cube, scattered pieces animation, cube fun fact
- [x] **Support Page** — searchable FAQ accordion, 5 category filters (Getting Started, Solver, Account, Performance, Technical), quick-link cards
- [x] **Contact Page** — validated contact form (name, email, topic dropdown, message), sidebar with response time + alternative contacts, success animation
- [x] **Reviews Page** — aggregate rating + breakdown chart, filterable by cube type, helpful votes, verified user badges, interactive star rating form
- [x] Protected route wrapper
- [x] Responsive mobile navigation

---

## 📄 Pages (13 total)

| Page | Route | Auth | Description |
|---|---|---|---|
| **Home** | `/` | No | Interactive cube showcase, parallax hero, stats bar, features, testimonials, CTA |
| **Login** | `/login` | No | Brand logo, email/password form, toast on success/error |
| **Signup** | `/signup` | No | Password strength indicator, confirm match, toast on success |
| **Solver** | `/solver` | No* | 3D cube (2×2–5×5), flat face maps, color picker with counts, timer bar, keyboard shortcuts, undo, scramble, solution |
| **Learn** | `/learn` | No | 5 tabs (2×2/3×3/4×4/5×5/Videos), notation reference, face reference, expandable steps, algorithm stepper, YouTube tutorials |
| **Leaderboard** | `/leaderboard` | No | Podium top 3, 5-option sort (solves + all 4 best times), color-coded table |
| **Dashboard** | `/dashboard` | Yes | All 4 cube PBs, sparkline charts, animated counters, rolling averages, 5-filter history table |
| **Statistics** | `/statistics` | Yes | SVG sparkline, bar chart, donut chart, activity heatmap, Ao5/12/50/100 |
| **Settings** | `/settings` | Yes | Avatar + stats, appearance toggle, notification/shortcut toggles, data export, danger zone |
| **Support** | `/support` | No | Searchable FAQ accordion, 5 category filters, quick-link cards |
| **Contact** | `/contact` | No | Validated contact form, sidebar info, success animation |
| **Reviews** | `/reviews` | No | Aggregate rating, breakdown chart, filterable reviews, submit review form |
| **404** | any | No | Rotating cube, scattered cube pieces, fun fact, go home / go back |

> *Solver requires auth to **save** history but works without login.

---

## 🧩 Cube Types Supported

| Type | Grid | Facelets | Scramble Moves | Solver Method |
|---|---|---|---|---|
| **2×2** | 2×2×2 | 24 | 9 | First Layer → OLL → PLL |
| **3×3** | 3×3×3 | 54 | 20 | Layer-by-layer (7 steps) |
| **4×4** | 4×4×4 | 96 | 40 | Reduction: Centers → Edges → 3×3 → Parity |
| **5×5** | 5×5×5 | 150 | 60 | Reduction: Centers → Tredges → 3×3 → Parity |

---

## 🗄️ Database Schemas

### User
```
{
  username:    String (unique, 3-30 chars, alphanumeric + underscore)
  email:       String (unique, lowercase)
  password:    String (hashed, select:false)
  totalSolves: Number (default: 0)
  bestTime2x2: Number|null (milliseconds)
  bestTime3x3: Number|null (milliseconds)
  bestTime4x4: Number|null (milliseconds)
  bestTime5x5: Number|null (milliseconds)
  timestamps:  createdAt, updatedAt
}
```

### SolveHistory
```
{
  userId:       ObjectId → User (indexed)
  cubeType:     '2x2' | '3x3' | '4x4' | '5x5'
  initialState: [String] (flat color array)
  solveMoves:   [String]
  moveCount:    Number
  solveTime:    Number|null (milliseconds)
  solved:       Boolean (default: true)
  timestamps:   createdAt, updatedAt
}
```

---

## 🔒 Environment Variables

### Backend (.env)
| Variable | Example | Required |
|---|---|---|
| `PORT` | 5000 | No (default: 5000) |
| `NODE_ENV` | development | No |
| `MONGO_URI` | mongodb+srv://... | ✅ Yes |
| `JWT_SECRET` | (long secret string) | ✅ Yes |
| `JWT_EXPIRES_IN` | 7d | No (default: 7d) |
| `CORS_ORIGIN` | http://localhost:3000 | No (default: *) |
| `UPSTASH_REDIS_REST_URL` | https://xxx.upstash.io | No (Option A — REST) |
| `UPSTASH_REDIS_REST_TOKEN` | (token) | No (Option A — REST) |
| `REDIS_URL` | rediss://default:...@endpoint:port | No (Option B — ioredis) |

> Cache priority: Upstash REST → ioredis → node-cache (in-memory)

### Frontend (.env.local)
| Variable | Example | Required |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | http://localhost:5000/api | ✅ Yes |

---

## 📁 Full Project Structure

```
COLLEGE PROJECT/
├── package.json                    # Root: monorepo scripts
├── backend/
│   ├── .env                        # MONGO_URI, JWT_SECRET, REDIS options
│   ├── .env.example                # Documented env template
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   └── solver.controller.js       # BEST_TIME_FIELD map for 4 cube types
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   └── solver.routes.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── cache.service.js           # Upstash REST + ioredis + node-cache
│   │   │   ├── memoryStore.js
│   │   │   └── solver.service.js          # 2×2, 3×3, 4×4, 5×5 solver algorithms
│   │   ├── models/
│   │   │   ├── User.js                    # + bestTime4x4, bestTime5x5
│   │   │   └── SolveHistory.js            # cubeType enum: 2x2|3x3|4x4|5x5
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── rateLimit.middleware.js
│   │   │   ├── validation.middleware.js   # solveValidation accepts 4 types
│   │   │   ├── cache.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   ├── hash.js
│   │   │   └── validators.js              # CUBE_CONFIGS + VALID_CUBE_TYPES
│   │   ├── config/db.js
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── PROJECT_MEMORY.md
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                   # Home: interactive cube showcase
│   │   │   ├── globals.css                # Premium design system (upgraded v5)
│   │   │   ├── not-found.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── solver/page.tsx            # 4 cube type tabs (2×2–5×5)
│   │   │   ├── learn/page.tsx             # 5 tabs + YouTube ad-free videos
│   │   │   ├── dashboard/page.tsx         # All 4 PBs + 5-filter history
│   │   │   ├── settings/page.tsx
│   │   │   ├── leaderboard/page.tsx       # 5-sort options + all 4 cube columns
│   │   │   ├── statistics/page.tsx
│   │   │   ├── support/page.tsx           # ✨ NEW: Searchable FAQ
│   │   │   ├── contact/page.tsx           # ✨ NEW: Contact form
│   │   │   └── reviews/page.tsx           # ✨ NEW: Community reviews
│   │   ├── components/
│   │   │   ├── Navbar.tsx                 # + Reviews + Support links
│   │   │   ├── Footer.tsx                 # 4-col layout + all new pages
│   │   │   ├── CubeGrid.tsx              # Dynamic gridSize + camera for NxN
│   │   │   ├── MoveList.tsx
│   │   │   ├── Timer.tsx
│   │   │   ├── ScrambleGenerator.tsx      # 4 move sets + scramble lengths
│   │   │   ├── AnimatedBackground.tsx
│   │   │   ├── HeroCube.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Loader.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── services/api.ts
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   └── solverStore.ts             # GRID_SIZES map for dynamic state
│   │   └── types/index.ts                # CubeType = '2x2'|'3x3'|'4x4'|'5x5'
│   ├── .env.local
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── postcss.config.js
│   └── package.json
```

---

## 🚀 How to Run Locally

```bash
# Terminal 1: Backend
cd backend
npm install
# Edit .env → set MONGO_URI, JWT_SECRET
# Optionally set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN for Redis
npm run dev          # → http://localhost:5000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev          # → http://localhost:3000
```

---

## ⚠️ Known Limitations / Notes
- **Solver engine is simplified** — uses static algorithm sequences rather than analyzing actual cube state.
- **Theme toggle is a placeholder** — UI present on Settings page but only dark mode is implemented.
- **Profile editing** — not implemented yet (Settings page shows read-only fields).
- **Delete account** — UI present but backend endpoint not fully implemented.
- **Notification/keyboard preferences** — stored in component state only; not persisted to backend.
- **Contact/Reviews forms** — frontend only; no backend API yet (simulate success for demo).

---

## ⏭️ Future Enhancements
- [ ] Email verification, Password reset, CAPTCHA
- [ ] Light theme implementation
- [ ] Profile editing (username, avatar upload)
- [ ] Kociemba optimal solver
- [ ] WebSocket real-time racing
- [ ] PWA capabilities
- [ ] Admin dashboard
- [ ] Tests (Jest, React Testing Library, Cypress)
- [ ] Persist user preferences to backend
- [ ] Delete account backend endpoint
- [ ] Contact/Reviews backend API & database storage
- [ ] 6×6 and 7×7 cube support
