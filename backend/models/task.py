import enum
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Table
from sqlalchemy.orm import relationship

from database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ListType(str, enum.Enum):
    work = "work"
    private = "private"
    cleaning = "cleaning"
    shopping = "shopping"


class Priority(str, enum.Enum):
    urgent = "urgent"
    high = "high"
    medium = "medium"
    low = "low"


task_tags = Table(
    "task_tags",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("tasks.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    list_type = Column(Enum(ListType, name="list_type"), nullable=False)
    priority = Column(Enum(Priority, name="priority"), nullable=False)
    deadline = Column(DateTime(timezone=True), nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)
    is_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False)

    subtasks = relationship("Subtask", back_populates="task", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=task_tags, back_populates="tasks")
