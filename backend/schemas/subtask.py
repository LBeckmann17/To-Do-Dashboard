from pydantic import BaseModel


class SubtaskCreate(BaseModel):
    title: str


class SubtaskResponse(BaseModel):
    id: int
    task_id: int
    title: str
    is_completed: bool

    model_config = {"from_attributes": True}
