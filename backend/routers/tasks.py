from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models.task import ListType, Priority, Task
from schemas.task import TaskCreate, TaskResponse, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _load_task(task_id: int):
    return (
        select(Task)
        .where(Task.id == task_id)
        .options(selectinload(Task.subtasks), selectinload(Task.tags))
    )


@router.get("", response_model=List[TaskResponse])
async def get_tasks(
    list_type: Optional[ListType] = None,
    priority: Optional[Priority] = None,
    is_completed: Optional[bool] = None,
    deadline_from: Optional[datetime] = None,
    deadline_to: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Task).options(selectinload(Task.subtasks), selectinload(Task.tags))
    if list_type is not None:
        stmt = stmt.where(Task.list_type == list_type)
    if priority is not None:
        stmt = stmt.where(Task.priority == priority)
    if is_completed is not None:
        stmt = stmt.where(Task.is_completed == is_completed)
    if deadline_from is not None:
        stmt = stmt.where(Task.deadline >= deadline_from)
    if deadline_to is not None:
        stmt = stmt.where(Task.deadline <= deadline_to)
    stmt = stmt.order_by(Task.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(_load_task(task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(data: TaskCreate, db: AsyncSession = Depends(get_db)):
    task = Task(**data.model_dump())
    db.add(task)
    await db.commit()
    result = await db.execute(_load_task(task.id))
    return result.scalar_one()


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, data: TaskUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    task.updated_at = _utcnow()
    await db.commit()
    result = await db.execute(_load_task(task_id))
    return result.scalar_one()


@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def toggle_task_complete(task_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.is_completed = not task.is_completed
    task.updated_at = _utcnow()
    await db.commit()
    result = await db.execute(_load_task(task_id))
    return result.scalar_one()


@router.delete("/{task_id}", status_code=204)
async def delete_task(task_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await db.delete(task)
    await db.commit()
