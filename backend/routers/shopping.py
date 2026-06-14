from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.shopping import ShoppingCategory, ShoppingItem
from schemas.shopping import (
    ShoppingItemCreate,
    ShoppingItemResponse,
    ShoppingItemUpdate,
    ShoppingTotal,
)
from services.auto_categorize import auto_categorize

router = APIRouter(prefix="/shopping-items", tags=["shopping"])


@router.get("", response_model=List[ShoppingItemResponse])
async def get_shopping_items(
    category: Optional[ShoppingCategory] = None,
    is_completed: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ShoppingItem)
    if category is not None:
        stmt = stmt.where(ShoppingItem.category == category)
    if is_completed is not None:
        stmt = stmt.where(ShoppingItem.is_completed == is_completed)
    result = await db.execute(stmt.order_by(ShoppingItem.category, ShoppingItem.name))
    return result.scalars().all()


# /total must be defined before /{item_id} so the static segment is matched first
@router.get("/total", response_model=ShoppingTotal)
async def get_shopping_total(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(
            func.coalesce(func.sum(ShoppingItem.estimated_price), 0.0),
            func.count(ShoppingItem.id),
        ).where(ShoppingItem.is_completed == False)  # noqa: E712
    )
    total_price, item_count = result.one()
    return ShoppingTotal(total_price=float(total_price), item_count=item_count)


@router.post("", response_model=ShoppingItemResponse, status_code=201)
async def create_shopping_item(data: ShoppingItemCreate, db: AsyncSession = Depends(get_db)):
    auto_cat = data.category is None
    category = data.category if not auto_cat else auto_categorize(data.name)
    item = ShoppingItem(
        name=data.name,
        category=category,
        estimated_price=data.estimated_price,
        auto_categorized=auto_cat,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.put("/{item_id}", response_model=ShoppingItemResponse)
async def update_shopping_item(
    item_id: int, data: ShoppingItemUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(ShoppingItem).where(ShoppingItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Shopping item not found")
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    # Re-run auto-categorization when name changes and no explicit category was given
    if "name" in update_data and "category" not in update_data and item.auto_categorized:
        item.category = auto_categorize(item.name)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{item_id}/complete", response_model=ShoppingItemResponse)
async def toggle_shopping_item(item_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ShoppingItem).where(ShoppingItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Shopping item not found")
    item.is_completed = not item.is_completed
    await db.commit()
    await db.refresh(item)
    return item


# /completed must be defined before /{item_id} for the DELETE method
@router.delete("/completed", status_code=204)
async def delete_completed_items(db: AsyncSession = Depends(get_db)):
    await db.execute(delete(ShoppingItem).where(ShoppingItem.is_completed == True))  # noqa: E712
    await db.commit()


@router.delete("/{item_id}", status_code=204)
async def delete_shopping_item(item_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ShoppingItem).where(ShoppingItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Shopping item not found")
    await db.delete(item)
    await db.commit()
