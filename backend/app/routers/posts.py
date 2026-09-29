from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Post
from ..schemas import PostListResponse, PostResponse, PostWrite

router = APIRouter(prefix="/api/posts", tags=["posts"])
PAGE_SIZE = 20
VALID_SEARCH_TYPES = {"title", "content", "title_content"}


def build_search_conditions(search: str, search_type: str):
    """검색어를 AND 조건으로 만들고 LIKE의 %/_를 일반 문자로 취급한다."""
    terms = search.strip().split()
    conditions = []

    for term in terms:
        # PostgreSQL LIKE에서 의미가 있는 문자를 escape한다.
        escaped = term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        pattern = f"%{escaped}%"

        if search_type == "title":
            conditions.append(Post.title.ilike(pattern, escape="\\"))
        elif search_type == "content":
            conditions.append(Post.content.ilike(pattern, escape="\\"))
        else:
            conditions.append(
                or_(
                    Post.title.ilike(pattern, escape="\\"),
                    Post.content.ilike(pattern, escape="\\"),
                )
            )
    return conditions


@router.get("", response_model=PostListResponse)
def list_posts(
    search: str = "",
    search_type: str = Query("title_content"),
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),
):
    if search_type not in VALID_SEARCH_TYPES:
        raise HTTPException(status_code=422, detail="Invalid search_type")

    conditions = build_search_conditions(search, search_type)
    count_stmt = select(func.count(Post.id))
    if conditions:
        count_stmt = count_stmt.where(*conditions)

    # COUNT를 먼저 수행해야 현재 검색 결과에 대한 total_pages와
    # 요청 page의 유효성을 확정할 수 있다.
    total_count = db.scalar(count_stmt) or 0
    total_pages = ceil(total_count / PAGE_SIZE) if total_count else 0

    # 빈 데이터셋에서는 page=1만 특별히 허용한다.
    if page > total_pages and not (total_pages == 0 and page == 1):
        raise HTTPException(status_code=422, detail="Page out of range")

    stmt = select(Post).order_by(Post.created_at.desc()).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE)
    if conditions:
        stmt = stmt.where(*conditions)

    posts = list(db.scalars(stmt).all())
    return PostListResponse(
        posts=posts,
        page=page,
        total_count=total_count,
        total_pages=total_pages,
    )


@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(payload: PostWrite, db: Session = Depends(get_db)):
    post = Post(title=payload.title, content=payload.content)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.put("/{post_id}", response_model=PostResponse)
def update_post(post_id: int, payload: PostWrite, db: Session = Depends(get_db)):
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    post.title = payload.title
    post.content = payload.content
    # updated_at은 PostgreSQL trigger가 UPDATE 자체를 기준으로 갱신한다.
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, db: Session = Depends(get_db)):
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    db.delete(post)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
