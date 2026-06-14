from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.subtask import Subtask
from models.task import Task
from schemas.subtask import SubtaskCreate, SubtaskResponse

router = APIRouter(prefix="/tasks/{task_id}/subtasks", tags=["subtasks"])


async def _get_task_or_404(task_id: int, db: AsyncSession) -> Task:
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("", response_model=List[SubtaskResponse])
async def get_subtasks(task_id: int, db: AsyncSession = Depends(get_db)):
    await _get_task_or_404(task_id, db)
    result = await db.execute(
        select(Subtask).where(Subtask.task_id == task_id).order_by(Subtask.id)
    )
    return result.scalars().all()


@router.post("", response_model=SubtaskResponse, status_code=201)
async def create_subtask(task_id: int, data: SubtaskCreate, db: AsyncSession = Depends(get_db)):
    await _get_task_or_404(task_id, db)
    subtask = Subtask(task_id=task_id, **data.model_dump())
    db.add(subtask)
    await db.commit()
    await db.refresh(subtask)
    return subtask


@router.patch("/{subtask_id}/complete", response_model=SubtaskResponse)
async def toggle_subtask_complete(
    task_id: int, subtask_id: int, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Subtask).where(Subtask.id == subtask_id, Subtask.task_id == task_id)
    )
    subtask = result.scalar_one_or_none()
    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found")
    subtask.is_completed = not subtask.is_completed
    await db.commit()
    await db.refresh(subtask)
    return subtask


@router.delete("/{subtask_id}", status_code=204)
async def delete_subtask(task_id: int, subtask_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Subtask).where(Subtask.id == subtask_id, Subtask.task_id == task_id)
    )
    subtask = result.scalar_one_or_none()
    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found")
    await db.delete(subtask)
    await db.commit()
