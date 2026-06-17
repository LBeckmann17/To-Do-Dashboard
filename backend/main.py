import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

load_dotenv()

from database import Base, engine
from routers import calendar, chat, shopping, subtasks, tags, tasks


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        # One-time migration: convert category column from native Postgres enum
        # to VARCHAR so new categories can be added without ALTER TYPE.
        # Runs whenever the column type is still USER-DEFINED (native enum).
        col_type = (await conn.execute(text("""
            SELECT data_type
            FROM information_schema.columns
            WHERE table_name = 'shopping_items' AND column_name = 'category'
        """))).scalar()

        if col_type == "USER-DEFINED":
            await conn.execute(text(
                "ALTER TABLE shopping_items "
                "ALTER COLUMN category TYPE VARCHAR(50) USING category::text"
            ))
            await conn.execute(text("DROP TYPE IF EXISTS shopping_category"))

        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="To-Do Dashboard API",
    description="Personal To-Do Dashboard – Tasks, Shopping, Calendar",
    version="1.0.0",
    lifespan=lifespan,
)

_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
ALLOWED_ORIGINS = [o.strip() for o in _origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router)
app.include_router(subtasks.router)
app.include_router(tags.router)
app.include_router(shopping.router)
app.include_router(calendar.router)
app.include_router(chat.router)


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
