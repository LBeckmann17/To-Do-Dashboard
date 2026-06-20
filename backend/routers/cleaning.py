from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.cleaning import CleaningTask, calculate_next_due
from schemas.cleaning import CleaningTaskCreate, CleaningTaskResponse, CleaningTaskUpdate

router = APIRouter(prefix="/cleaning-tasks", tags=["cleaning"])


@router.get("", response_model=List[CleaningTaskResponse])
async def get_cleaning_tasks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CleaningTask).order_by(CleaningTask.category, CleaningTask.title)
    )
    return result.scalars().all()


@router.post("", response_model=CleaningTaskResponse, status_code=201)
async def create_cleaning_task(data: CleaningTaskCreate, db: AsyncSession = Depends(get_db)):
    task = CleaningTask(**data.model_dump())
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.put("/{task_id}", response_model=CleaningTaskResponse)
async def update_cleaning_task(
    task_id: int, data: CleaningTaskUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(CleaningTask).where(CleaningTask.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Cleaning task not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    await db.commit()
    await db.refresh(task)
    return task


@router.patch("/{task_id}/complete", response_model=CleaningTaskResponse)
async def complete_cleaning_task(task_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CleaningTask).where(CleaningTask.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Cleaning task not found")
    now = datetime.now(timezone.utc)
    task.last_completed_at = now
    task.next_due_at = calculate_next_due(now, task.recurrence_interval)
    await db.commit()
    await db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
async def delete_cleaning_task(task_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CleaningTask).where(CleaningTask.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Cleaning task not found")
    await db.delete(task)
    await db.commit()
