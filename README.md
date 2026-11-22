# Lead Manager — Meru Technosoft Screening Assignment

A small full-stack app for a sales user to capture and track leads: add, list,
edit, delete, search/filter by name or status, with validation on the frontend
**and** the backend. Bonus features included: status counts dashboard,
sorting, pagination, and API tests.

## Tech chosen

- **Frontend:** React + Vite (plain CSS). React is the stack I know best.
- **Backend:** Node.js + Express, REST API.
- **Database:** MongoDB via Mongoose. One `Lead` collection; email is unique,
  `status` is indexed, and name/company have a text index for fast search.
- **Tests:** Node's built-in test runner + Supertest, against an in-memory
  MongoDB, so tests need no local database.

## How to run it locally

You need Node.js 18+ and either a local MongoDB or a free MongoDB Atlas cluster.

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env        # edit MONGO_URI if you use Atlas, not local MongoDB
npm run seed                # optional: loads 5 sample leads
npm start                   # API on http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                 # app on http://localhost:5173
```

The frontend talks to the backend through Vite's dev proxy (`/api` → `:5000`).
For a deployed backend, set `VITE_API_URL` in `frontend/.env` instead.

Run the API tests (no database needed — they spin up an in-memory MongoDB):

```bash
cd backend
npm test
```

## API

| Method | Endpoint | What it does |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/leads?search=&status=&sort=newest\|oldest\|name&page=&limit=` | List leads (search matches name, company, email) |
| GET | `/api/leads/stats` | Total + count per status |
| GET | `/api/leads/:id` | One lead |
| POST | `/api/leads` | Create a lead |
| PUT | `/api/leads/:id` | Update a lead (fields and/or status) |
| DELETE | `/api/leads/:id` | Delete a lead |

Lead fields: `name` (required), `email` (required, valid format, unique),
`phone` (required), `company` (optional), `source` (Website / Referral /
Social Media / Cold Call / Advertisement / Other), `status` (New / Contacted /
Qualified / Lost, default New).

## Assumptions

- One shared lead list (no login). Auth was listed as a bonus; I left it out
  to keep the core solid — the brief says a smaller, clean, fully working app
  beats a large, broken one.
- Email is unique per lead, so the same person cannot be added twice; the API
  answers `409` and the form shows "A lead with this email already exists."
- No deployment link yet — the app is built to deploy as-is (backend on
  Render/Railway, frontend on Vercel, MongoDB on Atlas).

## What I would improve with more time

- Simple login so each user sees only their own leads.
- Export leads to CSV.
- A live deployment link.
