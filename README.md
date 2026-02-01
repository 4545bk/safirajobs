# SafiraJobs

Job discovery app for Ethiopian students and fresh graduates, focused on NGO / humanitarian / impact jobs.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native + Expo + Expo Router |
| Backend | Node.js + Express |
| Database | MongoDB Atlas (free tier) |
| Hosting | Render (free tier) |
| Data Source | ReliefWeb Jobs API |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- Expo Go app (for mobile testing)

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and generate CRON_SECRET
npm install
npm run dev
```

### Mobile Setup

```bash
cd mobile
npm install
# Update API_BASE_URL in services/api.js if needed
npm start
# Scan QR with Expo Go app
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/jobs` | GET | List jobs (with filters) |
| `/api/jobs/:id` | GET | Get job details |
| `/api/health` | GET | Health check + stats |
| `/api/cron/sync` | GET | External cron trigger |
| `/api/sync` | POST | Manual sync |

### Query Parameters for `/api/jobs`

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (1-1000) |
| `limit` | number | Items per page (1-50) |
| `location` | string | Filter by location |
| `category` | string | Filter by category |
| `experience` | string | Entry, Mid, Senior |
| `search` | string | Text search |

## Environment Variables

```env
MONGODB_URI=mongodb+srv://...
PORT=3000
NODE_ENV=development
LOG_LEVEL=INFO
RELIEFWEB_APPNAME=safirajobs
SYNC_CRON_SCHEDULE=0 */6 * * *
CRON_SECRET=your-32-char-secret
RENDER_EXTERNAL_URL=https://your-app.onrender.com
```

## Production Deployment

### Backend (Render)

1. Push to GitHub
2. Create Web Service on Render
3. Set root directory: `backend`
4. Add environment variables
5. Set up external cron at [cron-job.org](https://cron-job.org):
   - URL: `https://your-app.onrender.com/api/cron/sync`
   - Header: `x-cron-secret: your-secret`
   - Schedule: Every 6 hours

### Mobile (APK)

```bash
cd mobile
npx eas build --platform android --profile preview
```

## Features

- ✅ Job listing with filters and pagination
- ✅ Job detail with Apply button
- ✅ ReliefWeb API sync (every 6 hours)
- ✅ In-memory caching (5-10 min TTL)
- ✅ Rate limiting (100 req/15min)
- ✅ Input validation
- ✅ Security headers (Helmet)
- ✅ Structured JSON logging
