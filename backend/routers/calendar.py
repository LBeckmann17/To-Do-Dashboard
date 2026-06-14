import calendar as _cal
from datetime import datetime, timezone
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models.task import ListType, Task
from schemas.task import TaskResponse

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("", response_model=Dict[str, List[TaskResponse]])
async def get_calendar(
    month: str = Query(..., description="Month in YYYY-MM format, e.g. 2025-06"),
    list_type: Optional[ListType] = None,
    db: AsyncSession = Depends(get_db),
):
    try:
        year, month_num = month.split("-")
        year, month_num = int(year), int(month_num)
        start = datetime(year, month_num, 1, tzinfo=timezone.utc)
        last_day = _cal.monthrange(year, month_num)[1]
        end = datetime(year, month_num, last_day, 23, 59, 59, tzinfo=timezone.utc)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=422, detail="Invalid month format. Use YYYY-MM.")

    stmt = (
        select(Task)
        .where(Task.deadline >= start, Task.deadline <= end)
        .options(selectinload(Task.subtasks), selectinload(Task.tags))
        .order_by(Task.deadline)
    )
    if list_type is not None:
        stmt = stmt.where(Task.list_type == list_type)

    result = await db.execute(stmt)
    tasks = result.scalars().all()

    grouped: Dict[str, List[TaskResponse]] = {}
    for task in tasks:
        day_key = task.deadline.strftime("%Y-%m-%d")
        grouped.setdefault(day_key, []).append(TaskResponse.model_validate(task))

    return grouped
