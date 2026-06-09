# Project Manager — Backend

Express API with a **JSON file database** (`data/projects.json`) for shared team project data.

## Quick Start

```bash
cd Backend
npm install
npm run dev
```

API runs at **http://localhost:8000**

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with hot reload |
| `npm run dev:frontend` | Start Frontend only |
| `npm run dev:all` | Backend + Frontend together |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm run start` | Run production build |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/projects` | List all projects |
| `GET` | `/api/projects/meta` | Last update + count |
| `GET` | `/api/projects/:id` | Get one project |
| `POST` | `/api/projects` | Create project |
| `PUT` | `/api/projects/:id` | Update project |
| `DELETE` | `/api/projects/:id` | Delete project |

## Database

All data is stored in:

```
Backend/data/projects.json
```

Back up this file regularly — it is your entire database.

## Deploy (Railway / Render / VPS)

1. Set project root to **`Backend`**
2. Start command: `npm run build && npm run start`
3. Set `PORT` if required by host
4. Persist `data/` folder (volume mount) so data survives restarts

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8000` | Server port |
| `CORS_ORIGIN` | `*` | Allowed frontend origin(s) |

## Structure

```
Backend/
├── data/
│   └── projects.json
├── src/
│   ├── db.ts
│   ├── routes/
│   └── server.ts
└── package.json
```
