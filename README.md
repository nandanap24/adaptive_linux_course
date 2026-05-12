# LinuxPath — Adaptive Learning Platform

Full-stack app: React frontend + Express API + PostgreSQL.

---

## Project structure

```
linux-course/
├── backend/
│   ├── server.js      ← Express API (port 3001)
│   ├── schema.sql     ← DB schema (run once if needed)
│   ├── .env           ← DB credentials
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx    ← Main React component
    │   ├── App.css
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js ← proxies /api → localhost:3001
    └── package.json
```

---

## 1 — Check your DB schema

The API expects these tables in the `linux-course` postgres database:

| Table              | Key columns                                                  |
|--------------------|--------------------------------------------------------------|
| `topics`           | id, topic_name, slug                                         |
| `topic_levels`     | id, topic_id, level ('standard'/'layman'/'eli10'), explanation |
| `questions`        | id, level_id, question_text, correct_answer                  |
| `question_options` | id, question_id, option_text                                 |

If your schema differs, edit the SQL queries in `backend/server.js`.  
To create from scratch: `psql -d linux-course -f backend/schema.sql`

---

## 2 — Configure the database connection

Edit `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=linux-course
DB_USER=postgres
DB_PASSWORD=your_password_here
PORT=3001
```

---

## 3 — Install & run the backend

```bash
cd backend
npm install
npm start          # or: npm run dev  (auto-reload with nodemon)
```

You should see:
```
✅  Connected to postgres: linux-course
🚀  API running at http://localhost:3001
```

Test it: `curl http://localhost:3001/api/topics`

---

## 4 — Install & run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## API endpoints

| Method | Path               | Description                      |
|--------|--------------------|----------------------------------|
| GET    | /api/health        | DB connection check              |
| GET    | /api/topics        | All topics + levels + questions  |
| GET    | /api/topics/:slug  | Single topic by slug             |
| POST   | /api/progress      | Save quiz attempt                |

---

## Adaptive learning flow

```
Standard explanation → Quiz
  ├── Pass (≥70%) ───────────────── ✓ Topic done
  └── Fail → Layman explanation → Quiz
                ├── Pass (≥70%) ── ✓ Topic done
                └── Fail → ELI10 explanation → Quiz
                              ├── Pass (≥70%) ✓
                              └── Fail ─ retry
```
