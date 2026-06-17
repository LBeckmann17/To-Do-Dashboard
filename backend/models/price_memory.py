from sqlalchemy import Column, DateTime, Float, Integer, String
from sqlalchemy.sql import func

from database import Base


class PriceMemory(Base):
    __tablename__ = "price_memory"

    id = Column(Integer, primary_key=True, index=True)
    name_normalized = Column(String(500), nullable=False, unique=True, index=True)
    price = Column(Float, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
