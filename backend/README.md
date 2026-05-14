# CUBEMINE Backend API

A Rubik's Cube solving and learning platform backend built with Node.js, Express, and MongoDB.

## Features

- 🔐 JWT Authentication (Signup/Login)
- 🧊 2x2 & 3x3 Cube Solver with step-by-step explanations
- 📊 Solve history tracking with pagination
- 👤 User profiles with best times and stats
- 🛡️ Security (Helmet, Rate Limiting, Input Validation)
- ⚡ Clean MVC Architecture

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** JWT + bcryptjs
- **Security:** Helmet, express-rate-limit, express-validator

## Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
cd backend
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Update `MONGO_URI` with your MongoDB Atlas connection string.

### Run Development Server

```bash
npm run dev
```

### Run Production

```bash
npm start
```

## API Endpoints

| Method | Endpoint             | Auth | Description              |
|--------|----------------------|------|--------------------------|
| GET    | /api/health          | No   | Health check             |
| POST   | /api/auth/signup     | No   | Register new user        |
| POST   | /api/auth/login      | No   | Login user               |
| GET    | /api/user/profile    | Yes  | Get user profile         |
| GET    | /api/user/history    | Yes  | Get solve history        |
| POST   | /api/solver/solve    | Yes  | Solve a cube             |

## Deployment

### Render
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables in Render dashboard

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the backend directory
3. Add environment variables in Vercel dashboard

## License

MIT
