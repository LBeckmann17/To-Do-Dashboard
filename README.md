# To-Do Dashboard

Personal productivity dashboard – Tasks, Subtasks, Tags, Shopping list, Calendar view.

**Stack:** FastAPI · PostgreSQL (asyncpg) · SQLAlchemy 2 async · Alembic · React (Vite)

---

## Backend

### Local development

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Copy the env template and fill in a local PostgreSQL URL:

```bash
cp .env .env.local
# Edit DATABASE_URL in .env (or export it in your shell)
```

Run the server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs: <http://localhost:8000/docs>  
Health check: <http://localhost:8000/health>

### Database migrations (Alembic)

```bash
# Generate a new migration after model changes
alembic revision --autogenerate -m "describe change"

# Apply all pending migrations
alembic upgrade head

# Roll back one step
alembic downgrade -1
```

> The app also calls `Base.metadata.create_all` on startup as a safety net,
> so migrations are optional for fresh installs but required for schema changes.

---

## Deploy to Railway

### 1 · Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2 · Create a Railway project

1. Go to [railway.app](https://railway.app) → **New Project**
2. Choose **Deploy from GitHub repo** and select your repository

### 3 · Add a PostgreSQL plugin

In your Railway project dashboard:

1. Click **+ New** → **Database** → **PostgreSQL**
2. Railway automatically creates and injects `DATABASE_URL` into your service – no manual config needed

### 4 · Set environment variables

In Railway → your service → **Variables**, add:

| Variable | Value |
|---|---|
| `ALLOWED_ORIGINS` | Your frontend URL, e.g. `https://myapp.vercel.app` |

`DATABASE_URL` and `PORT` are set by Railway automatically.

### 5 · Deploy

Railway triggers a deploy on every `git push` to `main`.  
The `railway.toml` and `Procfile` already configure the start command and health check path (`/health`).

---

## Project structure

```
backend/
├── main.py               # FastAPI app, CORS, lifespan
├── database.py           # Async engine, session, Base
├── .env                  # Local env vars (not committed)
├── Procfile              # Railway start command
├── railway.toml          # Railway build + deploy config
├── requirements.txt
├── alembic.ini
├── alembic/
│   ├── env.py
│   └── versions/
├── models/
│   ├── task.py           # Task, ListType, Priority, task_tags
│   ├── subtask.py
│   ├── tag.py
│   └── shopping.py       # ShoppingItem, ShoppingCategory
├── schemas/
│   ├── task.py
│   ├── subtask.py
│   ├── tag.py
│   └── shopping.py
├── routers/
│   ├── tasks.py          # GET/POST/PUT/PATCH/DELETE /tasks
│   ├── subtasks.py       # /tasks/{id}/subtasks
│   ├── tags.py           # /tags + task-tag assignment
│   ├── shopping.py       # /shopping-items
│   └── calendar.py       # /calendar?month=YYYY-MM
└── services/
    └── auto_categorize.py  # Keyword-based shopping categorization
```

## API overview

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/tasks` | List tasks (filters: list_type, priority, is_completed, deadline_from/to) |
| `POST` | `/tasks` | Create task |
| `PUT` | `/tasks/{id}` | Update task |
| `PATCH` | `/tasks/{id}/complete` | Toggle completion |
| `DELETE` | `/tasks/{id}` | Delete task |
| `GET` | `/tasks/{id}/subtasks` | List subtasks |
| `POST` | `/tasks/{id}/subtasks` | Create subtask |
| `PATCH` | `/tasks/{id}/subtasks/{sid}/complete` | Toggle subtask |
| `GET` | `/tags` | List tags |
| `POST` | `/tags` | Create tag |
| `POST` | `/tasks/{id}/tags/{tag_id}` | Assign tag |
| `DELETE` | `/tasks/{id}/tags/{tag_id}` | Remove tag |
| `GET` | `/shopping-items` | List items (filters: category, is_completed) |
| `GET` | `/shopping-items/total` | `{ total_price, item_count }` of open items |
| `POST` | `/shopping-items` | Create item (auto-categorize if no category given) |
| `PUT` | `/shopping-items/{id}` | Update item |
| `PATCH` | `/shopping-items/{id}/complete` | Toggle completion |
| `DELETE` | `/shopping-items/completed` | Clear all completed items |
| `GET` | `/calendar?month=2025-06` | Tasks with deadlines grouped by date |
| `GET` | `/health` | Health check |
