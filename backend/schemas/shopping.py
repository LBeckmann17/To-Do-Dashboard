from typing import Optional

from pydantic import BaseModel

from models.shopping import ShoppingCategory


class ShoppingItemCreate(BaseModel):
    name: str
    category: Optional[ShoppingCategory] = None
    estimated_price: Optional[float] = None


class ShoppingItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[ShoppingCategory] = None
    estimated_price: Optional[float] = None
    is_completed: Optional[bool] = None


class ShoppingItemResponse(BaseModel):
    id: int
    name: str
    category: ShoppingCategory
    estimated_price: Optional[float]
    is_completed: bool
    auto_categorized: bool

    model_config = {"from_attributes": True}


class ShoppingTotal(BaseModel):
    total_price: float
    item_count: int
