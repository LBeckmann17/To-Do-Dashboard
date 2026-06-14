from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from database import Base
from .task import task_tags


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    color = Column(String(7), nullable=False)

    tasks = relationship("Task", secondary=task_tags, back_populates="tags")
