from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models.tag import Tag
from models.task import Task
from schemas.tag import TagCreate, TagResponse

router = APIRouter(tags=["tags"])


@router.get("/tags", response_model=List[TagResponse])
async def get_tags(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tag).order_by(Tag.name))
    return result.scalars().all()


@router.post("/tags", response_model=TagResponse, status_code=201)
async def create_tag(data: TagCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tag).where(Tag.name == data.name))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Tag name already exists")
    tag = Tag(**data.model_dump())
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    return tag


@router.delete("/tags/{tag_id}", status_code=204)
async def delete_tag(tag_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tag).where(Tag.id == tag_id))
    tag = result.scalar_one_or_none()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    await db.delete(tag)
    await db.commit()


@router.post("/tasks/{task_id}/tags/{tag_id}", status_code=201, tags=["tasks"])
async def assign_tag(task_id: int, tag_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Task).where(Task.id == task_id).options(selectinload(Task.tags))
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    result = await db.execute(select(Tag).where(Tag.id == tag_id))
    tag = result.scalar_one_or_none()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    if tag not in task.tags:
        task.tags.append(tag)
        await db.commit()
    return {"message": "Tag assigned"}


@router.delete("/tasks/{task_id}/tags/{tag_id}", status_code=204, tags=["tasks"])
async def remove_tag(task_id: int, tag_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Task).where(Task.id == task_id).options(selectinload(Task.tags))
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    result = await db.execute(select(Tag).where(Tag.id == tag_id))
    tag = result.scalar_one_or_none()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    if tag in task.tags:
        task.tags.remove(tag)
        await db.commit()
