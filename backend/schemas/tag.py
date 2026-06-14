from pydantic import BaseModel, Field


class TagCreate(BaseModel):
    name: str
    color: str = Field(pattern=r"^#[0-9A-Fa-f]{6}$", description="Hex color, e.g. #FF5733")


class TagResponse(BaseModel):
    id: int
    name: str
    color: str

    model_config = {"from_attributes": True}
