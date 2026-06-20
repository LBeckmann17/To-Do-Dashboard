from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from models.cleaning import CleaningCategory, RecurrenceInterval


class CleaningTaskCreate(BaseModel):
    title: str
    category: CleaningCategory = CleaningCategory.general
    recurrence_interval: RecurrenceInterval = RecurrenceInterval.weekly
    notes: Optional[str] = None


class CleaningTaskUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[CleaningCategory] = None
    recurrence_interval: Optional[RecurrenceInterval] = None
    notes: Optional[str] = None


class CleaningTaskResponse(BaseModel):
    id: int
    title: str
    category: CleaningCategory
    recurrence_interval: RecurrenceInterval
    last_completed_at: Optional[datetime]
    next_due_at: Optional[datetime]
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
