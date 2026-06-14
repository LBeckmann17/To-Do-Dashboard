from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from models.task import ListType, Priority


class SubtaskBrief(BaseModel):
    id: int
    task_id: int
    title: str
    is_completed: bool

    model_config = {"from_attributes": True}


class TagBrief(BaseModel):
    id: int
    name: str
    color: str

    model_config = {"from_attributes": True}


class TaskCreate(BaseModel):
    title: str
    list_type: ListType
    priority: Priority
    deadline: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    list_type: Optional[ListType] = None
    priority: Optional[Priority] = None
    deadline: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None
    is_completed: Optional[bool] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    list_type: ListType
    priority: Priority
    deadline: Optional[datetime]
    duration_minutes: Optional[int]
    notes: Optional[str]
    is_completed: bool
    created_at: datetime
    updated_at: datetime
    subtasks: List[SubtaskBrief] = []
    tags: List[TagBrief] = []

    model_config = {"from_attributes": True}
