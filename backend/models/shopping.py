import enum

from sqlalchemy import Boolean, Column, Enum, Float, Integer, String

from database import Base


class ShoppingCategory(str, enum.Enum):
    meat = "meat"
    dairy = "dairy"
    vegetables_fruits = "vegetables_fruits"
    spices = "spices"
    household = "household"
    bakery = "bakery"
    beverages = "beverages"
    frozen = "frozen"
    snacks = "snacks"
    pantry = "pantry"
    drugstore = "drugstore"
    other = "other"


class ShoppingItem(Base):
    __tablename__ = "shopping_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500), nullable=False)
    # native_enum=False stores as VARCHAR — no ALTER TYPE needed when adding new values
    category = Column(
        Enum(ShoppingCategory, name="shopping_category", native_enum=False),
        nullable=False,
        default=ShoppingCategory.other,
    )
    estimated_price = Column(Float, nullable=True)
    is_completed = Column(Boolean, default=False, nullable=False)
    auto_categorized = Column(Boolean, default=True, nullable=False)
