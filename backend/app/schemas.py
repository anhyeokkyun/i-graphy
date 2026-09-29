from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PostWrite(BaseModel):
    """POST/PUT에서 공통으로 사용하는 게시글 입력 스키마."""

    title: str = Field(min_length=1, max_length=255)
    # content는 빈 문자열을 허용하지만 필드 자체는 반드시 존재해야 한다.
    content: str


class PostListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    created_at: datetime
    updated_at: datetime


class PostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    created_at: datetime
    updated_at: datetime


class PostListResponse(BaseModel):
    posts: list[PostListItem]
    page: int
    total_count: int
    total_pages: int
