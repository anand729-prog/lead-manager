# How to explain this app (read this before any Meru call)

The brief says you must be able to explain every part. Here is the app in
your own words — read it once, then explain it in your own way.

## What it does
A sales user opens the page, adds a lead (name, email, phone, company, source,
status), sees all leads in a table, searches by name/company/email, filters by
status, changes status from a dropdown in the table, edits a lead, and deletes
one only after confirming. The top shows total leads and a count per status.

## How it is built (3 parts)
1. **Frontend — React + Vite** (`frontend/src/`). `App.jsx` holds the page
   state (leads list, search, filter, sort). `api.js` has all fetch calls in
   one place. `LeadForm.jsx` is the add/edit form, `LeadTable.jsx` is the
   table. Validation runs here first so bad input never leaves the browser.
2. **Backend — Node.js + Express** (`backend/src/`). `app.js` wires up
   Express + CORS + JSON parsing + the error handler. `routes/leads.js` has
   the REST endpoints: GET list (with search/filter/sort/pagination), GET
   stats, GET one, POST create, PUT update, DELETE. `validation.js` checks
   every request again on the server — frontend validation alone is not
   trusted, because anyone can call the API directly.
3. **Database — MongoDB + Mongoose** (`backend/src/models/Lead.js`). One
   collection, `Lead`. Email is unique (no duplicate leads), `status` is
   indexed for fast filtering, name/company have a text index for search.

## Why these choices
- React + Node/Express + MongoDB is your MERN stack — the stack you actually
  know, and the brief lists all three as options.
- Validation on both sides: the form catches mistakes instantly, the API
  re-checks so bad data can never reach the database.
- No login on purpose: auth was a bonus, and the brief says a small clean
  working app beats a large broken one. The README says this openly, plus
  what you would add with more time (login, CSV export, live deployment).

## How to run it
Backend: `cd backend && npm install && npm start` (needs MongoDB — local or
Atlas, set `MONGO_URI` in `.env`). Frontend: `cd frontend && npm install &&
npm run dev`. Tests: `cd backend && npm test` — they use an in-memory
MongoDB, so they run with no database at all.

## Tricky parts (if they ask)
- Duplicate email: MongoDB's unique index throws error code 11000; the route
  turns it into a 409 response with a clear message, and the form shows it
  under the email field.
- Search: one query param, `search`, is matched case-insensitively against
  name, company and email with a regex `$or` filter.
- Delete needs two clicks (Delete → Confirm delete) so a slip does not
  wipe a lead.
